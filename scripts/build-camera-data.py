#!/usr/bin/env python3
"""Build the CityMETER · Camera Shops demo data from the research master.

  python3 scripts/build-camera-data.py --research <dir of tab CSVs> --build <CAMERA_WORK of scripts/host-links> \
      --buildings <master venue-buildings geojson> --lux-logos <montri-th/luxurybrands checkout>

Inputs (not committed — internal working references):
  research/    one CSV per tab of “CityMETER Camera Shops Thailand — Research Master 2026-10-22”, revision
               2026-10-22 13:13 UTC (00_README … 13_BUILDINGS, 99_APPROVED_SCOPE)
  build/       venues_resolved.json  the master's venue join, every host re-read from production (host-links 03)
               locales.geojson       CityMETER production Locales that hold a joined Bangkok venue (host-links 04)
               venue-logos-dl/       venue-logo files downloaded from the sheet's Drive links
  --buildings  the master's building join, “CityMETER_Camera_Shops_Venue_Buildings_2026-10-22.geojson” (the file the
               master's README names for further use); every feature is checked against tab 13_BUILDINGS
  --lux-logos  the Luxury Brands 0.5 verified venue-logo files (same sheet sha256), reused where both datasets share a venue

Outputs:
  data/camera.json, data/neighborhoods.geojson, data/venue-buildings.geojson, data/brand-logos.json,
  data/venue-logos.json, assets/venue-logos/*, assets/venue-logos-manifest.json

Rules carried from the Luxury Brands contract: one row = one outlet record and is never merged or dropped to improve
counts. The research master decides which outlets have a host point (venue_join_status = จับคู่ venue แล้ว) and which
host building they belong to; this build verifies and maps, it never adds, moves or upgrades a join. Host points are
CityMETER Shopping Center detail points, never shopfronts; missing stays missing (null); no nearest-neighbour joins;
no private (Drive) URLs and no phone numbers in public files.
"""
import argparse, csv, hashlib, json, re, shutil
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
API = 'https://landometer.com/api/v2/citymeter-v3'
AS_OF = '2026-10-22'
SHEET = 'CityMETER Camera Shops Thailand — Research Master 2026-10-22'
RESEARCH_REVISION = '2026-10-22T13:13:29Z'  # Drive modifiedTime of the exported revision
PRIVATE = re.compile(r'(^|\.)(drive\.google\.com|docs\.google\.com|drive\.usercontent\.google\.com|googleusercontent\.com)$')
# The master's venue_join_status (12_SPATIAL_JOIN, 02_STORES) → the row's venueJoin code.
VENUE_JOIN = {'จับคู่ venue แล้ว': 'joined', 'รอตรวจชื่อหรือขอบเขต': 'held',
              'มีชื่อ venue รอตรวจทะเบียน': 'awaiting_registry', 'ไม่มี venue ที่ยืนยัน': 'no_venue'}

def public_https(value):
    value = (value or '').strip()
    m = re.match(r'^https://([^/]+)', value)
    if not m or PRIVATE.search(m.group(1).lower()):
        return ''
    return value

PHONE = re.compile(r'(?<![\w-])(?:\+66[\s-]?|0)\d{1,2}[\s-]?\d{3}[\s-]?\d{3,4}(?![\w-])')
def no_phone(value):
    """Phone numbers never reach public files (research notes sometimes quote one)."""
    return PHONE.sub('[เบอร์โทรไม่เผยแพร่]', value or '').strip()

def iso(value):
    """Sheet dates are M/D/YYYY; keep ISO only."""
    value = (value or '').strip()
    m = re.match(r'^(\d{1,2})/(\d{1,2})/(\d{4})$', value)
    return f'{m.group(3)}-{int(m.group(1)):02d}-{int(m.group(2)):02d}' if m else value

def num(value):
    return None if value in ('', None) else float(value)

def read(dir_, name):
    return list(csv.DictReader(open(Path(dir_) / f'{name}.csv', encoding='utf-8')))

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--research', required=True)
    ap.add_argument('--build', required=True)
    ap.add_argument('--buildings', required=True, help='the master venue-buildings geojson (13_BUILDINGS as features)')
    ap.add_argument('--lux-logos', required=True, help='Luxury Brands repo root (data/venue-logos.json + assets/venue-logos/)')
    a = ap.parse_args()
    build = Path(a.build)

    brands = read(a.research, '01_BRANDS')
    stores = read(a.research, '02_STORES')
    links = read(a.research, '11_STORE_BRANDS')
    venues_tab = read(a.research, '07_VENUES')
    logos_tab = read(a.research, '10_VENUE_LOGOS')
    review_queue = read(a.research, '05_REVIEW_QUEUE')
    branch_review = read(a.research, '03_BRANCH_REVIEW')
    closed = read(a.research, '09_CLOSED_STORES')
    joins = {r['outlet_id']: r for r in read(a.research, '12_SPATIAL_JOIN')}
    resolved = {v['venueId']: v for v in json.load(open(build / 'venues_resolved.json'))}

    brand_by_id = {b['brand_id']: b for b in brands}
    segment_of = {b['brand_name']: b['segment'] for b in brands}
    # Counted banners per outlet: retail and host-counter banners; an operator is not an extra banner.
    banners = defaultdict(list)
    for l in links:
        if l['relationship'] == 'operator':
            continue
        name = brand_by_id.get(l['brand_id'], {}).get('brand_name') or l['brand_name']
        if name not in banners[l['outlet_id']]:
            banners[l['outlet_id']].append(name)

    rows = []
    for s in stores:
        j = joins[s['outlet_id']]
        join = VENUE_JOIN[j['venue_join_status']]  # an unknown status stops the build
        if s['venue_join_status'] != j['venue_join_status']:
            raise SystemExit(f"{s['outlet_id']}: venue_join_status differs between 02_STORES and 12_SPATIAL_JOIN")
        point = None
        if join == 'joined':
            v = resolved.get(s['venue_id'])
            point = (float(s['latitude']), float(s['longitude']))
            if not v or v.get('hostId') != s['citymeter_shopping_center_id'] or (v['latitude'], v['longitude']) != point:
                raise SystemExit(f"{s['outlet_id']}: host point differs from the verified venue join")
        elif s['latitude'] or s['longitude'] or s['citymeter_shopping_center_id']:
            raise SystemExit(f"{s['outlet_id']}: an outlet the master has not joined carries a host point")
        names = [s['brand_name']] + [b for b in banners.get(s['outlet_id'], []) if b != s['brand_name']]
        rows.append({
            'id': s['outlet_id'],
            'brand': s['brand_name'],
            'brands': names,
            'bannerSegments': [s['segment'] if i == 0 else segment_of.get(b, s['segment']) for i, b in enumerate(names)],
            'name': no_phone(s['store_name']),
            'venue': s['venue'] or '',
            'venueId': s['venue_id'] or '',
            'province': s['province'],
            'segment': s['segment'],
            'scope': s['scope_group'],
            'channel': s['retail_channel'],
            'format': s['store_format'],
            'origin': 'camera_research',
            'status': s['operating_status'],
            'identity': s['site_identity_status'],
            'release': s['release_status'],
            'role': s['source_record_role'],
            'cameraSales': s['camera_sales_status'],
            'evidence': s['evidence_status'],
            'sourceType': s['source_type'],
            'source': public_https(s['source_url']),
            'statusSource': public_https(s['status_source_url']),
            'mapUrl': public_https(s['map_url']),
            'checkedOn': iso(s['checked_on']),
            'address': no_phone(s['address']),
            'unit': no_phone(s['unit_floor']),
            'operator': no_phone(s['operator_name']),
            'latitude': point[0] if point else None,
            'longitude': point[1] if point else None,
            'geometryRole': s['geometry_role'] or 'not_collected',
            'geometryStatus': s['geometry_status'] or 'unresolved',
            'venueJoin': join,
            'coordinateSource': public_https(s['coordinate_source_url']) if point else '',
            # CityMETER Shopping Center id of the host the master joined (hostKind says which registry).
            'mallId': s['citymeter_shopping_center_id'] if point else '',
            'hostKind': 'shopping_center' if point else '',
            'dedupe': s['dedupe_status'],
            'note': no_phone(s['notes']),
        })

    # ---- centers (hosts) ----
    centers, seen = [], set()
    for v in sorted(resolved.values(), key=lambda x: x['label']):
        if v.get('latitude') is None or v['hostId'] in seen:
            continue
        seen.add(v['hostId'])
        cached = build / 'cm' / 'detail' / f"{v['hostId']}.json"
        det = (json.load(open(cached)).get('value') or {}) if cached.exists() else {}
        centers.append({'id': v['hostId'], 'externalId': v.get('externalId'), 'name': v.get('hostName') or v['label'],
                        'nameTh': v.get('hostNameTh') or '', 'latitude': v['latitude'], 'longitude': v['longitude'],
                        'type': v.get('hostType') or '', 'gla': v.get('gla'), 'glaSource': det.get('glaSource') or '',
                        'glaConfidence': det.get('glaConfidence') or '', 'kind': 'shopping_center',
                        'source': v['source'], 'match': v['basis']})

    # ---- brand registry ----
    outlets_by_brand = Counter()
    for r in rows:
        for b in r['brands']:
            outlets_by_brand[b] += 1
    registry = [{
        'id': b['brand_id'], 'name': b['brand_name'], 'scope': b['scope_group'], 'segment': b['segment'],
        'shopType': b['shop_type_th'], 'productCategory': [p.strip() for p in b['product_category'].split(';') if p.strip()],
        'aliases': [x.strip() for x in b['aliases'].split(';') if x.strip()], 'entityRole': b['entity_role'],
        'collection': b['branch_collection_status'], 'source': public_https(b['source_url']),
        'outlets': outlets_by_brand.get(b['brand_name'], 0),
    } for b in brands]

    mapped = [r for r in rows if r['latitude'] is not None]
    meta = {
        'asOf': AS_OF, 'checkedOn': AS_OF,
        'grain': 'one outlet record (point of sale, or a listed contact location) of a camera-shop banner; a co-branded storefront is one outlet with linked banners',
        'research': SHEET, 'researchRevision': RESEARCH_REVISION,
        'outlets': len(rows), 'defaultOutlets': sum(1 for r in rows if r['role'] == 'retail_outlet_listing'),
        'brandsApproved': len(brands), 'brandsWithOutlets': sum(1 for b in registry if b['outlets']),
        'linkedBannerRecords': sum(len(r['brands']) for r in rows),
        'venues': len(venues_tab), 'venuesWithHost': sum(1 for v in resolved.values() if v.get('latitude') is not None),
        'hostShoppingCenters': len(centers),
        'rowsWithCoordinates': len(mapped),
        'rowsWithoutCoordinates': len(rows) - len(mapped),
        'rowsWithoutVenue': sum(1 for r in rows if not r['venueId']),
        'venueJoin': {k: sum(1 for r in rows if r['venueJoin'] == k) for k in VENUE_JOIN.values()},
        'heldVenues': sorted({r['venue'] for r in rows if r['venueJoin'] == 'held'}),
        'reviewQueueNames': len(review_queue), 'branchReviewRows': len(branch_review),
        'closedBrands': [{'brand': c['brand_name'], 'status': c['operating_status'], 'closedOn': iso(c['closure_date']), 'source': public_https(c['source_url'])} for c in closed],
        'hostSource': 'Research master venue join (07_VENUES, 02_STORES, 12_SPATIAL_JOIN); every host re-read from the CityMETER Shopping Center public production API (detail/{id})',
        'limitations': [
            'Listings are source observations, not field-verified operating status.',
            'Coordinates are shopping-centre host points from the research master venue join, not shop entrances or floors.',
            'Outlets the research master has not joined to a host (held, awaiting a registry match, or without a venue) keep missing coordinates.',
            'Coverage is not a national census of camera retail.',
            'Do not infer sales, stock, spending or demographics from presence.',
        ],
    }
    ROOT.joinpath('data').mkdir(exist_ok=True)
    json.dump({'meta': meta, 'rows': rows, 'centers': centers, 'brands': registry},
              open(ROOT / 'data' / 'camera.json', 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))

    # ---- neighborhoods = CityMETER production Locales holding a camera venue ----
    loc = json.load(open(build / 'locales.geojson'))
    feats = []
    for f in sorted(loc['features'], key=lambda f: f['properties']['name']):
        lid = f['id']
        feats.append({'type': 'Feature', 'id': lid, 'geometry': f['geometry'], 'properties': {
            'id': lid, 'name': f['properties']['name'], 'nameTh': f['properties']['name'], 'nameEn': f['properties'].get('nameEn') or '',
            'provinceCode': 'BKK', 'provinceName': 'กรุงเทพมหานคร', 'priority': 1,
            'status': 'production_locale', 'checkedOn': AS_OF,
            'boundaryType': 'citymeter_production_locale',
            'boundaryAuthority': 'CityMETER production Locale (Locale Insight); navigation and analysis unit, not statutory',
            'definition': f"Locale “{f['properties']['name']}” ของ CityMETER production — ขอบเขตเดียวกับหน้า /v3/citymeter/BKK/L/{lid}",
            'geometryMethod': 'Decoded from production base/mvt/ML vector tiles at z15; per-tile pieces of one Locale id unioned; simplified at about 0.5 m.',
            'productionUrl': f'https://landometer.com/v3/citymeter/BKK/L/{lid}?d=shoppingCenter',
            'sourceURLs': [f'https://landometer.com/v3/citymeter/BKK/L/{lid}?d=shoppingCenter'],
        }})
    # Membership check: point-in-polygon on these display polygons must equal production base/locatePoint
    # (recorded per Bangkok venue by host-links 03) for every Bangkok host point.
    from shapely.geometry import shape as _shape, Point as _Point
    polys = [(f['id'], _shape(f['geometry'])) for f in feats]
    agree = total = 0
    for v in resolved.values():
        if v.get('latitude') is None or v.get('province') != 'กรุงเทพมหานคร':
            continue
        total += 1
        hits = [i for i, poly in polys if poly.covers(_Point(v['longitude'], v['latitude']))]
        if hits == [(v.get('locale') or {}).get('id')]:
            agree += 1
        else:
            raise SystemExit(f"Locale membership differs from production locatePoint for {v['label']}: {hits} vs {v.get('locale')}")
    json.dump({'type': 'FeatureCollection', 'name': 'CityMETER production Locales holding camera venues',
               'metadata': {'version': f'{AS_OF}-r2', 'checkedOn': AS_OF, 'methodURL': 'docs/NEIGHBORHOOD_METHOD.md',
                            'crs': 'OGC:CRS84 / WGS84 longitude, latitude',
                            'coverage': 'Bangkok Locales of CityMETER production that contain at least one joined camera venue host point. Production has no Locales outside Bangkok.',
                            'membership': 'Point-in-polygon on the host point, independent of filters; no nearest fallback.',
                            'membershipCheck': f'{agree}/{total} Bangkok host points: point-in-polygon on these polygons equals production base/locatePoint (checked {AS_OF})',
                            'source': f'{API}/base/mvt/ML/{{z}}/{{x}}/{{y}} (production Locale tiles); ids equal production Locale uuids',
                            'provinceCodes': 'provinceCode = CityMETER production province path code'},
               'features': feats}, open(ROOT / 'data' / 'neighborhoods.geojson', 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))

    # ---- host buildings = the research master's building join ----
    master = json.load(open(a.buildings))
    tab = {r['geometry_sha256']: r for r in read(a.research, '13_BUILDINGS')}
    by_id = {r['id']: r for r in rows}
    out_feats, matched, hosts = [], set(), set()
    for f in master['features']:
        p = f['properties']
        t = tab.get(hashlib.sha256(json.dumps(f['geometry'], separators=(',', ':')).encode()).hexdigest())
        if not t or t['building_id'] != f['id']:
            raise SystemExit(f"building {f['id']}: no 13_BUILDINGS row with the same id and geometry sha256")
        outs = sorted(p.get('camera_outlet_ids') or [])
        mids = list(p.get('source_citymeter_venue_ids') or [])
        if int(t['linked_outlet_count'] or 0) != len(outs):
            raise SystemExit(f"building {f['id']}: linked outlet count differs from 13_BUILDINGS")
        for o in outs:
            r = by_id.get(o)
            if not r or r['venueJoin'] != 'joined' or r['mallId'] not in mids:
                raise SystemExit(f"building {f['id']}: outlet {o} is not a joined outlet of the building's host")
        part = p['geometry_role'] == 'host_building_part_not_shop_unit'
        status = p.get('height_status')
        # Display mapping (documented in DATA_METHOD.md): the master's render_as → the app's two modes.
        mode = p.get('render_as')
        if mode == 'source_footprint':
            mode = 'outline' if status == 'unknown_parent_height_parts_owned' else 'extrusion'
        elif mode is None and part:
            mode = 'extrusion'
        if mode not in ('extrusion', 'outline'):
            raise SystemExit(f"building {f['id']}: unknown render_as {p.get('render_as')!r}")
        if part:
            base, top = num(t['base_m']) or 0.0, num(t['top_m'])
            height_m, base_m = top, base
            disp_h = num(p.get('display_height_m')) if p.get('display_height_m') is not None else top
            disp_b = num(p.get('display_base_m')) if p.get('display_base_m') is not None else base
        else:
            height_m, base_m = num(p.get('height_m')), num(p.get('base_m')) or 0.0
            disp_h, disp_b = num(p.get('display_height_m')), num(p.get('display_base_m')) or 0.0
        if num(t['display_height_m']) not in (None, disp_h) or (not part and num(t['height_m']) != height_m) or t['height_status'] != status:
            raise SystemExit(f"building {f['id']}: heights differ from 13_BUILDINGS")
        if mode == 'extrusion' and disp_h is None:
            raise SystemExit(f"building {f['id']}: extruded without a display height")
        rs = [by_id[o] for o in outs]
        matched.update(outs)
        hosts.update(mids)
        out_feats.append({'type': 'Feature', 'id': f['id'], 'geometry': f['geometry'], 'properties': {
            'host_id': p['host_id'], 'building_id': f['id'], 'parent_building_id': t['parent_building_id'] or None,
            'osm_type': p.get('osm_type'), 'osm_id': p.get('osm_id'), 'osm_version': p.get('osm_version'),
            'osm_timestamp': p.get('osm_timestamp'), 'citymeter_building_id': p.get('citymeter_building_id'),
            'source_url': public_https(p.get('source_url')), 'raw_source_url': public_https(p.get('raw_source_url')) or None,
            'citymeter_source_url': public_https(p.get('citymeter_source_url')) or None,
            'geometry_source': p.get('geometry_source'), 'geometry_role': p['geometry_role'],
            'attribution': f"{t['attribution']} ({t['license'].replace('-', ' ')})", 'license': t['license'],
            'join_method': '; '.join(p.get('camera_join_methods') or []),
            'outlet_ids': outs, 'mall_ids': mids, 'venue_ids': list(p.get('camera_venue_ids') or []),
            'venue_names': sorted({r['venue'] for r in rs}),
            'source_names': list(dict.fromkeys(p.get('source_names') or [])),
            'retrieved_on': p.get('retrieved_on'),
            'height_m': height_m, 'base_m': base_m, 'display_height_m': disp_h, 'display_base_m': disp_b,
            'height_status': status, 'height_note': p.get('height_note'),
            'render_as': mode, 'source_render_as': p.get('render_as'),
        }})
    if len(out_feats) != len(tab):
        raise SystemExit(f'{len(out_feats)} building features vs {len(tab)} rows in 13_BUILDINGS')
    json.dump({'type': 'FeatureCollection', 'metadata': {
        'as_of': AS_OF, 'scope': 'Host buildings of camera-shop outlets (a footprint is the host building, not the shop unit)',
        'source': f'{SHEET} (revision {RESEARCH_REVISION}): building join, tab 13_BUILDINGS and its feature file CityMETER_Camera_Shops_Venue_Buildings_2026-10-22.geojson; every feature equals its 13_BUILDINGS row (id, geometry sha256, heights, linked outlets)',
        'attribution': '© OpenStreetMap contributors (ODbL 1.0)', 'license': master['metadata'].get('license'),
        'rules': master['metadata'].get('rules', []),
        'renderMapping': {'extrusion': 'extrusion', 'outline': 'outline', 'source_footprint': 'extrusion (outline when height_status is unknown_parent_height_parts_owned: the parts carry the heights)',
                          'none (building part)': 'extrusion between base_m and top_m of 13_BUILDINGS'},
        'rows': len(rows), 'mapped_rows': len(mapped), 'matched_rows': len(matched), 'host_venues': len(hosts), 'features': len(out_feats),
        'limitations': ['Original footprints and parts only; no rectangles, circles or nearest-building replacements.',
                        'A building is the host building of the joined venue (point containment and host identity tested separately by the research master); it does not prove floor, unit or entrance.',
                        'Heights are source or model estimates, not surveys; 3 m is a display fallback when none is known.']},
        'features': out_feats}, open(ROOT / 'data' / 'venue-buildings.geojson', 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))

    # ---- brand logos: not collected for this dataset (sheet columns prepared, no files) ----
    json.dump({'meta': {'asOf': AS_OF, 'status': 'not_collected', 'note': 'Store-banner logos are not collected in the research master yet (01_BRANDS logo columns prepared, no files). Pins show the banner name as a text label instead.'}, 'brands': []},
              open(ROOT / 'data' / 'brand-logos.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

    # ---- venue logos ----
    lux_root = Path(a.lux_logos)
    lux_reg = json.load(open(lux_root / 'data' / 'venue-logos.json'))
    lux_assets = {x['sha256']: x for x in lux_reg['assets']}
    out_dir = ROOT / 'assets' / 'venue-logos'
    out_dir.mkdir(parents=True, exist_ok=True)
    assets, files, issues = {}, [], []
    from PIL import Image
    for t in logos_tab:
        if t['logo_status'] != 'ใช้ไฟล์เดิมที่ตรวจแล้ว' or not t['logo_sha256']:
            continue
        sha = t['logo_sha256'].lower()
        if sha in assets:
            continue
        name = t['logo_filename']
        candidates = [lux_root / 'assets' / 'venue-logos' / name, build / 'venue-logos-dl' / name]
        src = next((c for c in candidates if c.exists() and hashlib.sha256(c.read_bytes()).hexdigest() == sha), None)
        if not src:
            issues.append({'file': name, 'reason': 'no verified copy'}); continue
        raw = src.read_bytes()
        shutil.copyfile(src, out_dir / name)
        ext = name.rsplit('.', 1)[1].lower()
        mime = {'png': 'image/png', 'jpeg': 'image/jpeg', 'jpg': 'image/jpeg', 'svg': 'image/svg+xml'}[ext]
        if sha in lux_assets:
            la = lux_assets[sha]
            width, height, background = la['width'], la['height'], la['background']
            page, asset_url = la.get('sourcePage'), la.get('assetURL')
        else:
            if ext == 'svg':
                txt = raw.decode('utf-8')
                width = float(re.search(r'width="([\d.]+)"', txt).group(1)); height = float(re.search(r'height="([\d.]+)"', txt).group(1))
                background = '#E5E9E6'  # gold/grey mark on transparent → stone backplate (same rule as Luxury Brands)
            else:
                im = Image.open(src).convert('RGBA'); width, height = im.size
                raw_px = im.tobytes(); px = [tuple(raw_px[i:i + 4]) for i in range(0, len(raw_px), 4)]
                opaque = [(r, g, b) for r, g, b, al in px if al > 127]
                has_alpha = len(opaque) < width * height * 0.98
                lum = (sum(0.2126 * r + 0.7152 * g + 0.0722 * b for r, g, b in opaque) / (255 * len(opaque))) if opaque else 1
                background = ('#182327' if lum > 0.8 else '#E5E9E6') if has_alpha else '#FFFFFF'
            page, asset_url = public_https(t['logo_source_url']) or None, public_https(t['logo_asset_url']) or None
        assets[sha] = {'key': t['logo_key'], 'file': f'assets/venue-logos/{name}', 'mime': mime, 'bytes': len(raw), 'sha256': sha,
                       'width': round(float(width), 2), 'height': round(float(height), 2), 'background': background,
                       'sourcePage': page, 'assetURL': asset_url, 'sourceKind': 'official_venue'}
        files.append({'path': f'assets/venue-logos/{name}', 'sha256': sha, 'bytes': len(raw), 'logoKey': t['logo_key'],
                      'sourcePage': page, 'assetURL': asset_url, 'checkedOn': iso(t['logo_checked_on']) or AS_OF,
                      'origin': 'luxury_brands_install_set' if sha in lux_assets else 'research_sheet_drive_file'})
    keys = {x['key'] for x in assets.values()}
    venue_entries, center_entries = [], {}
    for t in logos_tab:
        key = t['logo_key'] if t['logo_key'] in keys else None
        venue_entries.append({'label': t['venue_label'], 'canonical': t['canonical_venue_name'] or t['venue_label'], 'type': t['venue_type'],
                              'role': t['logo_role'] if key else 'none', 'key': key, 'status': 'verified_file' if key else 'not_collected'})
        vr = resolved.get(t['venue_id'])
        if key and vr and vr.get('host') == 'citymeter_shopping_center':
            center_entries.setdefault(vr['hostId'], {'id': vr['hostId'], 'name': vr.get('hostName') or t['venue_label'], 'label': t['venue_label'], 'key': key, 'role': t['logo_role']})
    reg = {'meta': {'asOf': AS_OF, 'version': f'{AS_OF}-r1', 'count': len(assets), 'expected': len(assets) + len(issues), 'folder': 'assets/venue-logos/',
                    'registry': f'{SHEET}, tab 10_VENUE_LOGOS', 'pending': [], 'missing': [],
                    'status': 'complete' if not issues else f'partial: {len(issues)} files without a verified copy',
                    'counts': {'labels': len(logos_tab), 'labels_with_logo': sum(1 for v in venue_entries if v['key']), 'files': len(assets),
                               'shopping_center_links': len(center_entries)},
                    'roles': {'venue_specific': 'โลโก้ของสถานที่โดยตรง', 'parent_complex': 'โลโก้โครงการแม่', 'shared_department_store_banner': 'แบนเนอร์ห้างสรรพสินค้าที่ใช้ร่วมกัน', 'shared_chain_banner': 'แบนเนอร์เครือที่ใช้ร่วมกัน', 'none': 'ไม่มีโลโก้ venue'},
                    'identityRole': 'Identify the venue (host) of observed outlets in the venue panel, venue lists and store details; the venue name stays the record of identity',
                    'backgroundRule': 'transparent marks on #E5E9E6 (LDS surface-soft stone), light transparent marks on #182327, opaque files on #FFFFFF; artwork bytes unchanged',
                    'licenseNote': 'การรวบรวมไฟล์ไม่ใช่ใบอนุญาตเครื่องหมายการค้า สิทธิ์ยังเป็นของเจ้าของ',
                    'reuse': f"{sum(1 for f in files if f['origin'] == 'luxury_brands_install_set')} files byte-identical to the Luxury Brands install set, {sum(1 for f in files if f['origin'] != 'luxury_brands_install_set')} downloaded from the sheet's Drive file links; every file matches the sheet sha256 (Drive links are not published)"},
           'assets': list(assets.values()), 'venues': venue_entries, 'centers': list(center_entries.values()), 'issues': issues}
    json.dump(reg, open(ROOT / 'data' / 'venue-logos.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    json.dump({'checkedOn': AS_OF, 'source': reg['meta']['registry'], 'status': reg['meta']['status'], 'files': files, 'issues': issues},
              open(ROOT / 'assets' / 'venue-logos-manifest.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

    print(json.dumps(meta, ensure_ascii=False, indent=1))
    print('centers', len(centers), 'neighborhoods', len(feats), 'host features', len(out_feats), 'host venues', len(hosts), 'matched rows', len(matched))
    print('venue logos', len(assets), 'labels with logo', reg['meta']['counts']['labels_with_logo'], 'centers', len(center_entries), 'issues', issues)

if __name__ == '__main__':
    main()

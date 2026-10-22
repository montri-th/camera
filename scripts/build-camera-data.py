#!/usr/bin/env python3
"""Build the CityMETER · Camera Shops demo data from the research master and verified CityMETER links.

  python3 scripts/build-camera-data.py --research <dir of tab CSVs> --build <dir of verified host links>

Inputs (not committed — internal working references):
  research/   one CSV per tab of “CityMETER Camera Shops Thailand — Research Master 2026-10-22”
              (00_README … 99_APPROVED_SCOPE)
  build/      venues_resolved.json   (venue → CityMETER host, verified by build-host-links)
              host_buildings_citymeter.json (CityMETER building footprints accepted per venue)
              locales.geojson        (CityMETER production Locales that hold a camera venue)
              venue-logos-dl/        (venue-logo files downloaded from the sheet's Drive links)
  --lux-buildings / --lux-logos  the Luxury Brands 0.5 host footprints and verified logo files
              (same OSM ways / same sheet sha256), reused for venues both datasets share

Outputs:
  data/camera.json, data/neighborhoods.geojson, data/venue-buildings.geojson, data/brand-logos.json,
  data/venue-logos.json, assets/venue-logos/*, assets/venue-logos-manifest.json

Rules carried from the Luxury Brands contract: one row = one outlet record and is never merged or
dropped to improve counts; coordinates come only from a verified host (CityMETER Shopping Center or
Grocery record) and stay host-complex points, never shopfronts; missing stays missing (null); no
nearest-neighbour joins; no private (Drive) URLs in public files.
"""
import argparse, csv, hashlib, json, math, re, shutil
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
API = 'https://landometer.com/api/v2/citymeter-v3'
AS_OF = '2026-10-22'
SHEET = 'CityMETER Camera Shops Thailand — Research Master 2026-10-22'
PRIVATE = re.compile(r'(^|\.)(drive\.google\.com|docs\.google\.com|drive\.usercontent\.google\.com|googleusercontent\.com)$')

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

def tile_xy(lng, lat, z):
    n = 2 ** z; lr = math.radians(lat)
    return int((lng + 180) / 360 * n), int((1 - math.log(math.tan(lr) + 1 / math.cos(lr)) / math.pi) / 2 * n)

def grocery_tile_sources(build, hosts):
    """The production Grocery overlay tile (z13) in which each hypermarket host record was read: the coordinate source."""
    import mapbox_vector_tile as mvt
    out = {}
    for v in hosts:
        x, y = tile_xy(v['longitude'], v['latitude'], 13)
        for fn in sorted((build / 'grocery').glob(f'*_13_{x}_{y}.pbf')):
            data = fn.read_bytes()
            if not data or data[:1] == b'{':
                continue
            if any(f['properties'].get('id') == v['hostId'] for layer in mvt.decode(data).values() for f in layer['features']):
                sub = fn.name.split('_13_')[0]
                out[v['hostId']] = f'{API}/grocery/overlayMvt/13/{x}/{y}?inTileId={sub}&inTileType=SUBDISTRICT'
                break
        if v['hostId'] not in out:
            raise SystemExit(f"grocery host {v['label']} ({v['hostId']}) not found in the cached overlay tiles")
    return out

def read(dir_, name):
    return list(csv.DictReader(open(Path(dir_) / f'{name}.csv', encoding='utf-8')))

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--research', required=True)
    ap.add_argument('--build', required=True)
    ap.add_argument('--lux-buildings', required=True)
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
    resolved = {v['venueId']: v for v in json.load(open(build / 'venues_resolved.json'))}
    grocery_tiles = grocery_tile_sources(build, [v for v in resolved.values() if v.get('host') == 'citymeter_grocery'])

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
        v = resolved.get(s['venue_id']) if s['venue_id'] else None
        has_point = bool(v and v.get('latitude') is not None)
        host_kind = (v or {}).get('host') or ''
        names = [s['brand_name']] + [b for b in banners.get(s['outlet_id'], []) if b != s['brand_name']]
        role = 'not_collected'; status = 'unresolved'; coord_src = ''
        if has_point and host_kind == 'citymeter_shopping_center':
            role, status = 'host_complex_point_not_shopfront', 'citymeter_shopping_center_host'
            coord_src = f"{API}/shopping-center/detail/{v['hostId']}"
        elif has_point and host_kind == 'citymeter_grocery':
            role, status = 'host_hypermarket_point_not_shopfront', 'citymeter_grocery_host'
            coord_src = grocery_tiles[v['hostId']]
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
            'latitude': v['latitude'] if has_point else None,
            'longitude': v['longitude'] if has_point else None,
            'geometryRole': role,
            'geometryStatus': status,
            'coordinateSource': coord_src,
            # CityMETER host record id: Shopping Center id, or the Grocery record id of a hypermarket host (hostKind says which).
            'mallId': v['hostId'] if has_point else '',
            'hostKind': {'citymeter_shopping_center': 'shopping_center', 'citymeter_grocery': 'grocery'}.get(host_kind, ''),
            'dedupe': s['dedupe_status'],
            'note': no_phone(s['notes']),
        })

    # ---- centers (hosts) ----
    centers, seen = [], set()
    for v in sorted(resolved.values(), key=lambda x: x['label']):
        if v.get('latitude') is None or v['hostId'] in seen:
            continue
        seen.add(v['hostId'])
        if v['host'] == 'citymeter_shopping_center':
            cached = build / 'cm' / 'detail' / f"{v['hostId']}.json"
            det = (json.load(open(cached)).get('value') or {}) if cached.exists() else {}
            centers.append({'id': v['hostId'], 'externalId': v.get('externalId'), 'name': v.get('hostName') or v['label'],
                            'nameTh': v.get('hostNameTh') or '', 'latitude': v['latitude'], 'longitude': v['longitude'],
                            'type': v.get('hostType') or '', 'gla': v.get('gla'), 'glaSource': det.get('glaSource') or '',
                            'glaConfidence': det.get('glaConfidence') or '', 'kind': 'shopping_center',
                            'source': v['source'], 'match': v['basis']})
        else:
            centers.append({'id': v['hostId'], 'externalId': None, 'name': v.get('hostName') or v['label'], 'nameTh': '',
                            'latitude': v['latitude'], 'longitude': v['longitude'], 'type': 'Hypermarket', 'gla': None,
                            'kind': 'grocery', 'sourceDataset': v.get('sourceDataset'), 'source': '', 'match': v['basis']})

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
        'research': SHEET,
        'outlets': len(rows), 'defaultOutlets': sum(1 for r in rows if r['role'] == 'retail_outlet_listing'),
        'brandsApproved': len(brands), 'brandsWithOutlets': sum(1 for b in registry if b['outlets']),
        'linkedBannerRecords': sum(len(r['brands']) for r in rows),
        'venues': len(venues_tab), 'venuesWithHost': sum(1 for v in resolved.values() if v.get('latitude') is not None),
        'hostShoppingCenters': sum(1 for c in centers if c['kind'] == 'shopping_center'),
        'hostGrocery': sum(1 for c in centers if c['kind'] == 'grocery'),
        'rowsWithCoordinates': len(mapped),
        'rowsWithoutCoordinates': len(rows) - len(mapped),
        'rowsWithoutVenue': sum(1 for r in rows if not r['venueId']),
        'researchSheetCoordinates': sum(1 for s in stores if s['latitude']),
        'reviewQueueNames': len(review_queue), 'branchReviewRows': len(branch_review),
        'closedBrands': [{'brand': c['brand_name'], 'status': c['operating_status'], 'closedOn': iso(c['closure_date']), 'source': public_https(c['source_url'])} for c in closed],
        'shoppingCenterSource': 'CityMETER Shopping Center public production API (detail/{id})',
        'grocerySource': 'CityMETER Grocery public production dataset (overlay tiles; Big C and Lotus\'s store locators as recorded by production)',
        'limitations': [
            'Listings are source observations, not field-verified operating status.',
            'Coordinates are host points (shopping centre or hypermarket), not shop entrances or floors.',
            'Street stores without a verified host keep missing coordinates.',
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
    # (recorded per Bangkok venue by build-host-links) for every Bangkok host point.
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
               'metadata': {'version': f'{AS_OF}-r1', 'checkedOn': AS_OF, 'methodURL': 'docs/NEIGHBORHOOD_METHOD.md',
                            'crs': 'OGC:CRS84 / WGS84 longitude, latitude',
                            'coverage': 'Bangkok Locales of CityMETER production that contain at least one camera venue host point. Production has no Locales outside Bangkok.',
                            'membership': 'Point-in-polygon on the host point, independent of filters; no nearest fallback.',
                            'membershipCheck': f'{agree}/{total} Bangkok host points: point-in-polygon on these polygons equals production base/locatePoint (checked {AS_OF})',
                            'source': f'{API}/base/mvt/ML/{{z}}/{{x}}/{{y}} (production Locale tiles); ids equal production Locale uuids',
                            'provinceCodes': 'provinceCode = CityMETER production province path code'},
               'features': feats}, open(ROOT / 'data' / 'neighborhoods.geojson', 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))

    # ---- host buildings ----
    rows_by_host = defaultdict(list)
    for r in rows:
        if r['mallId']:
            rows_by_host[r['mallId']].append(r)
    lux = json.load(open(a.lux_buildings))
    out_feats, covered = [], set()
    for f in lux['features']:
        mids = [m for m in (f['properties'].get('mall_ids') or []) if m in rows_by_host]
        if not mids:
            continue
        p = dict(f['properties'])
        rs = [r for m in mids for r in rows_by_host[m]]
        p['outlet_ids'] = sorted(r['id'] for r in rs)
        p['mall_ids'] = mids
        p['venue_names'] = sorted({r['venue'] for r in rs})
        p['join_method'] = 'luxury_brands_host_footprint_same_citymeter_center'
        out_feats.append({'type': 'Feature', 'id': f.get('id') or p['host_id'], 'geometry': f['geometry'], 'properties': p})
        covered.update(mids)
    cm = json.load(open(build / 'host_buildings_citymeter.json'))
    attribution = {'osm_geom': '© OpenStreetMap contributors (ODbL 1.0)', 'osm': '© OpenStreetMap contributors (ODbL 1.0)',
                   'globfp': 'Microsoft Global ML Building Footprints (ODbL 1.0)', 'ob_v3_supplement': 'Google Open Buildings v3 (CC BY 4.0 / ODbL 1.0)'}
    for d in cm:
        if not d['decision'].startswith('accepted') or d['hostId'] in covered:
            continue
        det = d.get('detail') or {}
        rs = rows_by_host.get(d['hostId'], [])
        if not rs:
            continue
        h = det.get('heightM')
        unknown = h is None or abs(float(h) - 3.5) < 1e-9
        src = det.get('source') or ''
        host_id = f"{det.get('osmType') or 'cm'}/{det.get('osmId') or d['hostId'][:8]}"
        out_feats.append({'type': 'Feature', 'id': host_id, 'geometry': d['geometry'], 'properties': {
            'host_id': host_id, 'osm_type': det.get('osmType'), 'osm_id': str(det.get('osmId') or '') or None,
            'source_url': f"https://www.openstreetmap.org/{det['osmType']}/{det['osmId']}" if det.get('osmId') and det.get('osmType') else f"{API}/building/detail?lng={d['longitude']}&lat={d['latitude']}",
            'geometry_source': f"CityMETER building V4 ({src})", 'attribution': attribution.get(src, 'CityMETER building'),
            'geometry_role': 'host_building_footprint_not_shop_unit',
            'join_method': 'citymeter_building_contains_host_point' if d['decision'] == 'accepted' else 'citymeter_building_named_like_venue_within_150m',
            'outlet_ids': sorted(r['id'] for r in rs), 'mall_ids': [d['hostId']],
            'venue_names': sorted({r['venue'] for r in rs}),
            'source_names': [n for n in (det.get('osmNameTh'), det.get('osmNameEn')) if n],
            'retrieved_on': AS_OF, 'license': attribution.get(src, ''),
            'citymeter_source_url': f"{API}/building/detail?lng={d['longitude']}&lat={d['latitude']}",
            'height_m': None if unknown else round(float(h), 2), 'base_m': 0,
            'display_height_m': 3 if unknown else round(float(h), 2), 'display_base_m': 0,
            'height_status': 'unknown_display_fallback' if unknown else 'citymeter_model_estimate',
            'render_as': 'extrusion',
            'height_note': 'ไม่มีข้อมูลความสูง ใช้ความสูงแสดงผล 3 ม. ไม่ใช่ความสูงจริง' if unknown else 'ความสูงจาก CityMETER building (แบบจำลอง/แท็ก OSM) ไม่ใช่ผลรังวัด',
        }})
        covered.add(d['hostId'])
    matched = {i for f in out_feats for i in f['properties']['outlet_ids']}
    json.dump({'type': 'FeatureCollection', 'metadata': {
        'as_of': AS_OF, 'scope': 'Host buildings of camera-shop outlets (a footprint is the host building, not the shop unit)',
        'sources': ['Luxury Brands 0.5 host footprints (OpenStreetMap API geometry, CityMETER building parts) for shared centres',
                    f'{API}/building/detail + building/detailMvt (V4) for the others'],
        'attribution': '; '.join(sorted({f['properties'].get('attribution') or '© OpenStreetMap contributors (ODbL 1.0)' for f in out_feats})),
        'rows': len(rows), 'mapped_rows': len(mapped), 'matched_rows': len(matched), 'host_venues': len(covered), 'features': len(out_feats),
        'limitations': ['Original footprints only; no rectangles, circles or nearest-building replacements.',
                        'Point containment (or an OSM name equal to the venue within 150 m) is the only join; it does not prove floor, unit or entrance.',
                        'Heights are source or model estimates; 3 m is a display fallback when none is known.']},
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
    print('centers', len(centers), 'neighborhoods', len(feats), 'host features', len(out_feats), 'host venues', len(covered), 'matched rows', len(matched))
    print('venue logos', len(assets), 'labels with logo', reg['meta']['counts']['labels_with_logo'], 'centers', len(center_entries), 'issues', issues)

if __name__ == '__main__':
    main()

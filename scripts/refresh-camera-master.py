#!/usr/bin/env python3
"""Project a refreshed, normalized research master without creating spatial joins.

The JSON input contains the named research tabs. Point availability and host joins
are independent: a sourced outlet pin can be published without a CityMETER host.
Only the master's accepted venue references become centers, and only its existing
building links use the retained building geometries. Public production locatePoint
receipts and production Locale polygons must agree for every coordinate pair.

  python3 scripts/refresh-camera-master.py --master <delivery-records.json> \
    --logos <complete-logo-library-manifest.json> --cache <private working cache>

Requires Pillow, shapely and mapbox-vector-tile. Inputs/cache stay outside the
public repository. Logo originals are copied byte-for-byte; the sprite embeds
those same bytes with contain positioning and a neutral backing.
"""
import argparse
import base64
import copy
import datetime as dt
import hashlib
import html
import json
import math
import re
import shutil
import urllib.parse
import urllib.request
from collections import Counter, defaultdict
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
API = 'https://landometer.com/api/v2/citymeter-v3'
BKK = 'a29ec31e-3a36-4ab7-9670-7cef38873c80'
PRIVATE = re.compile(r'(^|\.)(drive\.google\.com|docs\.google\.com|drive\.usercontent\.google\.com|googleusercontent\.com)$')
PHONE = re.compile(r'(?<![\w-])(?:\+66[\s-]?|0)\d{1,2}[\s-]?\d{3}[\s-]?\d{3,4}(?![\w-])')
JOIN_CODES = {
    'จับคู่ venue แล้ว': 'joined', 'รอตรวจชื่อหรือขอบเขต': 'held',
    'มีชื่อ venue รอตรวจทะเบียน': 'awaiting_registry', 'ไม่มี venue ที่ยืนยัน': 'no_venue',
    'ยืนยันชื่อ host จากแหล่งร้าน; ยังไม่จับคู่ทะเบียน': 'awaiting_registry',
    'ยืนยันชื่อ host และ crosswalk ทะเบียนเดิม; พิกัดอ้างอิง21Oct': 'joined',
}
MIMES = {'png': 'image/png', 'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'webp': 'image/webp', 'svg': 'image/svg+xml'}


def load(path):
    return json.loads(Path(path).read_text(encoding='utf-8'))


def write(path, value):
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    Path(path).write_text(json.dumps(value, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


def public_https(value):
    try:
        u = urllib.parse.urlsplit(str(value or '').strip())
        if u.scheme != 'https' or not u.hostname or u.username or u.password or PRIVATE.search(u.hostname.lower()):
            return ''
        return u.geturl()
    except ValueError:
        return ''


def text(value):
    s = PHONE.sub('[เบอร์โทรไม่เผยแพร่]', str(value or ''))
    return re.sub(r'https?://[^\s<>]+', lambda m: m[0] if public_https(m[0]) else '', s).strip()


def date(value):
    if value in ('', None):
        return ''
    if isinstance(value, (int, float)):
        return (dt.datetime(1899, 12, 30) + dt.timedelta(days=value)).date().isoformat()
    s = str(value).strip()
    m = re.fullmatch(r'(\d{1,2})/(\d{1,2})/(\d{4})', s)
    return f'{m[3]}-{int(m[1]):02d}-{int(m[2]):02d}' if m else s


def point(row):
    lat, lng = row.get('latitude'), row.get('longitude')
    if lat in ('', None) and lng in ('', None):
        return None
    if lat in ('', None) or lng in ('', None):
        raise ValueError(f"Incomplete coordinate pair: {row.get('outlet_id') or row.get('venue_id')}")
    p = float(lat), float(lng)
    if not all(math.isfinite(x) for x in p) or not (-90 <= p[0] <= 90 and -180 <= p[1] <= 180) or 0 in p:
        raise ValueError(f'Invalid coordinates: {p}')
    return p


def join_code(value, host_id=''):
    if value == 'ยืนยันชื่อ host; พิกัดอ้างอิงไม่ใช่หน้าร้าน':
        return 'joined' if host_id else 'awaiting_registry'
    if value in JOIN_CODES:
        return JOIN_CODES[value]
    if value in ('joined', 'held', 'awaiting_registry', 'no_venue'):
        return value
    raise ValueError(f'Unknown research venue join status: {value!r}')


def split_ids(value):
    if isinstance(value, (list, tuple)):
        return [str(x).strip() for x in value if str(x).strip()]
    return [x.strip() for x in re.split(r'[;,\n]', str(value or '')) if x.strip()]


def project_rows(master):
    brands = {b['brand_id']: b for b in master['01_BRANDS']}
    segments = {b['brand_name']: b['segment'] for b in brands.values()}
    banners = defaultdict(list)
    for link in master['11_STORE_BRANDS']:
        if link.get('relationship') == 'operator':
            continue
        label = brands.get(link['brand_id'], {}).get('brand_name') or link.get('brand_name')
        if label and label not in banners[link['outlet_id']]:
            banners[link['outlet_id']].append(label)
    joins = {j['outlet_id']: j for j in master['12_SPATIAL_JOIN']}
    rows = []
    for s in master['02_STORES']:
        j = joins.get(s['outlet_id'])
        if not j or j['venue_join_status'] != s['venue_join_status']:
            raise ValueError(f"{s['outlet_id']}: missing or inconsistent spatial join observation")
        p = point(s)
        if point(j) != p:
            raise ValueError(f"{s['outlet_id']}: selected point differs between store and spatial tabs")
        mid = s.get('citymeter_shopping_center_id') or ''
        code = join_code(s['venue_join_status'], mid)
        if mid and code != 'joined':
            raise ValueError(f"{s['outlet_id']}: unaccepted CityMETER host id")
        if p and (not public_https(s.get('coordinate_source_url')) or not s.get('geometry_role')):
            raise ValueError(f"{s['outlet_id']}: a point requires its public source and original role")
        names = [s['brand_name']] + [n for n in banners[s['outlet_id']] if n != s['brand_name']]
        rows.append({
            'id': s['outlet_id'], 'brand': s['brand_name'], 'brands': names,
            'bannerSegments': [s['segment'] if i == 0 else segments.get(n, s['segment']) for i, n in enumerate(names)],
            'name': text(s.get('store_name')), 'venue': text(s.get('venue')), 'venueId': s.get('venue_id') or '',
            'province': s['province'], 'segment': s['segment'], 'scope': s['scope_group'],
            'channel': s.get('retail_channel', ''), 'format': s.get('store_format', ''), 'origin': 'camera_research',
            'status': s.get('operating_status', ''), 'identity': s.get('site_identity_status', ''),
            'release': s.get('release_status', ''), 'role': s.get('source_record_role', ''),
            'cameraSales': s.get('camera_sales_status', ''), 'evidence': s.get('evidence_status', ''),
            'sourceType': s.get('source_type', ''), 'source': public_https(s.get('source_url')),
            'statusSource': public_https(s.get('status_source_url')), 'mapUrl': public_https(s.get('map_url')),
            'checkedOn': date(s.get('checked_on')), 'address': text(s.get('address')),
            'unit': text(s.get('unit_floor')), 'operator': text(s.get('operator_name')),
            'latitude': p[0] if p else None, 'longitude': p[1] if p else None,
            'geometryRole': s.get('geometry_role') or 'not_collected',
            'geometryStatus': s.get('geometry_status') or 'unresolved',
            'coordinatePrecision': text(s.get('coordinate_precision_note')),
            'venueJoin': code, 'coordinateSource': public_https(s.get('coordinate_source_url')) if p else '',
            'mallId': mid, 'hostKind': 'shopping_center' if mid else '',
            'dedupe': s.get('dedupe_status', ''), 'note': text(s.get('notes')),
        })
    if len({r['id'] for r in rows}) != len(rows):
        raise ValueError('Duplicate outlet IDs in master')
    return rows


def fetch_bytes(url, cache):
    """Normal public HTTP only. HTTP errors stop; there is no 403 bypass/fallback."""
    path = Path(cache)
    if path.exists():
        return path.read_bytes()
    path.parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(url, headers={'User-Agent': 'CityMETER-Research-Data-Verification/1.0'})
    with urllib.request.urlopen(req, timeout=30) as response:
        raw = response.read()
        if response.status != 200:
            raise ValueError(f'{url}: HTTP {response.status}')
    path.write_bytes(raw)
    write(path.with_suffix(path.suffix + '.receipt.json'), {'source': url, 'sha256': digest(raw), 'bytes': len(raw), 'checkedOn': dt.date.today().isoformat()})
    return raw


def production_points(points, cache):
    def get(p):
        lat, lng = p
        url = f'{API}/base/locatePoint?lat={lat}&lng={lng}'
        raw = fetch_bytes(url, cache / 'locate' / f'{lat}_{lng}.json')
        record = json.loads(raw)
        if not isinstance(record.get('value'), dict) or record.get('errors'):
            raise ValueError(f'Invalid production locatePoint response: {url}')
        return p, record['value']
    with ThreadPoolExecutor(max_workers=4) as pool:
        return dict(pool.map(get, sorted(set(points))))


def centers_from_master(master, old_centers, cache):
    old = {c['id']: c for c in old_centers}
    centers = {}
    for v in master['07_VENUES']:
        if join_code(v['venue_join_status'], v.get('citymeter_shopping_center_id')) != 'joined':
            continue
        mid, p = v.get('citymeter_shopping_center_id'), point(v)
        if not mid or not p:
            raise ValueError(f"{v['venue_id']}: accepted host requires its own id and venue point")
        source = f'{API}/shopping-center/detail/{mid}'
        if public_https(v.get('coordinate_source_url')) != source:
            raise ValueError(f"{v['venue_id']}: host center must be an actual CityMETER detail reference")
        if mid in old and (old[mid]['latitude'], old[mid]['longitude']) == p:
            c = copy.deepcopy(old[mid])
        else:
            d = json.loads(fetch_bytes(source, cache / 'host-detail' / f'{mid}.json')).get('value')
            if not d or (float(d['latitude']), float(d['longitude'])) != p:
                raise ValueError(f"{v['venue_id']}: master host point differs from production detail")
            c = {'id': mid, 'externalId': d.get('mallExternalId'), 'name': d.get('mallName') or v['venue_name'],
                 'nameTh': d.get('nameTh') or '', 'latitude': p[0], 'longitude': p[1],
                 'type': d.get('supMallType') or '', 'gla': d.get('glaSqm'),
                 'glaSource': d.get('glaSource') or '', 'glaConfidence': d.get('glaConfidence') or '',
                 'kind': 'shopping_center', 'source': source, 'match': v.get('venue_join_method') or 'research_master_join'}
        centers[mid] = c
    return sorted(centers.values(), key=lambda c: c['name'])


def tile(lng, lat, z):
    n = 2 ** z
    a = math.radians(lat)
    return int((lng + 180) / 360 * n), int((1 - math.log(math.tan(a) + 1 / math.cos(a)) / math.pi) / 2 * n)


def t2ll(x, y, z):
    n = 2 ** z
    return x / n * 360 - 180, math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * y / n))))


def merc2ll(x, y):
    return x / 6378137 * 180 / math.pi, math.degrees(2 * math.atan(math.exp(y / 6378137)) - math.pi / 2)


def locale_polygons(base, locations, cache, as_of):
    import mapbox_vector_tile
    from shapely.geometry import Polygon, shape, mapping, Point
    from shapely.ops import unary_union
    feats = {f['id']: copy.deepcopy(f) for f in base['features']}
    needed = {v['locale']['id']: v['locale'] for v in locations.values() if (v.get('province') or {}).get('id') == BKK and (v.get('locale') or {}).get('id')}
    for lid, loc in sorted(needed.items()):
        if lid in feats:
            continue
        w, s = merc2ll(*loc['extent'][:2])
        e, n = merc2ll(*loc['extent'][2:])
        x0, y0 = tile(w, n, 15)
        x1, y1 = tile(e, s, 15)
        pieces = []
        props = {}
        for x in range(x0, x1 + 1):
            for y in range(y0, y1 + 1):
                raw = fetch_bytes(f'{API}/base/mvt/ML/15/{x}/{y}', cache / 'locale-tiles' / f'15_{x}_{y}.pbf')
                if not raw or raw[:1] == b'{':
                    continue
                for layer in mapbox_vector_tile.decode(raw, default_options={'y_coord_down': True}).values():
                    extent = layer.get('extent', 4096)
                    for f in layer['features']:
                        if f['properties'].get('id') != lid:
                            continue
                        props = f['properties']
                        g = shape(f['geometry'])
                        for poly in [g] if g.geom_type == 'Polygon' else g.geoms:
                            conv = lambda ring: [t2ll(x + a / extent, y + b / extent, 15) for a, b in ring.coords]
                            pieces.append(Polygon(conv(poly.exterior), [conv(r) for r in poly.interiors]).buffer(0))
        if not pieces:
            raise ValueError(f'No production polygon for required Locale {lid}')
        geom = unary_union(pieces).buffer(.000002).buffer(-.000002).simplify(.000005, preserve_topology=True)
        if geom.geom_type == 'GeometryCollection':
            geom = unary_union([g for g in geom.geoms if g.geom_type in ('Polygon', 'MultiPolygon')])
        gj = mapping(geom)
        def rounded(c):
            return [rounded(x) for x in c] if isinstance(c[0], (list, tuple)) else [round(c[0], 6), round(c[1], 6)]
        gj['coordinates'] = rounded(gj['coordinates'])
        name = props.get('nameTh') or loc['name']
        feats[lid] = {'type': 'Feature', 'id': lid, 'geometry': gj, 'properties': {
            'id': lid, 'name': name, 'nameTh': name, 'nameEn': (props.get('nameEn') or '').strip(),
            'provinceCode': 'BKK', 'provinceName': 'กรุงเทพมหานคร', 'priority': 1, 'status': 'production_locale',
            'checkedOn': as_of, 'boundaryType': 'citymeter_production_locale',
            'boundaryAuthority': 'CityMETER production Locale (Locale Insight); navigation and analysis unit, not statutory',
            'definition': f'Locale “{name}” ของ CityMETER production',
            'geometryMethod': 'Production ML z15 tile pieces unioned and simplified about 0.5 m; no invented or nearest boundaries.',
            'productionUrl': f'https://landometer.com/v3/citymeter/BKK/L/{lid}?d=shoppingCenter',
            'sourceURLs': [f'https://landometer.com/v3/citymeter/BKK/L/{lid}?d=shoppingCenter']}}
    polygons = [(lid, shape(f['geometry'])) for lid, f in feats.items()]
    bkk_count = 0
    for (lat, lng), observation in locations.items():
        expected = (observation.get('locale') or {}).get('id') if (observation.get('province') or {}).get('id') == BKK else None
        hits = [lid for lid, poly in polygons if poly.covers(Point(lng, lat))]
        if hits != ([expected] if expected else []):
            raise ValueError(f'Locale gate mismatch at {lat},{lng}: polygon {hits} vs production {expected}')
        if (observation.get('province') or {}).get('id') == BKK:
            bkk_count += 1
    result = copy.deepcopy(base)
    result['features'] = sorted(feats.values(), key=lambda f: f['properties']['name'])
    result['metadata'].update({'version': f'{as_of}-refresh', 'checkedOn': as_of,
        'coverage': 'Verified production Bangkok Locales for sourced camera outlet and accepted host points; production has no Locales outside Bangkok.',
        'membership': 'Point-in-polygon on the selected source point; no nearest fallback.',
        'membershipCheck': f'{bkk_count}/{bkk_count} Bangkok points: polygons equal production base/locatePoint (checked {as_of})',
        'coordinatePairsChecked': len(locations)})
    return result


def retained_buildings(master, baseline, rows):
    result = copy.deepcopy(baseline)
    known = {f['id']: f for f in result['features']}
    links = defaultdict(list)
    stores = {s['outlet_id']: s for s in master['02_STORES']}
    by_id = {r['id']: r for r in rows}
    joins = {j['outlet_id']: j for j in master['12_SPATIAL_JOIN']}
    venues = {v['venue_id']: v for v in master.get('07_VENUES', [])}
    named_method = 'reviewed_named_host_geometry_without_citymeter_registry'
    accepted_building_statuses = {'เชื่อมอาคารแล้ว', 'อาคารบริบทจากชื่อ venue'}
    for s in stores.values():
        if set(split_ids(s.get('building_ids'))) != set(split_ids(joins[s['outlet_id']].get('building_ids'))):
            raise ValueError(f"{s['outlet_id']}: store and spatial tabs disagree on building IDs")
        for bid in split_ids(s.get('building_ids')):
            if bid not in known:
                raise ValueError(f"{s['outlet_id']}: building {bid} is not retained source geometry")
            f = known[bid]
            # Explicit links in both source tabs may use the known feature; this
            # code never infers a link from coordinate proximity or a shared name.
            r = by_id[s['outlet_id']]
            registered = r['venueJoin'] == 'joined' and bool(r['mallId']) and r['mallId'] in f['properties']['mall_ids']
            venue = venues.get(r['venueId'])
            reviewed_named_host = not r['mallId'] and bool(r['venueId']) and venue is not None \
                and r['venueId'] in split_ids(f['properties'].get('venue_ids')) \
                and bid in split_ids(venue.get('building_ids')) \
                and s.get('building_join_method') == joins[s['outlet_id']].get('building_join_method') == named_method \
                and all(x.get('building_join_status') in accepted_building_statuses for x in (s, joins[s['outlet_id']], venue))
            if not (registered or reviewed_named_host):
                raise ValueError(f"{s['outlet_id']}: building link differs from accepted host")
            links[bid].append(s['outlet_id'])
    # A retained part belongs to its explicitly recorded parent feature. The
    # research links outlets to that host footprint, rather than listing every
    # owned 3D part again in each store row. Preserve this source ownership; do
    # not expand through shared names, mall IDs, proximity or a whole complex.
    for bid, f in known.items():
        p = f['properties']
        parent_id = p.get('parent_building_id')
        part_role = p.get('geometry_role')
        if part_role not in ('host_building_part_not_shop_unit', 'host_complex_building_part_not_shop_unit') or not parent_id:
            continue
        if part_role == 'host_complex_building_part_not_shop_unit' and p.get('parent_covers_full_polygon') is not True:
            raise ValueError(f'{bid}: contextual part has no qualified full-polygon parent coverage')
        parent = known.get(parent_id)
        if not parent or parent['properties'].get('geometry_role') != 'host_building_footprint_not_shop_unit' or parent['properties'].get('host_id') != p.get('host_id'):
            raise ValueError(f'{bid}: retained part has no qualified source parent')
        links[bid] = sorted(set(links[bid]) | set(links[parent_id]))
    for bid, f in known.items():
        f['properties']['outlet_ids'] = sorted(links[bid])
        f['properties']['venue_names'] = sorted({by_id[i]['venue'] for i in links[bid]})
    result['metadata'].update({'rows': len(rows), 'mapped_rows': sum(r['latitude'] is not None for r in rows),
        'matched_rows': len({i for ids in links.values() for i in ids}), 'features': len(known),
        'host_venues': len({v for f in known.values() for v in split_ids(f['properties'].get('venue_ids')) if links[f['id']]}),
        'source': 'Reviewed research-master 13_BUILDINGS geometries and accepted acquisition packet; retained geometry, source heights and retrieval dates preserved. Outlet assignments come from explicit 02_STORES and 12_SPATIAL_JOIN links, plus only qualified same-host source parent ownership to parts. The adapter itself acquires no building geometry; no nearest matching or automatic host-to-outlet building links.'})
    return result


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--master', required=True)
    ap.add_argument('--logos', required=True)
    ap.add_argument('--cache', required=True)
    ap.add_argument('--as-of', default='2026-10-23')
    ap.add_argument('--baseline-camera', default=str(ROOT / 'data/camera.json'))
    ap.add_argument('--baseline-locales', default=str(ROOT / 'data/neighborhoods.geojson'))
    ap.add_argument('--baseline-buildings', default=str(ROOT / 'data/venue-buildings.geojson'))
    a = ap.parse_args()
    master, baseline, cache = load(a.master), load(a.baseline_camera), Path(a.cache)
    rows = project_rows(master)
    if not {r['id'] for r in baseline['rows']}.issubset({r['id'] for r in rows}):
        raise ValueError('Refresh drops an existing outlet ID; explicit research disposition required')
    centers = centers_from_master(master, baseline['centers'], cache)
    center_ids = {c['id'] for c in centers}
    if any(r['mallId'] and r['mallId'] not in center_ids for r in rows):
        raise ValueError('An outlet host ID has no independently verified master venue reference')
    points = [(r['latitude'], r['longitude']) for r in rows + centers if r['latitude'] is not None]
    locations = production_points(points, cache)
    locales = locale_polygons(load(a.baseline_locales), locations, cache, a.as_of)
    buildings = retained_buildings(master, load(a.baseline_buildings), rows)
    counts = Counter(b for r in rows for b in r['brands'])
    registry = [{
        'id': b['brand_id'], 'name': b['brand_name'], 'scope': b['scope_group'], 'segment': b['segment'],
        'shopType': b.get('shop_type_th', ''), 'productCategory': split_ids(b.get('product_category')),
        'aliases': split_ids(b.get('aliases')), 'entityRole': b.get('entity_role', ''),
        'collection': b.get('branch_collection_status', ''), 'source': public_https(b.get('source_url')),
        'outlets': counts[b['brand_name']]} for b in master['01_BRANDS']]
    meta = copy.deepcopy(baseline['meta'])
    joins = Counter(r['venueJoin'] for r in rows)
    meta.update({'asOf': a.as_of, 'checkedOn': a.as_of, 'researchRevision': a.as_of,
        'outlets': len(rows), 'defaultOutlets': sum(r['role'] == 'retail_outlet_listing' for r in rows),
        'brandsApproved': len(registry), 'brandsWithOutlets': sum(bool(b['outlets']) for b in registry),
        'linkedBannerRecords': sum(len(r['brands']) for r in rows), 'venues': len(master['07_VENUES']),
        'venuesWithHost': len(centers), 'hostShoppingCenters': len(centers),
        'rowsWithCoordinates': sum(r['latitude'] is not None for r in rows),
        'rowsWithoutCoordinates': sum(r['latitude'] is None for r in rows),
        'rowsWithoutVenue': sum(not r['venueId'] for r in rows),
        'venueJoin': {code: joins[code] for code in ['joined', 'held', 'awaiting_registry', 'no_venue']},
        'heldVenues': sorted({r['venue'] for r in rows if r['venueJoin'] == 'held'}),
        'reviewQueueNames': len(master['05_REVIEW_QUEUE']), 'branchReviewRows': len(master['03_BRANCH_REVIEW']),
        'hostSource': 'Accepted research master venue joins; retained verified CityMETER Shopping Center detail references, with new accepted host references re-read from production. Source shop POIs never create host centers.',
        'coordinateSource': 'Selected source-backed outlet or host reference points in the research master; geometryRole retains the source precision. Point availability is independent of the venue/building join.',
        'limitations': ['Listings are source observations, not field-verified operating status.',
            'A point may represent a source-published business POI or a host reference; it does not establish an entrance, floor or shop footprint.',
            'Host IDs and building links come only from the accepted research join. An outlet point alone never creates a host or building.',
            'Coverage is not a national census of camera retail.', 'Do not infer sales, stock, spending or demographics from presence.']})
    camera = {'meta': meta, 'rows': rows, 'centers': centers, 'brands': registry}
    # All validation and acquisition completes before any public output is changed.
    brand_logos, venue_logos, venue_manifest, copies, sprite = project_logos(master, load(a.logos), Path(a.logos).parent, centers, a.as_of)
    for source, target in copies:
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, target)
    for filename, value in [('camera.json', camera), ('neighborhoods.geojson', locales), ('venue-buildings.geojson', buildings),
                            ('brand-logos.json', brand_logos), ('venue-logos.json', venue_logos)]:
        write(ROOT / 'data' / filename, value)
    write(ROOT / 'assets/venue-logos-manifest.json', venue_manifest)
    (ROOT / 'assets/brand-logos.svg').write_text(sprite, encoding='utf-8')
    report = {'asOf': a.as_of, 'inputSHA256': digest(Path(a.master).read_bytes()), 'outlets': len(rows),
        'coordinateRows': meta['rowsWithCoordinates'], 'centers': len(centers), 'locales': len(locales['features']),
        'coordinatePairsVerified': len(locations), 'buildingFeatures': len(buildings['features']),
        'brandLogos': len(brand_logos['brands']), 'venueLogoLabels': sum(bool(v['key']) for v in venue_logos['venues'])}
    write(cache / 'refresh-report.json', report)
    print(json.dumps(report, ensure_ascii=False, indent=2))


# Logo projection is defined below to keep the coordinate and host contracts easy
# to audit independently of asset delivery.

def asset_background(asset, path):
    surface = asset.get('recommended_surface', '')
    if surface in ('dark', 'dark_background_required', 'dark_or_mid_neutral'):
        return '#182327'
    if asset.get('format') != 'svg':
        from PIL import Image
        im = Image.open(path).convert('RGBA')
        im.thumbnail((180, 180))
        pixels = list(im.getdata())
        opaque = [(r, g, b) for r, g, b, a in pixels if a > 127]
        if opaque and len(opaque) < len(pixels) * .98:
            luminance = sum(.2126*r + .7152*g + .0722*b for r, g, b in opaque) / (255 * len(opaque))
            if luminance > .8:
                return '#182327'
    return '#FFFFFF' if not asset.get('has_alpha') else '#E5E9E6'


def project_logos(master, library, library_root, centers, as_of):
    assets = {a['asset_id']: a for a in library['assets']}
    mappings = {m['entity_id']: m for m in library['mappings']}
    copies, symbols, brand_entries, brand_missing = [], [], [], []
    venue_assets, venue_entries, center_entries, venue_files, venue_missing = {}, [], {}, [], []
    venue_by_id = {v['venue_id']: v for v in master['07_VENUES']}
    center_ids = {c['id'] for c in centers}

    def get(entity_id, sha):
        m = mappings.get(entity_id) or {}
        a = assets.get(m.get('asset_id'))
        if not a:
            return None
        if sha and a['sha256'] != sha:
            raise ValueError(f'{entity_id}: active master logo hash differs from the local library')
        source = library_root / a['filename']
        raw = source.read_bytes()
        if digest(raw) != a['sha256']:
            raise ValueError(f'{entity_id}: logo bytes differ from verified manifest')
        if not public_https(a.get('source_page_url')):
            raise ValueError(f'{entity_id}: logo has no public source page')
        if a.get('source_asset_url') and not public_https(a['source_asset_url']):
            raise ValueError(f'{entity_id}: private logo asset source is not public provenance')
        return m, a, source, raw

    for b in master['01_BRANDS']:
        found = get(b['brand_id'], b.get('logo_sha256'))
        if not found:
            brand_missing.append(b['brand_name'])
            continue
        m, a, source, raw = found
        width, height = float(a['width']), float(a['height'])
        if width <= 0 or height <= 0:
            raise ValueError(f"{b['brand_id']}: invalid logo dimensions")
        ext = {'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/svg+xml': 'svg'}[a['mime_type']]
        target = ROOT / 'assets/brand-logos' / f"{b['brand_id']}.{ext}"
        copies.append((source, target))
        sprite_id = 'logo-' + b['brand_id'].lower()
        scale = min(296 / width, 136 / height)
        w, h = width * scale, height * scale
        background = asset_background(a, source)
        image_url = f"data:{a['mime_type']};base64," + base64.b64encode(raw).decode('ascii')
        symbols.append(f'<symbol id="{sprite_id}" viewBox="0 0 320 160"><rect width="320" height="160" fill="{background}"/><image x="{160-w/2:.6f}" y="{80-h/2:.6f}" width="{w:.6f}" height="{h:.6f}" preserveAspectRatio="xMidYMid meet" href="{image_url}"/></symbol>')
        brand_entries.append({'id': b['brand_id'], 'name': b['brand_name'], 'spriteId': sprite_id,
            'sourceURL': public_https(a['source_page_url']), 'assetURL': public_https(a.get('source_asset_url')) or None,
            'sourceSHA256': a['sha256'], 'mime': a['mime_type'], 'width': width, 'height': height,
            'background': background, 'sourceKind': a['source_tier'],
            'altTh': 'โลโก้ ' + b['brand_name'], 'altEn': b['brand_name'] + ' logo',
            'file': str(target.relative_to(ROOT)), 'bytes': len(raw), 'identityRole': m.get('logo_role')})
    sprite = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs>' + ''.join(symbols) + '</defs></svg>'
    brand_catalog = {'meta': {'asOf': as_of, 'status': 'partial' if brand_missing else 'complete',
        'spriteRevision': digest(sprite.encode())[:12], 'count': len(brand_entries),
        'missing': brand_missing, 'expected': len(master['01_BRANDS']),
        'note': 'Verified original retailer marks; contain positioning with neutral backing. Original bytes and proportions preserved. Collection does not grant trademark rights.'}, 'brands': brand_entries}

    for row in master['10_VENUE_LOGOS']:
        found = get(row['venue_id'], row.get('logo_sha256'))
        key = None
        if found:
            m, a, source, raw = found
            key = 'VL-' + a['sha256'][:16]
            if key not in venue_assets:
                ext = {'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/svg+xml': 'svg'}[a['mime_type']]
                target = ROOT / 'assets/venue-logos' / f"{a['sha256'][:16]}.{ext}"
                copies.append((source, target))
                entry = {'key': key, 'file': str(target.relative_to(ROOT)), 'mime': a['mime_type'],
                    'bytes': len(raw), 'sha256': a['sha256'], 'width': a['width'], 'height': a['height'],
                    'background': asset_background(a, source), 'sourcePage': public_https(a['source_page_url']),
                    'assetURL': public_https(a.get('source_asset_url')) or None, 'sourceKind': a['source_tier']}
                venue_assets[key] = entry
                venue_files.append({'path': entry['file'], 'sha256': a['sha256'], 'bytes': len(raw),
                    'logoKey': key, 'sourcePage': entry['sourcePage'], 'assetURL': entry['assetURL'], 'checkedOn': as_of})
        else:
            venue_missing.append(row.get('venue_label') or row['venue_id'])
        label = row.get('venue_label') or venue_by_id[row['venue_id']]['venue_name']
        role = row.get('logo_role') if key else 'none'
        venue_entries.append({'label': label, 'canonical': row.get('canonical_venue_name') or label,
            'type': row.get('venue_type') or '', 'role': role, 'key': key,
            'status': 'verified_file' if key else 'not_collected'})
        venue = venue_by_id[row['venue_id']]
        mid = venue.get('citymeter_shopping_center_id')
        if key and mid in center_ids:
            center_entries.setdefault(mid, {'id': mid, 'name': venue.get('citymeter_venue_name') or label,
                'label': label, 'key': key, 'role': role})
    # Missing venue labels have no expected file/key; explicit missing coverage is
    # separate from a failed download of an expected verified asset.
    venue_catalog = {'meta': {'asOf': as_of, 'version': f'{as_of}-refresh', 'count': len(venue_assets),
        'expected': len(venue_assets), 'folder': 'assets/venue-logos/', 'pending': [], 'missing': venue_missing,
        'status': 'complete', 'coverageStatus': 'partial' if venue_missing else 'complete',
        'counts': {'labels': len(venue_entries), 'labels_with_logo': sum(bool(v['key']) for v in venue_entries),
            'files': len(venue_assets), 'shopping_center_links': len(center_entries)},
        'licenseNote': 'การรวบรวมไฟล์ไม่ใช่ใบอนุญาตเครื่องหมายการค้า สิทธิ์ยังเป็นของเจ้าของ',
        'identityRole': 'Venue identity only; exact labels/accepted host IDs; no fuzzy spatial links.',
        'backgroundRule': 'Original artwork contained on its visually reviewed neutral backing; original bytes unchanged.'},
        'assets': list(venue_assets.values()), 'venues': venue_entries, 'centers': list(center_entries.values()), 'issues': []}
    return brand_catalog, venue_catalog, {'checkedOn': as_of, 'status': 'complete', 'files': venue_files, 'issues': []}, copies, sprite


if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""Host building footprints for venues without a Luxury Brands host feature.

Method (per venue with a resolved host point):
 1. production subdistrict id: point-in-polygon on CityMETER base/mvt/S tiles (z12)
 2. CityMETER building/detail at the host point -> OSM way/relation id, name, area, height
 3. CityMETER building/detailMvt (version V4, z16, 3x3 tiles, inTileType=SUBDISTRICT): the polygon
    that CONTAINS the host point and whose area agrees with step 2 within 12 %
 4. accept only when the building is plausibly the host: area >= 1,500 m2 or the OSM name shares a
    token with the venue label. Otherwise the venue keeps no host footprint (no nearest building).
Second pass (refine, always run): stricter plausibility for unnamed buildings (area >= max(1,500 m2, GLA/15)
and not a low small block) and, where no building contains the host point, a building within 150 m whose OSM
name shares a token with the venue — identity by name, never the nearest building.
Inputs: CAMERA_WORK/venues_resolved.json (03), LUXURY_REPO/data/venue-buildings.geojson (hosts already covered).
Output: CAMERA_WORK/host_buildings_citymeter.json (list of accepted + rejected decisions)
"""
import json, math, os, re
import mapbox_vector_tile as m
from shapely.geometry import shape, Point, Polygon, mapping
from common import API, WORK, LUXURY, tile, t2ll, fetch

DB = str(WORK)
os.makedirs(f'{DB}/bld', exist_ok=True)

def get(url, fn):
    """fn is an absolute path under CAMERA_WORK (kept for the original call sites)."""
    return fetch(url, os.path.relpath(fn, DB))

def decode(data, tx, ty, z):
    out = []
    if not data or data[:1] == b'{':
        return out
    d = m.decode(data, default_options={'y_coord_down': True})
    for lname, layer in d.items():
        ext = layer.get('extent', 4096)
        for f in layer['features']:
            g = shape(f['geometry'])
            def conv(poly):
                return Polygon([t2ll(tx + cx / ext, ty + cy / ext, z) for cx, cy in poly.exterior.coords],
                               [[t2ll(tx + cx / ext, ty + cy / ext, z) for cx, cy in r.coords] for r in poly.interiors])
            parts = [g] if g.geom_type == 'Polygon' else list(getattr(g, 'geoms', []))
            for p in parts:
                if p.geom_type == 'Polygon':
                    out.append((conv(p), f['properties']))
    return out

def area_m2(poly, lat):
    k = 111320.0
    return poly.area * k * k * math.cos(math.radians(lat))

def subdistrict_of(lng, lat):
    z = 12; x, y = tile(lng, lat, z)
    data = get(f'{API}/base/mvt/S/{z}/{x}/{y}', f'{DB}/bld/S_{z}_{x}_{y}.pbf')
    pt = Point(lng, lat)
    for poly, p in decode(data, x, y, z):
        if poly.buffer(0).contains(pt):
            return p
    return None

TOKEN_STOP = {'the', 'mall', 'lifestore', 'shopping', 'center', 'centre', 'plaza', 'lifestyle', 'store', 'บิ๊กซี', 'โลตัส'}
def tokens(s):
    return {t for t in re.split(r'[\s\-()/,.]+', (s or '').lower()) if len(t) > 2 and t not in TOKEN_STOP}

venues = json.load(open(f'{DB}/venues_resolved.json'))
lux = json.load(open(LUXURY / 'data' / 'venue-buildings.geojson'))
lux_malls = {mid for f in lux['features'] for mid in (f['properties'].get('mall_ids') or [])}
decisions = []
for v in venues:
    if v.get('latitude') is None or v.get('hostId') in lux_malls:
        continue
    lat, lng = v['latitude'], v['longitude']
    rec = {'venueId': v['venueId'], 'label': v['label'], 'hostId': v['hostId'], 'latitude': lat, 'longitude': lng}
    sub = subdistrict_of(lng, lat)
    rec['subdistrict'] = {'id': sub.get('id'), 'name': sub.get('nameTh')} if sub else None
    det = json.loads(get(f'{API}/building/detail?lng={lng}&lat={lat}', f'{DB}/bld/detail_{lat}_{lng}.json') or b'{}').get('value') or None
    rec['detail'] = det
    if not sub or not det:
        rec['decision'] = 'no_building_at_host_point' if sub else 'no_subdistrict'
        decisions.append(rec); continue
    z = 16; x, y = tile(lng, lat, z)
    pt = Point(lng, lat)
    best = None
    for dx in (-1, 0, 1):
        for dy in (-1, 0, 1):
            tx, ty = x + dx, y + dy
            data = get(f"{API}/building/detailMvt/{z}/{tx}/{ty}?inTileId={sub['id']}&inTileType=SUBDISTRICT&version=V4",
                       f"{DB}/bld/v4_{sub['id'][:8]}_{z}_{tx}_{ty}.pbf")
            for poly, props in decode(data, tx, ty, z):
                pp = poly.buffer(0)
                if pp.contains(pt):
                    a = area_m2(pp, lat)
                    if best is None or abs(a - det['areaSqm']) < abs(best[1] - det['areaSqm']):
                        best = (pp, a, props)
    if not best:
        rec['decision'] = 'no_polygon_contains_host_point'
        decisions.append(rec); continue
    poly, a, props = best
    agree = abs(a - det['areaSqm']) <= 0.12 * det['areaSqm']
    named = bool(tokens(det.get('osmNameEn')) & tokens(v['label'])) or bool(tokens(det.get('osmNameTh')) & tokens(v['label'])) or bool(tokens(det.get('osmNameEn')) & tokens(v.get('hostName')))
    plausible = det['areaSqm'] >= 1500 or named
    rec.update({'polygonArea': round(a, 1), 'areaAgrees': agree, 'nameMatch': named,
                'decision': 'accepted' if agree and plausible else ('rejected_area_mismatch' if not agree else 'rejected_small_unnamed'),
                'geometry': mapping(poly), 'tileProps': props})
    decisions.append(rec)

json.dump(decisions, open(f'{DB}/host_buildings_citymeter.json', 'w'), ensure_ascii=False)
import collections
print(collections.Counter(d['decision'] for d in decisions))
for d in decisions:
    det = d.get('detail') or {}
    print(f"{d['decision'][:22]:22} | {d['label'][:34]:34} | osm {det.get('osmType')}/{det.get('osmId')} {det.get('osmNameEn') or det.get('osmNameTh') or ''} | {det.get('areaSqm') and round(det['areaSqm'])} m2 | h {det.get('heightM')}")


# ---- second pass: stricter plausibility + name-matched fallback (identity by OSM name, never nearest) ----
def refine():
    venues_by_id = {v['venueId']: v for v in json.load(open(f'{DB}/venues_resolved.json'))}
    decisions = json.load(open(f'{DB}/host_buildings_citymeter.json'))
    for d in decisions:
        v = venues_by_id[d['venueId']]
        det = d.get('detail') or {}
        gla = v.get('gla') or 0
        if d['decision'] == 'accepted' and not d.get('nameMatch'):
            a = det.get('areaSqm') or 0
            h = det.get('heightM') or 0
            if a < max(1500, gla / 15) or (a < 8000 and h < 7):
                d['decision'] = 'rejected_implausible_for_host'
        if d['decision'] == 'no_building_at_host_point' and d.get('subdistrict'):
            lat, lng = d['latitude'], d['longitude']
            z = 16; x, y = tile(lng, lat, z); pt = Point(lng, lat)
            cands = []
            for dx in (-1, 0, 1):
                for dy in (-1, 0, 1):
                    tx, ty = x + dx, y + dy
                    data = get(f"{API}/building/detailMvt/{z}/{tx}/{ty}?inTileId={d['subdistrict']['id']}&inTileType=SUBDISTRICT&version=V4",
                               f"{DB}/bld/v4_{d['subdistrict']['id'][:8]}_{z}_{tx}_{ty}.pbf")
                    for poly, props in decode(data, tx, ty, z):
                        pp = poly.buffer(0)
                        if pp.distance(pt) * 111320 <= 150 and area_m2(pp, lat) >= 1500:
                            cands.append((pp, props))
            seen = set(); found = None
            for pp, props in sorted(cands, key=lambda c: c[0].distance(pt)):
                key = tuple(round(b, 6) for b in pp.bounds)
                if key in seen: continue
                seen.add(key)
                rp = pp.representative_point()
                det2 = json.loads(get(f'{API}/building/detail?lng={rp.x:.6f}&lat={rp.y:.6f}', f'{DB}/bld/detail_{rp.y:.6f}_{rp.x:.6f}.json') or b'{}').get('value') or {}
                if not det2: continue
                named = bool(tokens(det2.get('osmNameEn')) & (tokens(v['label']) | tokens(v.get('hostName')))) or bool(tokens(det2.get('osmNameTh')) & (tokens(v['label']) | tokens(v.get('hostName'))))
                if named:
                    found = (pp, det2, props); break
            if found:
                pp, det2, props = found
                d.update({'decision': 'accepted_name_match_nearby', 'detail': det2, 'polygonArea': round(area_m2(pp, lat), 1),
                          'nameMatch': True, 'geometry': mapping(pp), 'tileProps': props,
                          'distanceFromHostPointM': round(pp.distance(pt) * 111320, 1)})
    json.dump(decisions, open(f'{DB}/host_buildings_citymeter.json', 'w'), ensure_ascii=False)
    import collections
    print(collections.Counter(d['decision'] for d in decisions))
    for d in decisions:
        if d['decision'] in ('rejected_implausible_for_host', 'accepted_name_match_nearby'):
            det = d.get('detail') or {}
            print(d['decision'], '|', d['label'], '|', det.get('osmNameEn') or det.get('osmNameTh'), '|', det.get('areaSqm'), '|', d.get('distanceFromHostPointM'))

if __name__ == '__main__':
    refine()

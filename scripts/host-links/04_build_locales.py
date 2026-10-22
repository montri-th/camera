#!/usr/bin/env python3
"""Bangkok neighborhood polygons = CityMETER production Locales that hold at least one camera venue.
Geometry is decoded from production base/mvt/ML tiles at z15 (tile extent 4096 -> ~0.3 m grid) and the
per-tile pieces of one Locale id are unioned. Input: CAMERA_WORK/venues_resolved.json (03, carries the
production locatePoint Locale of every Bangkok host). Output: CAMERA_WORK/locales.geojson"""
import json, math, os
import mapbox_vector_tile as m
from shapely.geometry import shape, Polygon, MultiPolygon, mapping
from shapely.ops import unary_union
from common import API, WORK, tile, t2ll, merc2ll, get_json, fetch
DB = str(WORK)
venues = json.load(open(f'{DB}/venues_resolved.json'))
want = {}
for v in venues:
    if v.get('locale') and v['locale'].get('id'):
        want.setdefault(v['locale']['id'], v['locale']['name'])
BKK = 'a29ec31e-3a36-4ab7-9670-7cef38873c80'  # production province id of กรุงเทพมหานคร (base/info/lv0)
lv1 = get_json(f'{API}/base/info/lv1/{BKK}', f'base/lv1/{BKK}.json')['value']
info = {l['id']: l for l in lv1['localeInfos']}
pieces = {lid: [] for lid in want}
props = {}
z = 15
for lid in want:
    e = info[lid]['extent']
    (w, s), (ea, n) = merc2ll(e[0], e[1]), merc2ll(e[2], e[3])
    x0, y0 = tile(w, n, z); x1, y1 = tile(ea, s, z)
    for x in range(x0, x1 + 1):
        for y in range(y0, y1 + 1):
            data = fetch(f'{API}/base/mvt/ML/{z}/{x}/{y}', f'locales/ml_{z}_{x}_{y}.pbf')
            if not data or data[:1] == b'{':
                continue
            d = m.decode(data, default_options={'y_coord_down': True})
            for layer in d.values():
                ext = layer.get('extent', 4096)
                for f in layer['features']:
                    p = f['properties']
                    if p.get('id') != lid:
                        continue
                    g = shape(f['geometry'])
                    def conv(poly):
                        return Polygon([t2ll(x + cx / ext, y + cy / ext, z) for cx, cy in poly.exterior.coords],
                                       [[t2ll(x + cx / ext, y + cy / ext, z) for cx, cy in r.coords] for r in poly.interiors])
                    parts = [g] if g.geom_type == 'Polygon' else list(g.geoms)
                    for pp in parts:
                        pieces[lid].append(conv(pp).buffer(0))
                    props[lid] = p
feats = []
for lid, ps in pieces.items():
    u = unary_union(ps).buffer(0.000002).buffer(-0.000002)
    if u.geom_type == 'GeometryCollection':
        u = unary_union([g for g in u.geoms if g.geom_type in ('Polygon', 'MultiPolygon')])
    u = u.simplify(0.000005, preserve_topology=True)
    def rnd(geom):
        gj = mapping(geom)
        def r(c):
            return [r(x) for x in c] if isinstance(c[0], (list, tuple)) else [round(c[0], 6), round(c[1], 6)]
        gj['coordinates'] = r(gj['coordinates'])
        return gj
    p = props.get(lid, {})
    feats.append({'type': 'Feature', 'id': lid, 'properties': {'id': lid, 'name': p.get('nameTh') or want[lid], 'nameEn': (p.get('nameEn') or '').strip()}, 'geometry': rnd(u)})
    print(lid[:8], want[lid], u.geom_type, len(ps), 'pieces', round(u.area * 111320 ** 2 * math.cos(math.radians(13.75))), 'm2')
json.dump({'type': 'FeatureCollection', 'features': feats}, open(f'{DB}/locales.geojson', 'w'), ensure_ascii=False)
print(len(feats), os.path.getsize(f'{DB}/locales.geojson'))

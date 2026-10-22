#!/usr/bin/env python3
"""Production reference layers: province list (base/info/lv0), per-province subdivisions (base/info/lv1/{id})
and province polygons decoded from base/mvt/P tiles at z8 (used only to check that a host point lies in the
research province). Output: CAMERA_WORK/base/lv0.json, base/lv1/{provinceId}.json, base/provinces_z8_raw.geojson"""
import csv, json
import mapbox_vector_tile as mvt
from shapely.geometry import shape, mapping, Polygon, MultiPolygon
from shapely.ops import unary_union
from common import API, RESEARCH, WORK, tile, t2ll, get_json, fetch

lv0 = get_json(f'{API}/base/info/lv0', 'base/lv0.json')['value']['provinceInfos']
info = {p['id']: p for p in lv0}
by_th = {p['nameTh']: p for p in lv0}
# lv1 for every province named by the research venues (Bangkok carries the Locales)
needed = {r['province'] for r in csv.DictReader(open(RESEARCH / '07_VENUES.csv', encoding='utf-8'))} | {'กรุงเทพมหานคร'}
for th in sorted(needed):
    get_json(f"{API}/base/info/lv1/{by_th[th]['id']}", f"base/lv1/{by_th[th]['id']}.json")

z = 8
x0, y0 = tile(97.2, 20.6, z); x1, y1 = tile(105.8, 5.5, z)
pieces = {}
for x in range(x0, x1 + 1):
    for y in range(y0, y1 + 1):
        data = fetch(f'{API}/base/mvt/P/{z}/{x}/{y}', f'base/p_{z}_{x}_{y}.pbf')
        if not data or data[:1] == b'{':
            continue
        for layer in mvt.decode(data, default_options={'y_coord_down': True}).values():
            ext = layer.get('extent', 4096)
            for f in layer['features']:
                g = shape(f['geometry'])
                tx = lambda coords: [t2ll(x + cx / ext, y + cy / ext, z) for cx, cy in coords]
                conv = lambda poly: Polygon(tx(poly.exterior.coords), [tx(r.coords) for r in poly.interiors])
                if g.geom_type == 'Polygon': gg = conv(g)
                elif g.geom_type == 'MultiPolygon': gg = MultiPolygon([conv(pp) for pp in g.geoms])
                else: continue
                pieces.setdefault(f['properties']['id'], []).append(gg if gg.is_valid else gg.buffer(0))
feats = []
for pid, gs in pieces.items():
    u = unary_union(gs).buffer(0.00005).buffer(-0.00005)  # close slivers left by tile clipping
    p = info.get(pid, {})
    feats.append({'type': 'Feature', 'id': p.get('abbrEn'), 'geometry': mapping(u), 'properties': {
        'id': pid, 'code': p.get('abbrEn'), 'dopaCode': p.get('code'), 'nameTh': p.get('nameTh'), 'nameEn': p.get('nameEn'), 'areaSqm': p.get('areaSqm')}})
(WORK / 'base' / 'provinces_z8_raw.geojson').write_text(json.dumps({'type': 'FeatureCollection', 'features': feats}, ensure_ascii=False))
print('provinces', len(feats), 'lv1 files', len(needed))

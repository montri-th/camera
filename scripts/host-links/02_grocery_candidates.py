#!/usr/bin/env python3
"""Grocery (hypermarket) host candidates for venues the Shopping Center layer does not hold: the BIG CAMERA
outlets in Big C / Lotus's hypermarkets. For each target (research venue, province, subdistrict named in the
store address, retailer) every production Grocery record of that retailer in the subdistrict's overlay tiles
(z13, inTileType=SUBDISTRICT) is listed for review; crosswalk_grocery.py records the reviewed choice.
Output: CAMERA_WORK/grocery/candidates.json"""
import json
import mapbox_vector_tile as mvt
from common import API, WORK, tile, t2ll, merc2ll, get_json, fetch

TARGETS = [
 ('บิ๊กซี พระราม 4', 'กรุงเทพมหานคร', 'คลองตัน', 'BIG_C'), ('บิ๊กซี กาฬสินธุ์', 'กาฬสินธุ์', 'กาฬสินธุ์', 'BIG_C'),
 ('บิ๊กซี สัตหีบ', 'ชลบุรี', 'สัตหีบ', 'BIG_C'), ('โลตัส อมตะนคร', 'ชลบุรี', 'คลองตำหรุ', 'LOTUSS'),
 ('บิ๊กซี ตาก', 'ตาก', 'ระแหง', 'BIG_C'), ('บิ๊กซี นครพนม', 'นครพนม', 'หนองญาติ', 'BIG_C'),
 ('โลตัส ปากช่อง', 'นครราชสีมา', 'ปากช่อง', 'LOTUSS'), ('บิ๊กซี นครสวรรค์', 'นครสวรรค์', 'ปากน้ำโพ', 'BIG_C'),
 ('บิ๊กซี ศรีมหาโพธิ', 'ปราจีนบุรี', 'ท่าตูม', 'BIG_C'), ('บิ๊กซี ลพบุรี', 'ลพบุรี', 'ท่าศาลา', 'BIG_C'),
 ('บิ๊กซี ศรีสะเกษ', 'ศรีสะเกษ', 'หญ้าปล้อง', 'BIG_C'), ('บิ๊กซี สตูล', 'สตูล', 'คลองขุด', 'BIG_C'),
 ('บิ๊กซี สมุทรสงคราม', 'สมุทรสงคราม', 'บางแก้ว', 'BIG_C'), ('บิ๊กซี สระแก้ว', 'สระแก้ว', 'สระแก้ว', 'BIG_C'),
 ('โลตัส สุราษฎร์ธานี', 'สุราษฎร์ธานี', 'มะขามเตี้ย', 'LOTUSS'), ('บิ๊กซี สุโขทัย', 'สุโขทัย', 'บ้านกล้วย', 'BIG_C'),
 ('บิ๊กซี อำนาจเจริญ', 'อำนาจเจริญ', 'บุ่ง', 'BIG_C'), ('บิ๊กซี อ่างทอง', 'อ่างทอง', 'โพสะ', 'BIG_C'),
 ('บิ๊กซี เชียงราย 2', 'เชียงราย', 'บ้านดู่', 'BIG_C'), ('บิ๊กซี เลย', 'เลย', 'นาอาน', 'BIG_C'),
]
# Records found only in a neighbouring subdistrict's tile on review (the overlay tile is requested per subdistrict).
EXTRA_SUBDISTRICTS = {'บิ๊กซี ศรีสะเกษ': ['8133f182-bd81-4e05-bcaa-5dc4d04cbaf1']}

lv0 = get_json(f'{API}/base/info/lv0', 'base/lv0.json')['value']['provinceInfos']
pid = {p['nameTh']: p['id'] for p in lv0}
results = {}
for venue, prov, sub, brand in TARGETS:
    lv1 = get_json(f'{API}/base/info/lv1/{pid[prov]}', f'base/lv1/{pid[prov]}.json')['value']
    subs = [s for s in lv1['subdistrictInfos'] if s['nameTh'] == sub]
    subs += [{'id': sid, 'nameTh': '(neighbour)', 'extent': next(s['extent'] for s in subs)} for sid in EXTRA_SUBDISTRICTS.get(venue, [])]
    feats = {}
    for s in subs:
        e = s['extent']; (w, so), (ea, no) = merc2ll(e[0], e[1]), merc2ll(e[2], e[3])
        z = 13; x0, y0 = tile(w, no, z); x1, y1 = tile(ea, so, z)
        for x in range(x0 - (1 if s['nameTh'] == '(neighbour)' else 0), x1 + 1):
            for y in range(y0, y1 + 1):
                data = fetch(f"{API}/grocery/overlayMvt/{z}/{x}/{y}?inTileId={s['id']}&inTileType=SUBDISTRICT", f"grocery/{s['id']}_{z}_{x}_{y}.pbf")
                if not data or data[:1] == b'{':
                    continue
                for layer in mvt.decode(data, default_options={'y_coord_down': True}).values():
                    ext = layer.get('extent', 4096)
                    for f in layer['features']:
                        p = f['properties']
                        if p.get('brand') != brand:
                            continue
                        px, py = f['geometry']['coordinates']
                        lng, lat = t2ll(x + px / ext, y + py / ext, z)
                        feats[p['id']] = dict(p, approx_lng=round(lng, 6), approx_lat=round(lat, 6), subdistrict_id=s['id'], subdistrict=s['nameTh'])
    results[venue] = list(feats.values())
    print(f'{venue}: {len(feats)} candidates')
(WORK / 'grocery').mkdir(exist_ok=True)
(WORK / 'grocery' / 'candidates.json').write_text(json.dumps(results, ensure_ascii=False, indent=1))

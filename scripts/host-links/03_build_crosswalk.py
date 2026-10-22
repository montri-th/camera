#!/usr/bin/env python3
"""Resolve every research venue to a CityMETER production host record and verify it.

Inputs  : research 07_VENUES (CSV of the research master tab), crosswalk_sc.py, crosswalk_grocery.py,
          CAMERA_WORK/grocery/candidates.json (02), CAMERA_WORK/base/provinces_z8_raw.geojson (01),
          CityMETER production API (shopping-center/detail, base/locatePoint).
Output  : CAMERA_WORK/venues_resolved.json
"""
import csv, json
from shapely.geometry import shape, Point
from shapely.strtree import STRtree
from common import API, RESEARCH, WORK, get_json
from crosswalk_sc import SC, UNMATCHED
from crosswalk_grocery import GROCERY

DB = str(WORK)

prov = json.load(open(f'{DB}/base/provinces_z8_raw.geojson'))['features']
geoms = [shape(f['geometry']) for f in prov]
tree = STRtree(geoms)
def province_of(lng, lat):
    p = Point(lng, lat)
    for i in tree.query(p):
        if geoms[i].contains(p):
            return prov[i]['properties']
    return None

venues = list(csv.DictReader(open(RESEARCH / '07_VENUES.csv', encoding='utf-8')))
grocery_cands = json.load(open(f'{DB}/grocery/candidates.json'))
grocery_by_id = {c['id']: c for lst in grocery_cands.values() for c in lst}

out = []
problems = []
for v in venues:
    name = v['venue_name']
    rec = {'venueId': v['venue_id'], 'label': name, 'type': v['venue_type'], 'province': v['province'],
           'district': v['district'], 'research': {'latitude': v['latitude'], 'longitude': v['longitude'],
           'citymeterShoppingCenterId': v['citymeter_shopping_center_id']}}
    sc_id = v['citymeter_shopping_center_id'] or (SC.get(name) or (None,))[0]
    if v['citymeter_shopping_center_id']:
        basis, note = 'research_sheet_alias_crosswalk', 'linked in the research sheet (alias crosswalk from the Luxury Brands master)'
    elif name in SC:
        _, basis, note = SC[name]
    if sc_id:
        d = get_json(f'{API}/shopping-center/detail/{sc_id}', f'{DB}/cm/detail/{sc_id}.json')['value']
        rec.update({'host': 'citymeter_shopping_center', 'hostId': sc_id, 'externalId': d.get('mallExternalId'),
                    'hostName': d.get('mallName'), 'hostNameTh': d.get('nameTh'), 'hostNameEn': d.get('nameEn'),
                    'latitude': d.get('latitude'), 'longitude': d.get('longitude'), 'hostType': d.get('supMallType'),
                    'gla': d.get('glaSqm'), 'address': d.get('address'), 'basis': basis, 'note': note,
                    'source': f'{API}/shopping-center/detail/{sc_id}'})
    elif name in GROCERY:
        gid, basis, note = GROCERY[name]
        g = grocery_by_id.get(gid)
        if not g:
            raise SystemExit(f'grocery record {gid} for {name} is not among the candidates (run 02_grocery_candidates.py)')
        rec.update({'host': 'citymeter_grocery', 'hostId': gid, 'externalId': None, 'hostName': g.get('name'),
                    'latitude': g['approx_lat'], 'longitude': g['approx_lng'], 'hostType': g.get('store_type'),
                    'gla': None, 'address': g.get('address'), 'basis': basis, 'note': note,
                    'sourceDataset': g.get('source_dataset'),
                    'source': f'{API}/grocery/overlayMvt (inTileType=SUBDISTRICT, z13)'})
    else:
        rec.update({'host': None, 'hostId': None, 'latitude': None, 'longitude': None,
                    'basis': 'unmatched', 'note': UNMATCHED.get(name, 'not reviewed')})
        if name not in UNMATCHED:
            problems.append(('not reviewed', name))
    if rec.get('latitude') is not None:
        pp = province_of(rec['longitude'], rec['latitude'])
        rec['provinceCode'] = pp['code'] if pp else None
        rec['provinceCheck'] = bool(pp and pp['nameTh'] == v['province'])
        if not rec['provinceCheck']:
            problems.append(('province mismatch', name, v['province'], pp and pp['nameTh']))
        if v['latitude']:
            dlat = abs(float(v['latitude']) - rec['latitude']); dlng = abs(float(v['longitude']) - rec['longitude'])
            if dlat > 0.0005 or dlng > 0.0005:
                problems.append(('research coordinate differs from production', name, v['latitude'], v['longitude'], rec['latitude'], rec['longitude']))
        if v['province'] == 'กรุงเทพมหานคร':
            lp = get_json(f"{API}/base/locatePoint?lat={rec['latitude']}&lng={rec['longitude']}",
                          f"{DB}/cm/locate/{rec['latitude']}_{rec['longitude']}.json")['value']
            loc = lp.get('locale') or {}
            rec['locale'] = {'id': loc.get('id'), 'name': loc.get('name')}
    out.append(rec)

json.dump(out, open(f'{DB}/venues_resolved.json', 'w'), ensure_ascii=False, indent=1)
resolved = sum(1 for r in out if r.get('latitude') is not None)
print('venues', len(out), 'resolved', resolved, 'unmatched', len(out) - resolved)
for p in problems:
    print('PROBLEM', p)

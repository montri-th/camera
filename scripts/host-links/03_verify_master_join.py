#!/usr/bin/env python3
"""Verify the research master's venue join against CityMETER production; list app-side host-link proposals.

The research master is the source of record for which outlets have an accepted host point: in 07_VENUES and
02_STORES, venue_join_status = 'จับคู่ venue แล้ว' with citymeter_shopping_center_id and the CityMETER detail point in
latitude/longitude (one row per outlet in 12_SPATIAL_JOIN). This step re-reads every joined host from production and
stops on any difference. It never adds, moves or upgrades a join.

Per joined venue: the production detail exists; the master's latitude/longitude equal the detail point (≤ 0.0005°);
the point lies in the production polygon of the research province; a Bangkok point gets its production Locale from
base/locatePoint. Per outlet: a joined outlet carries its venue's host id and point; a held or unjoined outlet none.

Venues the master leaves unjoined keep missing coordinates, with the master's status and reason. Where the reviewed
app crosswalk (crosswalk_sc.py, crosswalk_grocery.py) has a candidate record for one of them, the candidate is checked
the same way and written to host_link_proposals.{json,csv} for the research team. Proposals are never published.

Inputs : CAMERA_RESEARCH/02_STORES.csv, 07_VENUES.csv, 12_SPATIAL_JOIN.csv; CAMERA_WORK/base/provinces_z8_raw.geojson (01);
         CAMERA_WORK/grocery/candidates.json (02, proposals only); CityMETER production API (cached).
Outputs: CAMERA_WORK/venues_resolved.json, CAMERA_WORK/host_link_proposals.json, CAMERA_WORK/host_link_proposals.csv
"""
import csv, json
from collections import defaultdict
from shapely.geometry import shape, Point
from shapely.strtree import STRtree
from common import API, RESEARCH, WORK, tile, get_json
from crosswalk_sc import SC
from crosswalk_grocery import GROCERY

JOINED = 'จับคู่ venue แล้ว'
HELD = 'รอตรวจชื่อหรือขอบเขต'
TOL = 0.0005
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

def read(name):
    return list(csv.DictReader(open(RESEARCH / f'{name}.csv', encoding='utf-8')))

def sc_detail(sc_id):
    return get_json(f'{API}/shopping-center/detail/{sc_id}', f'{DB}/cm/detail/{sc_id}.json')['value']

def locale_of(lat, lng):
    lp = get_json(f'{API}/base/locatePoint?lat={lat}&lng={lng}', f'{DB}/cm/locate/{lat}_{lng}.json')['value']
    loc = lp.get('locale') or {}
    return {'id': loc.get('id'), 'name': loc.get('name')}

venues = read('07_VENUES')
stores = read('02_STORES')
joins = {r['outlet_id']: r for r in read('12_SPATIAL_JOIN')}
outlets_of = defaultdict(list)
for s in stores:
    if s['venue_id']:
        outlets_of[s['venue_id']].append(s)
grocery = {c['id']: c for lst in json.load(open(f'{DB}/grocery/candidates.json')).values() for c in lst}

problems, out, proposals = [], [], []
for v in venues:
    name, vid = v['venue_name'], v['venue_id']
    members = outlets_of.get(vid, [])
    reasons = sorted({joins[s['outlet_id']]['review_reason'] for s in members if joins.get(s['outlet_id'], {}).get('review_reason')})
    rec = {'venueId': vid, 'label': name, 'type': v['venue_type'], 'province': v['province'], 'district': v['district'],
           'masterStatus': v['venue_join_status'], 'masterMethod': v['venue_join_method'], 'masterVenueName': v['citymeter_venue_name'],
           'research': {'latitude': v['latitude'], 'longitude': v['longitude'], 'citymeterShoppingCenterId': v['citymeter_shopping_center_id']}}
    sc_id = v['citymeter_shopping_center_id']
    if v['venue_join_status'] == JOINED:
        if not sc_id or not v['latitude']:
            problems.append(('joined venue without host id or point', name)); out.append(rec); continue
        d = sc_detail(sc_id)
        lat, lng = float(v['latitude']), float(v['longitude'])
        if abs(lat - d['latitude']) > TOL or abs(lng - d['longitude']) > TOL:
            problems.append(('master point differs from production detail', name, lat, lng, d['latitude'], d['longitude']))
        rec.update({'host': 'citymeter_shopping_center', 'hostId': sc_id, 'externalId': d.get('mallExternalId'),
                    'hostName': d.get('mallName'), 'hostNameTh': d.get('nameTh'), 'hostNameEn': d.get('nameEn'),
                    'latitude': lat, 'longitude': lng, 'hostType': d.get('supMallType'), 'gla': d.get('glaSqm'),
                    'address': d.get('address'), 'basis': v['venue_join_method'] or 'research_master_join',
                    'note': f"research master venue join → {v['citymeter_venue_name'] or d.get('mallName')}",
                    'source': f'{API}/shopping-center/detail/{sc_id}', 'exactPoint': (lat, lng) == (d['latitude'], d['longitude'])})
        pp = province_of(lng, lat)
        rec['provinceCode'] = pp['code'] if pp else None
        rec['provinceCheck'] = bool(pp and pp['nameTh'] == v['province'])
        if not rec['provinceCheck']:
            problems.append(('province mismatch', name, v['province'], pp and pp['nameTh']))
        if v['province'] == 'กรุงเทพมหานคร':
            rec['locale'] = locale_of(d['latitude'], d['longitude'])
        for s in members:
            if s['venue_join_status'] != JOINED or s['citymeter_shopping_center_id'] != sc_id or (s['latitude'], s['longitude']) != (v['latitude'], v['longitude']):
                problems.append(('outlet differs from its joined venue', s['outlet_id'], name, s['venue_join_status']))
    else:
        rec.update({'host': None, 'hostId': None, 'latitude': None, 'longitude': None,
                    'basis': 'master_held' if v['venue_join_status'] == HELD else 'master_not_joined',
                    'note': '; '.join(reasons) or v['venue_join_status']})
        for s in members:
            if s['latitude'] or s['citymeter_shopping_center_id']:
                problems.append(('unjoined outlet carries a host point', s['outlet_id'], name))
        cand = None
        if name in SC:
            cid, basis, note = SC[name]
            d = sc_detail(cid)
            cand = {'candidate_kind': 'citymeter_shopping_center', 'candidate_id': cid, 'candidate_name': d.get('mallName'),
                    'candidate_address': d.get('address') or '', 'basis': basis, 'evidence_note': note,
                    'production_url': f'{API}/shopping-center/detail/{cid}', 'latitude': d['latitude'], 'longitude': d['longitude']}
        elif name in GROCERY:
            gid, basis, note = GROCERY[name]
            g = grocery[gid]
            x, y = tile(g['approx_lng'], g['approx_lat'], 13)
            cand = {'candidate_kind': 'citymeter_grocery', 'candidate_id': gid, 'candidate_name': g.get('name'),
                    'candidate_address': g.get('address') or '', 'basis': basis, 'evidence_note': note,
                    'production_url': f"{API}/grocery/overlayMvt/13/{x}/{y}?inTileId={g['subdistrict_id']}&inTileType=SUBDISTRICT",
                    'latitude': g['approx_lat'], 'longitude': g['approx_lng']}
        if cand:
            pp = province_of(cand['longitude'], cand['latitude'])
            proposals.append({'venue_id': vid, 'venue_name': name, 'province': v['province'],
                              'master_venue_join_status': v['venue_join_status'], 'master_reason': '; '.join(reasons),
                              'outlets': len(members), 'banners': '; '.join(sorted({s['brand_name'] for s in members})),
                              **cand, 'province_check': bool(pp and pp['nameTh'] == v['province'])})
    out.append(rec)

# Venues the master joined to a different record than the app crosswalk proposed (information only).
differences = []
for v in venues:
    app = (SC.get(v['venue_name']) or GROCERY.get(v['venue_name']) or (None,))[0]
    if v['venue_join_status'] == JOINED and app and app != v['citymeter_shopping_center_id']:
        differences.append((v['venue_name'], v['citymeter_shopping_center_id'], app))

json.dump(out, open(f'{DB}/venues_resolved.json', 'w'), ensure_ascii=False, indent=1)
json.dump({'note': 'App crosswalk candidates for venues the research master has not joined; for review in the master, never published.',
           'proposals': proposals}, open(f'{DB}/host_link_proposals.json', 'w'), ensure_ascii=False, indent=1)
cols = ['venue_id', 'venue_name', 'province', 'master_venue_join_status', 'master_reason', 'outlets', 'banners', 'candidate_kind',
        'candidate_id', 'candidate_name', 'candidate_address', 'basis', 'evidence_note', 'production_url', 'latitude', 'longitude', 'province_check']
with open(f'{DB}/host_link_proposals.csv', 'w', newline='', encoding='utf-8') as fh:
    w = csv.DictWriter(fh, fieldnames=cols); w.writeheader(); w.writerows(proposals)

joined = [r for r in out if r.get('latitude') is not None]
print('venues', len(out), 'joined', len(joined), 'hosts', len({r['hostId'] for r in joined}), 'exact points', sum(1 for r in joined if r['exactPoint']),
      'bangkok', sum(1 for r in joined if r.get('locale')), 'held', sum(1 for r in out if r['basis'] == 'master_held'),
      'not joined', sum(1 for r in out if r['basis'] == 'master_not_joined'), 'proposals', len(proposals))
for d in differences:
    print('MASTER RECORD DIFFERS FROM APP CROSSWALK', d)
for p in problems:
    print('PROBLEM', p)
if problems:
    raise SystemExit(f'{len(problems)} problem(s): the master join does not verify')

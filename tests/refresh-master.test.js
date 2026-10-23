import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';

test('research adapter preserves an independent sourced pin, private-data scrub and explicit building links', () => {
  const result = spawnSync('python3', ['-B', '-c', `
import importlib.util, pathlib, copy
spec=importlib.util.spec_from_file_location('refresh',pathlib.Path('scripts/refresh-camera-master.py'))
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
s={'outlet_id':'CAM-O-fixture','brand_id':'CAM-B-fixture','brand_name':'Camera Shop','store_name':'Camera Shop',
   'province':'กรุงเทพมหานคร','segment':'multibrand_camera','scope_group':'A','venue':'','venue_id':'',
   'venue_join_status':'ไม่มี venue ที่ยืนยัน','latitude':13.7,'longitude':100.5,
   'coordinate_source_url':'https://example.com/official-location','geometry_role':'official_retailer_location_pin',
   'checked_on':46318,'notes':'Phone 062-864-0277 https://drive.google.com/file/d/private/view','building_ids':''}
j={'outlet_id':s['outlet_id'],'venue_join_status':s['venue_join_status'],'latitude':13.7,'longitude':100.5,'building_ids':''}
master={'01_BRANDS':[{'brand_id':'CAM-B-fixture','brand_name':'Camera Shop','segment':'multibrand_camera'}],
        '02_STORES':[s],'12_SPATIAL_JOIN':[j],'11_STORE_BRANDS':[
          {'outlet_id':s['outlet_id'],'brand_id':'CAM-B-fixture','relationship':'retailer'},
          {'outlet_id':s['outlet_id'],'brand_id':'operator','brand_name':'Operator Company','relationship':'operator'}]}
r=m.project_rows(master)[0]
assert (r['latitude'],r['longitude'])==(13.7,100.5)
assert (r['venueJoin'],r['venueId'],r['mallId'],r['hostKind'])==('no_venue','','','')
assert r['brands']==['Camera Shop'] and r['checkedOn']=='2026-10-23'
assert '062-864-0277' not in r['note'] and 'drive.google' not in r['note']
assert m.centers_from_master({'07_VENUES':[{'venue_id':'host-name-only','venue_join_status':'มีชื่อ venue รอตรวจทะเบียน',
      'latitude':13.7,'longitude':100.5,'citymeter_shopping_center_id':''}]},[],pathlib.Path('/unused'))==[]
geometry={'type':'Polygon','coordinates':[[[100,13],[101,13],[101,14],[100,14],[100,13]]]}
baseline={'metadata':{},'features':[{'id':'osm:way/1','geometry':geometry,'properties':{
    'outlet_ids':[],'mall_ids':[],'height_m':None,'height_status':'unknown','retrieved_on':'2026-10-22'}}]}
out=m.retained_buildings(master,baseline,[r])
assert out['features'][0]['geometry']==geometry
assert out['features'][0]['properties']['outlet_ids']==[], 'containment alone must not create a building join'
assert out['features'][0]['properties']['height_m'] is None
assert out['features'][0]['properties']['retrieved_on']=='2026-10-22'
parent=copy.deepcopy(baseline['features'][0]);parent['properties'].update({
    'host_id':'host-one','mall_ids':['host-one'],'geometry_role':'host_building_footprint_not_shop_unit','render_as':'outline'})
part=copy.deepcopy(parent);part['id']='osm:way/1/part/exact';part['properties'].update({
    'geometry_role':'host_building_part_not_shop_unit','parent_building_id':parent['id'],
    'height_m':40,'display_height_m':40,'display_base_m':10,'render_as':'extrusion'})
other=copy.deepcopy(parent);other['id']='osm:way/2'
linked=copy.deepcopy(master);linked['02_STORES'][0]['building_ids']=parent['id'];linked['12_SPATIAL_JOIN'][0]['building_ids']=parent['id']
rr=copy.deepcopy(r);rr.update({'venueJoin':'joined','mallId':'host-one','venue':'Venue one'})
restored=m.retained_buildings(linked,{'metadata':{},'features':[parent,part,other]},[rr])
assert restored['features'][1]['properties']['outlet_ids']==[r['id']], 'explicit parent ownership must preserve source parts'
assert restored['features'][2]['properties']['outlet_ids']==[], 'another building at the same host does not inherit'
assert restored['features'][1]['geometry']==geometry and restored['features'][1]['properties']['height_m']==40
assert restored['features'][1]['properties']['display_base_m']==10
assert restored['features'][1]['properties']['retrieved_on']=='2026-10-22'
part['properties'].update({'geometry_role':'host_complex_building_part_not_shop_unit','parent_covers_full_polygon':True})
context=m.retained_buildings(linked,{'metadata':{},'features':[parent,part]},[rr])
assert context['features'][1]['properties']['outlet_ids']==[r['id']]
part['properties']['parent_covers_full_polygon']=False
try:m.retained_buildings(linked,{'metadata':{},'features':[parent,part]},[rr])
except ValueError:pass
else:raise AssertionError('contextual part without full-polygon coverage was accepted')
part['properties']['parent_covers_full_polygon']=True
part['properties']['host_id']='another-wing'
try:m.retained_buildings(linked,{'metadata':{},'features':[parent,part]},[rr])
except ValueError:pass
else:raise AssertionError('a part under another wing/host inherited an outlet')
named=copy.deepcopy(master);named['02_STORES'][0].update({'venue_id':'named-venue','building_ids':parent['id'],
    'building_join_method':'reviewed_named_host_geometry_without_citymeter_registry','building_join_status':'อาคารบริบทจากชื่อ venue'})
named['12_SPATIAL_JOIN'][0].update({'building_ids':parent['id'],'building_join_method':'reviewed_named_host_geometry_without_citymeter_registry',
    'building_join_status':'อาคารบริบทจากชื่อ venue'})
named['07_VENUES']=[{'venue_id':'named-venue','building_ids':parent['id'],'building_join_status':'อาคารบริบทจากชื่อ venue'}]
rr=copy.deepcopy(r);rr.update({'venueJoin':'held','venueId':'named-venue','mallId':'','latitude':None,'longitude':None})
np=copy.deepcopy(parent);np['properties'].update({'mall_ids':[],'venue_ids':['named-venue']})
accepted=m.retained_buildings(named,{'metadata':{},'features':[np]},[rr])
assert accepted['features'][0]['properties']['outlet_ids']==[r['id']]
assert rr['venueJoin']=='held' and rr['mallId']=='' and rr['latitude'] is None, 'building context cannot create a center, pin or registry join'
for problem in ['unknown_venue','missing_07_link','missing_method','unaccepted_status']:
 bad_named=copy.deepcopy(named);bad_row=copy.deepcopy(rr)
 if problem=='unknown_venue':bad_row['venueId']='unknown'
 if problem=='missing_07_link':bad_named['07_VENUES'][0]['building_ids']=''
 if problem=='missing_method':bad_named['12_SPATIAL_JOIN'][0]['building_join_method']=''
 if problem=='unaccepted_status':bad_named['07_VENUES'][0]['building_join_status']='รอตรวจ'
 try:m.retained_buildings(bad_named,{'metadata':{},'features':[np]},[bad_row])
 except ValueError:pass
 else:raise AssertionError('unqualified named building accepted: '+problem)
bad=copy.deepcopy(master);bad['02_STORES'][0]['building_ids']='osm:way/999';bad['12_SPATIAL_JOIN'][0]['building_ids']='osm:way/999'
try:m.retained_buildings(bad,baseline,[r])
except ValueError:pass
else:raise AssertionError('unknown building geometry was accepted')
bad=copy.deepcopy(master);bad['12_SPATIAL_JOIN'][0]['longitude']=100.6
try:m.project_rows(bad)
except ValueError:pass
else:raise AssertionError('mismatched source point was accepted')
`], {cwd: new URL('..', import.meta.url), encoding: 'utf8'});
  assert.equal(result.status, 0, result.stderr || result.stdout);
});

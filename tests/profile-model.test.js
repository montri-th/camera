import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {filterRows, SEGMENTS, bannerSegmentsOf} from '../js/model.js';
import {assignNeighborhood} from '../js/neighborhoods.js';
import {buildNeighborhoodChartModel} from '../js/chart-model.js';
import {buildOverviewInsights, buildNeighborhoodProfile, buildStoreDetail, buildVenueProfile, buildBrandPresence, describeGeometry, describeStatus, rankVenues} from '../js/profile-model.js';
import {buildAreaModel} from '../js/map-layers.js';

const data = JSON.parse(fs.readFileSync(new URL('../data/camera.json', import.meta.url)));
const geojson = JSON.parse(fs.readFileSync(new URL('../data/neighborhoods.geojson', import.meta.url)));
const segments = Object.entries(SEGMENTS).map(([id, name]) => ({id, name}));
const rows = filterRows(data.rows, {cohort: 'current'});
const byName = name => geojson.features.find(f => f.properties.name === name);
const ratchadaWest = byName('รัชดา-ตะวันตก'), siam = byName('สยาม');

test('overview insights use the chart model and expose the most exclusive area', () => {
  const o = buildOverviewInsights(rows, geojson, segments);
  const m = buildNeighborhoodChartModel(rows, geojson, segments);
  assert.equal(o.areaCount, m.areaCount);
  assert.equal(o.totalBrands, 38);
  assert.equal(o.ranking[0].id, ratchadaWest.id);
  assert.ok(o.mostExclusive && o.mostExclusive.exclusiveBrands > 0);
  assert.equal(o.mostExclusive.exclusiveBrands, Math.max(...m.areas.map(a => a.exclusiveBrands)));
});

test('neighborhood profile counts match the chart model and partition banners into exclusive and shared', () => {
  const p = buildNeighborhoodProfile(rows, ratchadaWest, geojson, data.centers, segments);
  const area = buildNeighborhoodChartModel(rows, geojson, segments).areas.find(a => a.id === ratchadaWest.id);
  assert.equal(p.brands, area.brands);
  assert.equal(p.pos, area.pos);
  assert.equal(p.exclusive.length + p.shared.length, p.brands);
  assert.equal(p.exclusive.length, area.exclusiveBrands);
  assert.equal(p.rank, 1);
  assert.equal(p.productionUrl, `https://landometer.com/v3/citymeter/BKK/L/${ratchadaWest.id}?d=shoppingCenter`);
  for (const s of p.shared) assert.ok(s.elsewhere.length >= 1 && !s.elsewhere.includes(p.name));
  assert.equal(p.venues.reduce((n, v) => n + v.pos, 0), p.pos, 'every outlet of the area sits in a venue');
  assert.deepEqual(p.venues.map(v => v.name), ['Fortune Town']);
  const pairs = rows.filter(r => assignNeighborhood(r, geojson) === ratchadaWest).reduce((n, r) => n + new Set(bannerSegmentsOf(r)).size, 0);
  assert.equal(p.segmentMix.reduce((n, s) => n + s.pos, 0), pairs);
});

test('a co-branded outlet appears in each of its banners’ segment rows of the mix', () => {
  const p = buildNeighborhoodProfile(rows, siam, geojson, data.centers, segments);
  assert.ok(p.segmentMix.reduce((n, s) => n + s.pos, 0) > p.pos);
  assert.ok(p.segmentMix.some(s => s.id === 'adjacent_retail_channel' && s.brands === 1), 'Power Mall counter in Siam Paragon');
});

test('exclusive/shared reference is the whole selection, so a single-area selection is not all exclusive', () => {
  const only = rows.filter(r => assignNeighborhood(r, geojson) === ratchadaWest);
  const narrow = buildNeighborhoodProfile(only, ratchadaWest, geojson, data.centers, segments);
  const full = buildNeighborhoodProfile(rows, ratchadaWest, geojson, data.centers, segments);
  assert.equal(narrow.exclusive.length, narrow.brands, 'with only one area in scope everything is exclusive by construction');
  assert.ok(full.exclusive.length < full.brands, 'the app passes the full scope so sharing stays visible');
});

test('store detail reads geometry and status from the row without upgrading them', () => {
  const mall = rows.find(r => r.geometryRole === 'host_complex_point_not_shopfront');
  const street = rows.find(r => !r.venue);
  const held = rows.find(r => r.venueJoin === 'held' && r.venue === 'Siam Square One');
  // A hypermarket host (CityMETER Grocery record) stays a supported host kind; the current master joins Shopping Centers only.
  const hyper = {...mall, id: 'fixture-hyper', geometryRole: 'host_hypermarket_point_not_shopfront', hostKind: 'grocery'};
  assert.equal(describeGeometry(mall).level, 'host');
  assert.equal(describeGeometry(hyper).level, 'host');
  assert.equal(describeGeometry(hyper).label, 'จุดตัวแทนไฮเปอร์มาร์เก็ต');
  assert.equal(describeGeometry(street).level, 'none');
  assert.equal(held.latitude, null, 'the master holds Siam Square One: no point is published');
  assert.equal(describeGeometry(held).label, 'พิกัดรอตรวจ', 'a held venue keeps its hold, not a generic missing point');
  assert.equal(describeGeometry({...held, venueJoin: 'awaiting_registry'}).label, 'ยังไม่มีพิกัด');
  const d = buildStoreDetail(mall, {rows, geojson, centers: data.centers});
  assert.equal(d.row, mall);
  assert.equal(d.presence.brand, mall.brand);
  assert.ok(d.presence.pos >= 1);
  assert.equal(describeStatus({status: 'permanently_closed'}).tone, 'closed');
  assert.equal(describeStatus({status: 'source_listed_not_field_verified', identity: 'source_listed_not_field_verified', role: 'retail_outlet_listing'}).label, 'พบในแหล่งข้อมูล');
  assert.equal(describeStatus({identity: 'shared_venue_identity_review', role: 'retail_outlet_listing'}).tone, 'pending');
  assert.equal(describeStatus({identity: 'location_conflict_review', role: 'retail_outlet_listing'}).label, 'ที่ตั้งขัดกัน');
  assert.equal(describeStatus({role: 'retailer_contact_location'}).label, 'ที่อยู่ติดต่อ');
});

test('venue profile and banner presence count distinct banners separately from outlet rows', () => {
  const fortune = data.centers.find(c => c.name === 'Fortune Town');
  const v = buildVenueProfile(rows, {mallId: fortune.id, centers: data.centers, geojson});
  assert.equal(v.brands, 13);
  assert.equal(v.pos, 17);
  assert.equal(v.rows.length, v.pos);
  assert.equal(v.area.id, ratchadaWest.id);
  const presence = buildBrandPresence(rows, 'BIG CAMERA', geojson);
  assert.ok(presence.pos >= 140 && presence.venues >= 100, 'linked banners count: the Insta360 store also carries BIG CAMERA');
  const hyperCenter = {id: 'fixture-grocery-host', name: 'BigC fixture', type: 'Hypermarket', kind: 'grocery', latitude: 13.7188, longitude: 100.5689};
  const hyperRow = {...rows.find(r => r.mallId), id: 'fixture-hyper-row', mallId: hyperCenter.id, hostKind: 'grocery', latitude: 13.7188, longitude: 100.5689};
  const hv = buildVenueProfile([...rows, hyperRow], {mallId: hyperCenter.id, centers: [...data.centers, hyperCenter], geojson});
  assert.equal(hv.kind, 'grocery');
  assert.equal(hv.type, 'Hypermarket');
  assert.equal(hv.pos, 1);
});

test('street shops without a venue never form a venue group', () => {
  const ranked = rankVenues(filterRows(data.rows, {cohort: 'all'}), data.centers);
  assert.ok(ranked.every(v => v.key && v.name));
  assert.ok(!ranked.some(v => v.key === 'venue:'));
});

test('area model carries EVID-05 states for every defined area and never colours outside areas', () => {
  const m = buildAreaModel(rows, geojson);
  assert.equal(m.areas.length, geojson.features.length);
  for (const a of m.areas) assert.ok(['measured', 'measured_zero'].includes(a.state));
  const phuket = buildAreaModel(filterRows(data.rows, {cohort: 'current', province: 'ภูเก็ต'}), geojson);
  assert.equal(phuket.zeroCount, geojson.features.length);
  assert.deepEqual(phuket.classes.classes, []);
});

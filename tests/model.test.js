import test from 'node:test';
import assert from 'node:assert/strict';
import {filterRows, summarize, pointFeatures, toCSV, hasPoint, safeURL, bannersOf, bannerSegmentsOf, countBrands, projectSegment, bannerLabel, isReview, DEFAULT_COHORT} from '../js/model.js';

const base = {role: 'retail_outlet_listing', identity: 'source_listed_not_field_verified', status: 'source_listed_not_field_verified', province: 'กรุงเทพมหานคร', channel: 'mall'};
const rows = [
  {...base, id: 'a', brand: 'BIG CAMERA', name: 'BIG CAMERA One', venue: 'One', mallId: 'm1', segment: 'multibrand_camera', latitude: 13.74, longitude: 100.53},
  {...base, id: 'b', brand: 'BIG CAMERA', brands: ['BIG CAMERA', 'Power Mall'], bannerSegments: ['multibrand_camera', 'adjacent_retail_channel'], name: 'BIG CAMERA CC Powermall One', venue: 'One', mallId: 'm1', segment: 'multibrand_camera', latitude: 13.74, longitude: 100.53},
  {...base, id: 'c', brand: 'Sony Store', name: 'Sony Store Two', venue: 'Two', mallId: 'm2', segment: 'manufacturer_brand_store', identity: 'shared_venue_identity_review', latitude: 13.745, longitude: 100.53},
  {...base, id: 'd', brand: 'WORLD CAMERA', name: 'World Camera contact', venue: '', segment: 'multibrand_camera', role: 'retailer_contact_location', channel: 'street_or_building', latitude: null, longitude: null},
];

test('default cohort = retail outlet listings; all adds the contact location; review = holds and contact locations', () => {
  assert.equal(DEFAULT_COHORT, 'current');
  assert.deepEqual(filterRows(rows).map(r => r.id), ['a', 'b', 'c']);
  assert.equal(filterRows(rows, {cohort: 'all'}).length, 4);
  assert.deepEqual(filterRows(rows, {cohort: 'review'}).map(r => r.id), ['c', 'd']);
  assert.equal(isReview(rows[0]), false);
  assert.equal(isReview(rows[2]), true, 'an identity hold stays in the default view but is reviewable');
});

test('ร้าน (distinct banners) differ from สาขา (outlets); a co-branded outlet counts each banner once; missing geometry stays in the denominator', () => {
  const s = summarize(rows, [{id: 'm1', name: 'One'}, {id: 'm2', name: 'Two'}]);
  assert.equal(s.pos, 4);
  assert.equal(s.brands, 4, 'BIG CAMERA, Power Mall, Sony Store, WORLD CAMERA');
  assert.equal(s.mapped, 3);
  assert.equal(s.venues, 2, 'a street shop without a venue is not a venue');
  assert.equal(s.centers[0].id, 'm1');
  assert.equal(s.centers[0].brands, 2);
  assert.equal(s.centers[0].pos, 2);
  assert.equal(hasPoint(rows[3]), false);
  assert.deepEqual(bannersOf(rows[1]), ['BIG CAMERA', 'Power Mall']);
  assert.deepEqual(bannerSegmentsOf(rows[1]), ['multibrand_camera', 'adjacent_retail_channel']);
  assert.deepEqual(bannersOf(rows[0]), ['BIG CAMERA'], 'rows without a banner list fall back to the primary banner');
  assert.equal(countBrands([rows[0], rows[1]]), 2);
});

test('a segment filter keeps an outlet when any banner is in the segment and counts only those banners (copy, never a mutation)', () => {
  const source = rows.map(r => Object.freeze({...r}));
  const before = JSON.stringify(source);
  const adjacent = filterRows(source, {segment: 'adjacent_retail_channel'});
  assert.deepEqual(adjacent.map(r => r.id), ['b']);
  assert.equal(adjacent[0].brand, 'Power Mall');
  assert.deepEqual(adjacent[0].brands, ['Power Mall']);
  assert.equal(adjacent[0].segment, 'adjacent_retail_channel');
  assert.equal(adjacent[0].latitude, source[1].latitude, 'projection never moves a coordinate');
  const multibrand = filterRows(source, {segment: 'multibrand_camera'});
  assert.deepEqual(multibrand.map(r => r.id), ['a', 'b']);
  assert.equal(countBrands(multibrand), 1, 'Power Mall is not a multibrand camera banner');
  assert.equal(multibrand[0], source[0], 'an unchanged row is returned as is');
  assert.equal(projectSegment(source[2], 'adjacent_retail_channel'), null);
  assert.equal(JSON.stringify(source), before);
});

test('each mapped outlet owns one feature even when venue and host coordinates coincide', () => {
  const source = rows.map(row => Object.freeze({...row}));
  const original = JSON.stringify(source);
  const f = pointFeatures(Object.freeze(source));
  assert.equal(f.type, 'FeatureCollection');
  assert.deepEqual(f.features.map(feature => feature.id), ['a', 'b', 'c']);
  for (const feature of f.features) {
    const row = source.find(r => r.id === feature.id);
    assert.equal(feature.properties.id, row.id);
    assert.deepEqual(feature.geometry.coordinates, [row.longitude, row.latitude]);
  }
  assert.deepEqual(f.features[0].geometry.coordinates, f.features[1].geometry.coordinates);
  assert.equal(JSON.stringify(source), original, 'feature generation must not jitter or mutate source coordinates');
});

test('neighborhood selection intersects the same search, cohort and host filters; search reads linked banners', () => {
  const selected = new Set(['b', 'c', 'd']);
  assert.deepEqual(filterRows(rows, {cohort: 'all', neighborhoodIds: selected, search: 'big', mallId: 'm1'}).map(r => r.id), ['b']);
  assert.deepEqual(filterRows(rows, {search: 'power mall'}).map(r => r.id), ['b'], 'a linked banner is searchable');
  assert.deepEqual(filterRows(rows, {neighborhoodIds: selected}).map(r => r.id), ['b', 'c']);
  assert.deepEqual(filterRows(rows, {cohort: 'all', neighborhoodIds: new Set()}), []);
  assert.deepEqual(filterRows(rows, {province: 'กรุงเทพมหานคร', channel: 'street_or_building', cohort: 'all'}).map(r => r.id), ['d']);
  assert.deepEqual(pointFeatures([]).features, []);
  assert.equal(summarize([], []).brands, 0);
});

test('host selection includes different venue labels for one verified host', () => {
  const rs = [{...rows[0], venue: 'Fortune Town'}, {...rows[1], venue: 'ฟอร์จูนทาวน์'}];
  assert.equal(filterRows(rs, {mallId: 'm1'}).length, 2);
  assert.equal(summarize(rs, [{id: 'm1', name: 'Fortune Town'}]).centers[0].pos, 2);
});

test('public links and CSV remain safe; banner lists export joined', () => {
  assert.equal(safeURL('javascript:alert(1)'), '');
  assert.equal(safeURL('https://example.com'), 'https://example.com/');
  assert.ok(toCSV([{brand: '=1+1', name: 'A,"B"'}]).includes('"\'=1+1"'));
  assert.ok(toCSV([{name: 'A,"B"'}]).includes('"A,""B"""'));
  assert.ok(toCSV([rows[1]]).includes('"BIG CAMERA; Power Mall"'));
});

test('map chip labels shorten long banner names only for display', () => {
  assert.equal(bannerLabel('Insta360 Experience Store by BIG Camera'), 'Insta360');
  assert.equal(bannerLabel('DJI Experience Store'), 'DJI Experience');
  assert.equal(bannerLabel('BIG CAMERA'), 'BIG CAMERA');
  assert.equal(bannerLabel('A Very Long Unlisted Banner Name'), 'A Very Long Unlis…');
  assert.ok(bannerLabel('A Very Long Unlisted Banner Name').length <= 18);
});

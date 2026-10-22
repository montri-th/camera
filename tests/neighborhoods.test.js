import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pointInFeature, assignNeighborhood, neighborhoodRows, summarizeNeighborhoods} from '../js/neighborhoods.js';

const square = (id, x, priority = 100) => ({type: 'Feature', id,
  properties: {id, name: id, priority, center: [x + 5, 5]},
  geometry: {type: 'Polygon', coordinates: [[[x, 0], [x + 10, 0], [x + 10, 10], [x, 10], [x, 0]]]}});
const core = square('core', 0);
const hole = [[2, 2], [4, 2], [4, 4], [2, 4], [2, 2]];
const donut = {...core, geometry: {...core.geometry, coordinates: [...core.geometry.coordinates, hole]}};

test('PIP distinguishes exterior, hole interior, and polygon boundaries', () => {
  assert.equal(pointInFeature([1, 1], donut), true);
  assert.equal(pointInFeature([3, 3], donut), false);
  assert.equal(pointInFeature([2, 3], donut), true);
  assert.equal(pointInFeature([10, 5], donut), true);
  assert.equal(pointInFeature([11, 5], donut), false);
  assert.equal(pointInFeature({latitude: null, longitude: null}, donut), false);
  assert.equal(pointInFeature({latitude: '', longitude: ''}, donut), false);
});

test('MultiPolygon and GeometryCollection preserve component and hole semantics', () => {
  const second = square('second', 20);
  const multi = {type: 'Feature', geometry: {type: 'MultiPolygon',
    coordinates: [donut.geometry.coordinates, second.geometry.coordinates]}};
  assert.equal(pointInFeature([25, 5], multi), true);
  assert.equal(pointInFeature([3, 3], multi), false);
  assert.equal(pointInFeature([15, 5], multi), false);
  const collection = {type: 'Feature', geometry: {type: 'GeometryCollection',
    geometries: [donut.geometry, second.geometry]}};
  assert.equal(pointInFeature([25, 5], collection), true);
  assert.equal(pointInFeature([3, 3], collection), false);
});

test('shared edge assignment uses explicit priority and stable ID tie break', () => {
  const left = square('left', 0, 2), right = square('right', 10, 1);
  const geo = {type: 'FeatureCollection', features: [left, right]};
  assert.equal(assignNeighborhood([10, 5], geo), right);
  right.properties.priority = 2;
  assert.equal(assignNeighborhood([10, 5], geo), left);
  geo.features.reverse();
  assert.equal(assignNeighborhood([10, 5], geo), left);
});

test('filtering rows changes counts while fixed membership and centers remain unchanged', () => {
  const geo = {type: 'FeatureCollection', features: [core]};
  const rows = [{id: 'a', brand: 'A', longitude: 1, latitude: 1},
    {id: 'b', brand: 'B', longitude: 8, latitude: 8},
    {id: 'outside', brand: 'A', longitude: 15, latitude: 5}];
  const frozen = JSON.stringify(geo);
  const all = summarizeNeighborhoods(rows, geo)[0];
  const filtered = summarizeNeighborhoods(rows.filter(row => row.brand === 'A'), geo)[0];
  assert.equal(all.pos, 2);
  assert.equal(filtered.pos, 1);
  assert.deepEqual([...filtered.ids], ['a']);
  assert.deepEqual([all.longitude, all.latitude], [filtered.longitude, filtered.latitude]);
  assert.equal(filtered.feature, core);
  assert.equal(assignNeighborhood(rows[0], geo), core);
  assert.equal(assignNeighborhood(rows[2], geo), null);
  assert.equal(neighborhoodRows(rows, core).length, 2);
  assert.equal(JSON.stringify(geo), frozen);
});

test('published ย่าน are CityMETER production Locales: production ids, production membership, valid rings', () => {
  const geo = JSON.parse(fs.readFileSync(new URL('../data/neighborhoods.geojson', import.meta.url)));
  const name = point => assignNeighborhood(point, geo)?.properties.name || null;
  // Host points (CityMETER Shopping Center detail) → the Locale production's own record names for them.
  assert.equal(assignNeighborhood([100.5610948, 13.816652], geo)?.id, '65a8c076-5f36-400d-b3a4-6f44c26eb632', 'Central Ladprao: detail.localeId');
  assert.equal(name([100.5652256, 13.7592479]), 'รัชดา-ตะวันตก', 'Fortune Town');
  assert.equal(name([100.5347125, 13.7465615]), 'สยาม', 'Siam Paragon');
  assert.equal(name([100.5388752, 13.7470012]), 'ราชประสงค์', 'centralwOrld');
  assert.equal(assignNeighborhood([98.3923, 7.8906], geo), null, 'production has no Locale outside Bangkok');
  assert.match(geo.metadata.membershipCheck, /^(\d+)\/\1 Bangkok host points/);
  for (const feature of geo.features) {
    assert.match(feature.id, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    assert.equal(feature.properties.id, feature.id);
    assert.equal(feature.properties.provinceCode, 'BKK');
    assert.equal(feature.properties.productionUrl, `https://landometer.com/v3/citymeter/BKK/L/${feature.id}?d=shoppingCenter`);
    assert.equal(feature.geometry.type, 'Polygon');
    for (const ring of feature.geometry.coordinates) {
      assert.deepEqual(ring[0], ring.at(-1));
      assert.ok(ring.length >= 4);
      for (const [longitude, latitude] of ring) {
        assert.ok(longitude > 100 && longitude < 101.1);
        assert.ok(latitude > 13.4 && latitude < 14.1);
      }
    }
  }
});

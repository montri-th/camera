import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildingHeightLabel} from '../js/buildings.js';

// The research master (revision 2026-10-22 13:13 UTC) decides every host point and host building; the build only maps.
const data = JSON.parse(readFileSync(new URL('../data/camera.json', import.meta.url), 'utf8'));
const buildings = JSON.parse(readFileSync(new URL('../data/venue-buildings.geojson', import.meta.url), 'utf8'));
const centers = new Map(data.centers.map(c => [c.id, c]));
const byId = new Map(data.rows.map(r => [r.id, r]));

test('host points come only from the master venue join, each with its CityMETER Shopping Center detail', () => {
  const joinCodes = ['joined', 'held', 'awaiting_registry', 'no_venue'];
  for (const r of data.rows) {
    assert.ok(joinCodes.includes(r.venueJoin), r.id);
    if (r.latitude != null) {
      assert.equal(r.venueJoin, 'joined', r.id);
      assert.equal(r.hostKind, 'shopping_center');
      assert.ok(centers.has(r.mallId), r.id);
      assert.equal(r.coordinateSource, `https://landometer.com/api/v2/citymeter-v3/shopping-center/detail/${r.mallId}`);
      assert.equal(r.geometryRole, 'host_complex_point_not_shopfront');
      const c = centers.get(r.mallId);
      assert.deepEqual([r.latitude, r.longitude], [c.latitude, c.longitude], 'the outlet sits on its host point');
    } else {
      assert.notEqual(r.venueJoin, 'joined', r.id);
      assert.equal(r.mallId, '');
      assert.equal(r.longitude, null);
    }
  }
  const counts = data.meta.venueJoin;
  assert.equal(Object.values(counts).reduce((a, b) => a + b, 0), data.meta.outlets);
  assert.equal(counts.joined, data.meta.rowsWithCoordinates);
  assert.equal(data.meta.hostShoppingCenters, data.centers.length);
  assert.ok(data.centers.every(c => c.kind === 'shopping_center'));
});

test('venues the master holds keep no point (Siam Square One, Central Phuket Floresta and four more)', () => {
  const held = [...new Set(data.rows.filter(r => r.venueJoin === 'held').map(r => r.venue))].sort();
  assert.deepEqual(held, [...data.meta.heldVenues].sort());
  for (const v of ['Siam Square One', 'Central Phuket Floresta']) {
    const rs = data.rows.filter(r => r.venue === v);
    assert.ok(rs.length >= 2, v);
    assert.ok(rs.every(r => r.venueJoin === 'held' && r.latitude === null), v);
  }
});

test('host buildings are the master building join: unique ids, joined outlets of their own host, two render modes', () => {
  const fs = buildings.features;
  assert.equal(new Set(fs.map(f => f.id)).size, fs.length);
  assert.equal(buildings.metadata.features, fs.length);
  assert.match(buildings.metadata.source, /13_BUILDINGS/);
  const footprints = new Set(fs.filter(f => f.properties.geometry_role === 'host_building_footprint_not_shop_unit').map(f => f.properties.host_id));
  for (const f of fs) {
    const p = f.properties;
    assert.ok(['extrusion', 'outline'].includes(p.render_as), f.id);
    if (p.render_as === 'extrusion') assert.ok(Number.isFinite(p.display_height_m) && p.display_height_m > (p.display_base_m || 0), f.id);
    assert.ok(!('raw_file' in p), 'no internal workspace paths');
    assert.equal(p.attribution, '© OpenStreetMap contributors (ODbL 1.0)');
    if (p.geometry_role === 'host_building_part_not_shop_unit') assert.ok(footprints.has(p.host_id), `part ${f.id} belongs to a footprint in the file`);
    for (const id of p.outlet_ids) {
      const r = byId.get(id);
      assert.ok(r && r.venueJoin === 'joined' && p.mall_ids.includes(r.mallId), `${f.id}: ${id}`);
    }
  }
  const parent = fs.find(f => f.properties.height_status === 'unknown_parent_height_parts_owned');
  assert.equal(parent.properties.render_as, 'outline', 'a parent whose parts carry the heights is not extruded');
  assert.equal(buildingHeightLabel(parent.properties), 'ความสูง footprint ไม่ระบุ · ส่วนอาคารใช้ baseM/topM จากแหล่งข้อมูล');
  assert.equal(buildingHeightLabel({height_status: 'citymeter_model_estimate', height_m: null}), 'ไม่มีข้อมูลความสูง');
});

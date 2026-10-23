import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {HOST_LAYERS, HOST_MIN_ZOOM, installVenueBuildings, selectedBuildingFeatures, renderableExtrusions, buildingHeightLabel} from '../js/buildings.js';

const data = JSON.parse(readFileSync(new URL('../data/camera.json', import.meta.url), 'utf8'));
const buildings = JSON.parse(readFileSync(new URL('../data/venue-buildings.geojson', import.meta.url), 'utf8'));
const square = [[[100, 13], [101, 13], [101, 14], [100, 14], [100, 13]]];
const footprint = (id, host, ids = []) => ({id, type: 'Feature', geometry: {type: 'Polygon', coordinates: square},
  properties: {host_id: host, geometry_role: 'host_building_footprint_not_shop_unit', outlet_ids: ids,
    render_as: 'outline', height_m: null, display_height_m: null, display_base_m: 0}});
const part = (id, host, parent, ids = []) => ({...footprint(id, host, ids), properties: {
  ...footprint(id, host, ids).properties, geometry_role: 'host_building_part_not_shop_unit',
  parent_building_id: parent, render_as: 'extrusion', height_m: 20, display_height_m: 20, display_base_m: 5}});

test('only an explicit same-host source parent lends outlet selection to its parts', () => {
  const fs = [footprint('parent', 'host', ['one']), part('owned', 'host', 'parent'),
    part('other-wing', 'another-host', 'parent'), part('unrelated', 'host', 'missing'),
    footprint('same-complex', 'host')];
  const before = JSON.stringify(fs);
  const chosen = selectedBuildingFeatures(fs, [{id: 'one', brand: 'A', venue: 'Venue'}]);
  assert.deepEqual(chosen.map(f => f.id), ['parent', 'owned']);
  assert.deepEqual(chosen[1].properties.selected_outlet_ids, ['one']);
  assert.equal(chosen[1].properties.height_m, 20);
  assert.equal(chosen[1].properties.display_base_m, 5);
  assert.equal(JSON.stringify(fs), before, 'runtime selection does not rewrite source ownership or heights');
  const context = part('context-part', 'host', 'parent');
  context.properties.geometry_role = 'host_complex_building_part_not_shop_unit';
  assert.equal(selectedBuildingFeatures([fs[0], context], [{id: 'one'}]).length, 1);
  context.properties.parent_covers_full_polygon = true;
  assert.equal(selectedBuildingFeatures([fs[0], context], [{id: 'one'}]).length, 2);
  context.properties.host_id = 'other-host';
  assert.equal(selectedBuildingFeatures([fs[0], context], [{id: 'one'}]).length, 1);
});

test('Fortune keeps 17 outlet identities in two qualified source solids with explicit display models', () => {
  const rows = data.rows.filter(r => r.venue === 'Fortune Town');
  assert.equal(rows.length, 17);
  const selected = selectedBuildingFeatures(buildings.features, rows);
  const masses = renderableExtrusions(selected, {zoom: 13.5});
  assert.deepEqual(masses.map(f => f.id).sort(), ['osm:way/176298735', 'osm:way/182002417']);
  for (const f of masses) {
    assert.equal(f.properties.selected_outlet_ids.length, 17);
    assert.equal(f.properties.height_m, null, 'display model is never a measured source height');
    assert.equal(f.properties.source_height_m, null);
    assert.equal(f.properties.height_status, 'level_count_display_model');
    assert.match(buildingHeightLabel(f.properties), /ค่าประมาณเพื่อแสดงรูปทรง (17.5|105) ม. \(จำนวนชั้น × 3.5 ม.\)/);
  }
  const context = masses.find(f => f.id === 'osm:way/182002417');
  assert.equal(context.properties.parent_building_id, 'osm:way/176298735');
  assert.equal(context.properties.parent_covers_full_polygon, true);
  assert.equal(context.properties.occupancy_scope, 'host_complex_context_only_no_camera_shop_occupancy_claim');
});

test('retained source parts of MBK, Paragon and centralwOrld render with their selected parent outlets', () => {
  const chosen = selectedBuildingFeatures(buildings.features, data.rows);
  const chosenIds = new Set(chosen.map(f => f.id));
  const byId = new Map(buildings.features.map(f => [f.id, f]));
  const parts = buildings.features.filter(f => f.properties.geometry_role === 'host_building_part_not_shop_unit');
  assert.ok(parts.length >= 34, 'the retained source includes the original 34 3D parts');
  for (const f of parts) {
    const parent = byId.get(f.properties.parent_building_id);
    assert.ok(parent && parent.properties.host_id === f.properties.host_id, `${f.id}: exact source ownership`);
    if (parent.properties.outlet_ids.some(id => data.rows.some(r => r.id === id))) {
      assert.ok(chosenIds.has(f.id), `${f.id}: selected source part must not disappear when only its parent is joined`);
    }
  }
  for (const parentId of ['osm:way/157487610', 'osm:way/781138575', 'osm:way/157482067']) {
    const parent = byId.get(parentId);
    assert.equal(parent.properties.render_as, 'outline');
    const ownParts = chosen.filter(f => f.properties.parent_building_id === parentId);
    assert.ok(ownParts.length >= 2, `${parentId}: outline parent retains its owned solid parts`);
    const selected = selectedBuildingFeatures(buildings.features, data.rows.filter(r => parent.properties.outlet_ids.includes(r.id)));
    assert.ok(ownParts.every(f => selected.some(x => x.id === f.id)));
  }
});

test('only visible positive-height host extrusions may suppress background massing, including zoom 13–14', () => {
  const fs = [footprint('outline', 'host'), part('valid', 'host', 'outline'),
    {...part('unknown', 'host', 'outline'), properties: {...part('unknown', 'host', 'outline').properties, display_height_m: null}},
    {...part('zero', 'host', 'outline'), properties: {...part('zero', 'host', 'outline').properties, display_height_m: 5}}];
  assert.deepEqual(renderableExtrusions(fs, {zoom: 13}).map(f => f.id), ['valid']);
  assert.deepEqual(renderableExtrusions(fs, {zoom: 13.9}).map(f => f.id), ['valid']);
  assert.equal(renderableExtrusions(fs, {zoom: 12.99}).length, 0);
  assert.equal(renderableExtrusions(fs, {zoom: 15, enabled: false}).length, 0);
  const layers = new Map(), sources = new Map(); let zoom = 13.5;
  const map = {addSource(id) { sources.set(id, {setData() {}}); }, getSource: id => sources.get(id),
    addLayer(def) { layers.set(def.id, def); }, getLayer: id => layers.get(id),
    setLayoutProperty(id, k, v) { layers.get(id).layout[k] = v; }, getLayoutProperty: (id, k) => layers.get(id).layout[k],
    setPaintProperty() {}, on() {}, off() {}, getZoom: () => zoom, getCanvas: () => ({style: {}}),
    removeLayer(id) { layers.delete(id); }, removeSource(id) { sources.delete(id); }};
  fs[0].properties.outlet_ids = ['one'];
  const controller = installVenueBuildings(map, {type: 'FeatureCollection', features: fs}, {rows: [{id: 'one', brand: 'A', venue: 'V'}]});
  assert.equal(layers.get(HOST_LAYERS.extrusion).minzoom, HOST_MIN_ZOOM);
  assert.equal(HOST_MIN_ZOOM, 13, 'host mass and context start at the same overview zoom');
  assert.deepEqual(controller.visibleExtrusionFeatures().map(f => f.id), ['valid']);
  zoom = 12.9;
  assert.equal(controller.visibleExtrusionFeatures().length, 0);
  zoom = 15;
  controller.update({enabled: false});
  assert.equal(controller.visibleExtrusionFeatures().length, 0);
  controller.dispose();
});

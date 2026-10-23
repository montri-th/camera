/**
 * Pure view models for the reading panel: neighborhood profile, store detail,
 * banner presence and the overview insights. No DOM, no map. Every function
 * works on the committed selected rows the app already filtered, and uses the
 * same frozen neighborhood assignment as the map and charts.
 *
 * Counting rules (shared with chart-model.js):
 * - "brands" = Set of distinct shop banners (ร้าน); repeated outlets of one banner
 *   count once; a co-branded outlet contributes each of its counted banners
 * - "pos" = number of outlet rows (สาขา)
 * - segment mixes count (outlet × banner) pairs by each banner's own segment
 * - exclusive/shared compare ALL assigned neighborhoods in the selection, never a top-N
 */
import {SEGMENTS, CHANNELS, hasPoint, isClosed, bannersOf, bannerSegmentsOf} from './model.js?v=20261023-camera-r2';
import {assignNeighborhood, summarizeNeighborhoods} from './neighborhoods.js?v=20261023-camera-r2';
import {buildNeighborhoodChartModel} from './chart-model.js?v=20261023-camera-r2';

const text = value => String(value ?? '').trim();
const areaId = feature => feature?.properties?.id ?? feature?.id;
const uniq = values => [...new Set(values.filter(Boolean))];
const bannerNames = rows => uniq(rows.flatMap(r => bannersOf(r).map(text)));
/** Venue grouping key: the CityMETER host id, else the venue label; '' for a row without a venue (street shop). */
const venueKeyOf = r => r.mallId || (text(r.venue) ? `venue:${text(r.venue)}` : '');

/** Banners and outlets per segment; a co-branded outlet counts in each of its banners' segments. */
export function segmentMixOf(members = []) {
  return Object.entries(SEGMENTS).map(([sid, name], i) => {
    const rows = members.filter(r => bannerSegmentsOf(r).includes(sid));
    const brands = uniq(rows.flatMap(r => { const segs = bannerSegmentsOf(r); return bannersOf(r).filter((b, j) => segs[j] === sid).map(text); }));
    return {id: sid, name, index: i + 1, brands: brands.length, pos: rows.length};
  }).filter(s => s.pos > 0).sort((a, b) => b.brands - a.brands || b.pos - a.pos);
}

/** Thai reading of the geometry role carried by a row; never upgrades precision. */
export function describeGeometry(row = {}) {
  const role = text(row.geometryRole), status = text(row.geometryStatus);
  if (!hasPoint(row) && row.venueJoin === 'held') return {level: 'review', label: 'พิกัดรอตรวจ', note: 'ชื่อหรือขอบเขตของสถานที่ยังรอตรวจ จึงยังไม่วางจุด'};
  if (!hasPoint(row)) return {level: 'none', label: 'ยังไม่มีพิกัด', note: 'รายการยังอยู่ในตารางและจำนวน แต่ไม่สร้างตำแหน่งขึ้นใหม่'};
  if (/host_hypermarket/.test(role)) return {level: 'host', label: 'จุดตัวแทนไฮเปอร์มาร์เก็ต', note: 'ไม่ใช่ประตูร้านหรือชั้นที่ตั้ง'};
  if (/host_complex|host_building|host_hotel|host_reference|official_venue_event_reference|representative|shared_building|other_tenant/.test(role) || /representative/.test(status)) {
    return {level: 'host', label: 'จุดตัวแทนอาคาร/ศูนย์การค้า', note: 'ไม่ใช่ประตูร้านหรือชั้นที่ตั้ง'};
  }
  if (/official_store_locator|official_published|official_linked_store|official_retailer_location_pin|retailer_published_|store_source_point/.test(role) || /official_published|official_linked_place/.test(status)) {
    return {level: 'official', label: 'จุดร้านจากแหล่งทางการของแบรนด์', note: 'ตำแหน่งตามที่แบรนด์เผยแพร่'};
  }
  if (/unresolved|held/.test(status) || /unresolved/.test(role)) {
    return {level: 'review', label: 'ตำแหน่งรอตรวจตัวตน', note: 'หลักฐานตำแหน่งยังไม่สอดคล้องกับรายการ'};
  }
  if (/not_currently_verified/.test(status)) {
    return {level: 'provider-historic', label: 'จุดร้านจากผู้ให้บริการแผนที่ (ประวัติเดิม)', note: 'ยังไม่ได้ตรวจซ้ำในรอบล่าสุด'};
  }
  return {level: 'provider', label: 'จุดร้านจากผู้ให้บริการแผนที่', note: 'ตรงกับรายการแบรนด์และสถานที่ในรอบล่าสุด'};
}

/** Thai status label; closures stay factual and are never softened; holds keep their own label. */
export function describeStatus(row = {}) {
  if (isClosed(row)) return {tone: 'closed', label: 'ปิดถาวร', detail: 'พบหลักฐานปิดถาวร'};
  if (row.role === 'retailer_contact_location') return {tone: 'pending', label: 'ที่อยู่ติดต่อ', detail: 'ที่อยู่ร้านตามเว็บไซต์ ยังไม่ยืนยันว่าเป็นหน้าร้านขายปลีก'};
  switch (row.identity) {
    case 'shared_venue_identity_review': return {tone: 'pending', label: 'ตัวตนหน้าร้านรอตรวจ', detail: 'สองเครือข่ายระบุร้านในสถานที่เดียวกัน ยังไม่ยืนยันว่าเป็นหน้าร้านเดียวกันหรือไม่'};
    case 'same_unit_floor_conflict_review': return {tone: 'pending', label: 'รวมรายการรอตรวจ', detail: 'สองรายการชี้ห้องเดียวกัน รวมเป็นสาขาเดียวชั่วคราว'};
    case 'location_conflict_review': return {tone: 'pending', label: 'ที่ตั้งขัดกัน', detail: 'แหล่งข้อมูลระบุที่ตั้งไม่ตรงกัน ยังไม่เลือกจุดใด'};
    default: break;
  }
  switch (row.status) {
    case 'source_listed_not_field_verified': return {tone: 'listed', label: 'พบในแหล่งข้อมูล', detail: 'มีรายการในแหล่งทางการของร้านหรือสถานที่'};
    case 'temporarily closed': return {tone: 'pending', label: 'ปิดชั่วคราว', detail: 'แหล่งข้อมูลระบุปิดชั่วคราว'};
    case 'closure_conflict_review': return {tone: 'pending', label: 'หลักฐานขัดกัน', detail: 'สถานะเปิด/ปิดยังขัดกัน รอตรวจ'};
    case 'provider_listed_not_field_verified': return {tone: 'neutral', label: 'พบในแหล่งแผนที่', detail: 'ยังไม่ได้ตรวจซ้ำกับแบรนด์'};
    case 'not_revalidated': return {tone: 'pending', label: 'ยังไม่ตรวจซ้ำ', detail: 'ประวัติเดิมที่ยังไม่ตรวจซ้ำ'};
    case 'source_listed': return {tone: 'listed', label: 'พบในแหล่งข้อมูล', detail: 'มีรายการในแหล่งของแบรนด์หรือสถานที่'};
    default: return {tone: 'neutral', label: text(row.status) || 'ไม่ระบุสถานะ', detail: ''};
  }
}

/**
 * Overview insights for the Aha block.
 * Returns the top-three area summary plus one "exclusivity" finding computed
 * against all assigned neighborhoods of the selection.
 */
export function buildOverviewInsights(rows = [], geojson, segments = []) {
  const model = buildNeighborhoodChartModel(rows, geojson, segments);
  const byExclusive = [...model.areas].sort((a, b) => b.exclusiveBrands - a.exclusiveBrands || b.brands - a.brands || a.name.localeCompare(b.name));
  const mostExclusive = byExclusive[0] && byExclusive[0].exclusiveBrands > 0 ? byExclusive[0] : null;
  return {
    areaCount: model.areaCount,
    totalPos: model.totalPos,
    totalBrands: model.totalBrands,
    assignedPos: model.assignedPos,
    outsidePos: model.outsidePos,
    ranking: model.areas,
    mostExclusive: mostExclusive ? {id: mostExclusive.id, name: mostExclusive.name, exclusiveBrands: mostExclusive.exclusiveBrands, brands: mostExclusive.brands} : null,
  };
}

/**
 * Full profile of one defined neighborhood within the selected rows.
 * `allRows` are the committed selection (before any single-area focus) so the
 * exclusive/shared comparison keeps the whole selection as its reference.
 */
export function buildNeighborhoodProfile(allRows = [], feature, geojson, centers = [], segments = []) {
  if (!feature) return null;
  const id = areaId(feature), p = feature.properties || {};
  const model = buildNeighborhoodChartModel(allRows, geojson, segments);
  const area = model.areas.find(a => a.id === id);
  const members = allRows.filter(r => hasPoint(r) && areaId(assignNeighborhood(r, geojson)) === id);
  const brandAreas = new Map();
  for (const other of model.areas) for (const brand of other.brandNames) {
    if (!brandAreas.has(brand)) brandAreas.set(brand, []);
    brandAreas.get(brand).push({id: other.id, name: other.name});
  }
  const brandNames = bannerNames(members).sort((a, b) => a.localeCompare(b));
  const exclusive = brandNames.filter(b => (brandAreas.get(b) || []).length === 1);
  const shared = brandNames.filter(b => (brandAreas.get(b) || []).length > 1).map(b => ({
    brand: b,
    elsewhere: (brandAreas.get(b) || []).filter(a => a.id !== id).map(a => a.name),
  }));
  const venueMap = new Map();
  for (const r of members) {
    const key = venueKeyOf(r);
    if (!key) continue;
    if (!venueMap.has(key)) venueMap.set(key, {key, mallId: r.mallId || '', name: text(r.venue), rows: []});
    venueMap.get(key).rows.push(r);
  }
  const venues = [...venueMap.values()].map(v => {
    const center = centers.find(c => c.id === v.mallId) || null;
    return {
      key: v.key, mallId: v.mallId, name: center?.name || v.name, nameTh: center?.nameTh || '', venue: v.name,
      type: center?.type || '', pos: v.rows.length, brands: bannerNames(v.rows).length,
      latitude: center?.latitude ?? v.rows.find(hasPoint)?.latitude ?? null,
      longitude: center?.longitude ?? v.rows.find(hasPoint)?.longitude ?? null,
      source: center?.source || '', rowIds: v.rows.map(r => r.id),
    };
  }).sort((a, b) => b.brands - a.brands || b.pos - a.pos || a.name.localeCompare(b.name));
  const segmentMix = segmentMixOf(members);
  const channels = Object.entries(CHANNELS).map(([cid, name]) => ({id: cid, name, pos: members.filter(r => r.channel === cid).length})).filter(c => c.pos > 0).sort((a, b) => b.pos - a.pos);
  const closed = members.filter(isClosed).length;
  return {
    id, name: p.name || p.nameTh || id, nameEn: p.nameEn || '', status: p.status || '', confidence: p.confidence || '',
    definition: p.definition || '', edges: p.edges || null, sourceURLs: Array.isArray(p.sourceURLs) ? p.sourceURLs : [],
    checkedOn: p.checkedOn || '', boundaryType: p.boundaryType || '', productionUrl: p.productionUrl || '',
    pos: members.length, brands: brandNames.length, brandNames, exclusive, shared, venues, segmentMix, channels, closed,
    rank: area ? model.areas.indexOf(area) + 1 : null, areaCount: model.areaCount, totalBrands: model.totalBrands,
    rowIds: members.map(r => r.id),
  };
}

/** Where else a banner appears inside the selected rows (for the store detail). */
export function buildBrandPresence(rows = [], brand, geojson) {
  const key = text(brand).toLocaleLowerCase();
  const stores = rows.filter(r => bannersOf(r).some(b => text(b).toLocaleLowerCase() === key));
  const areas = uniq(stores.map(r => assignNeighborhood(r, geojson)?.properties?.name || ''));
  return {brand: text(brand), pos: stores.length, venues: uniq(stores.map(r => text(r.venue))).length, areas, stores};
}

/** Detail model for a single point of sale. */
export function buildStoreDetail(row, {rows = [], geojson, centers = []} = {}) {
  if (!row) return null;
  const area = assignNeighborhood(row, geojson);
  const center = centers.find(c => c.id === row.mallId) || null;
  const siblings = rows.filter(r => r.id !== row.id && hasPoint(r) && hasPoint(row) && Math.abs(r.latitude - row.latitude) < 1e-9 && Math.abs(r.longitude - row.longitude) < 1e-9);
  return {
    row, area: area ? {id: areaId(area), name: area.properties?.name || ''} : null, center,
    status: describeStatus(row), geometry: describeGeometry(row),
    segment: SEGMENTS[row.segment] || row.segment || '', channel: CHANNELS[row.channel] || row.channel || '',
    presence: buildBrandPresence(rows, row.brand, geojson),
    coLocated: siblings.length,
  };
}

/** Venue (shopping center / host) summary within the selection. */
export function buildVenueProfile(rows = [], {mallId = '', venue = '', centers = [], geojson} = {}) {
  const members = rows.filter(r => (mallId && r.mallId === mallId) || (!mallId && text(r.venue) === text(venue)));
  if (!members.length) return null;
  const center = centers.find(c => c.id === mallId) || null;
  const area = assignNeighborhood(members.find(hasPoint) || {}, geojson);
  const segmentMix = segmentMixOf(members);
  return {
    mallId, name: center?.name || text(members[0].venue), nameTh: center?.nameTh || '', type: center?.type || '', kind: center?.kind || '',
    venue: text(members[0].venue),
    gla: center?.gla ?? null, glaSource: center?.glaSource || '', source: center?.source || '',
    province: text(members[0].province), area: area ? {id: areaId(area), name: area.properties?.name || ''} : null,
    pos: members.length, brands: bannerNames(members).length, segmentMix,
    rows: [...members].sort((a, b) => text(a.brand).localeCompare(text(b.brand))),
    latitude: center?.latitude ?? members.find(hasPoint)?.latitude ?? null,
    longitude: center?.longitude ?? members.find(hasPoint)?.longitude ?? null,
  };
}

/** Venues (CityMETER hosts or plain venue labels) ranked by distinct banners within the selection; street shops without a venue are not a venue. */
export function rankVenues(rows = [], centers = []) {
  const groups = new Map();
  for (const r of rows) {
    const key = venueKeyOf(r);
    if (!key) continue;
    if (!groups.has(key)) groups.set(key, {key, mallId: r.mallId || '', venue: text(r.venue), rows: []});
    groups.get(key).rows.push(r);
  }
  return [...groups.values()].map(g => {
    const center = centers.find(c => c.id === g.mallId) || null;
    return {key: g.key, mallId: g.mallId, name: center?.name || g.venue, venue: g.venue, type: center?.type || '', province: text(g.rows[0].province),
      brands: bannerNames(g.rows).length, pos: g.rows.length};
  }).sort((a, b) => b.brands - a.brands || b.pos - a.pos || a.name.localeCompare(b.name));
}

/** Rows of a neighborhood inside the selection (same assignment as the map). */
export function neighborhoodMembers(rows = [], feature, geojson) {
  if (!feature) return [];
  const id = areaId(feature);
  return rows.filter(r => hasPoint(r) && areaId(assignNeighborhood(r, geojson)) === id);
}

export {summarizeNeighborhoods};

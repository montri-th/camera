/**
 * Dataset vocabulary, shared filter and summary helpers.
 *
 * Rows are camera-shop outlet records from data/camera.json: one row = one
 * outlet (a point of sale, or a listed contact location) of a shop banner. A
 * co-branded storefront stays ONE row whose `brands` lists every counted banner
 * (retail banner + host-counter banner; an operator is not a banner) with the
 * matching `bannerSegments`. Nothing here mutates a row; summaries count
 * distinct banners (ร้าน) separately from outlet rows (สาขา).
 */

/** Segment taxonomy (research scope groups A–E). Order is the stable categorical series assignment (series.01–.05). */
export const SEGMENTS = Object.freeze({
  multibrand_camera: 'กล้องหลายแบรนด์',
  used_film_specialist: 'มือสองและฟิล์ม',
  manufacturer_brand_store: 'ร้านแบรนด์ผู้ผลิต',
  imaging_equipment_specialist: 'โดรนและอุปกรณ์ภาพ',
  adjacent_retail_channel: 'ช่องทางขายเสริม',
});

/** Short Thai labels for dense surfaces (matrix columns, chips). */
export const SEGMENT_SHORT = Object.freeze({
  multibrand_camera: 'หลายแบรนด์',
  used_film_specialist: 'มือสอง/ฟิล์ม',
  manufacturer_brand_store: 'แบรนด์ผู้ผลิต',
  imaging_equipment_specialist: 'โดรน/อุปกรณ์',
  adjacent_retail_channel: 'ช่องทางเสริม',
  __unclassified__: 'ยังไม่จัดกลุ่ม',
});

export const CHANNELS = Object.freeze({
  mall: 'ในศูนย์การค้า',
  street_or_building: 'ริมถนน / อาคาร',
  hotel_or_appointment: 'นัดหมาย / โรงแรม',
  downtown_travel_retail: 'ดิวตี้ฟรีในเมือง',
});

/**
 * Store-format codes of the research sheet in Thai (display only). Named formats
 * (BIG Camera Galleria, Wonder Photo Shop by BIG Camera …) are shown as written.
 */
export const FORMATS = Object.freeze({
  shopping_center_store: 'ร้านในศูนย์การค้า', brand_store: 'ร้านแบรนด์', street_standalone: 'ร้านริมถนน',
  specialist_showroom_and_sales: 'โชว์รูมและจุดขายเฉพาะทาง', standalone_store: 'ร้านเดี่ยว', standalone_showroom: 'โชว์รูมเดี่ยว',
  multibrand_concept_store: 'คอนเซปต์สโตร์หลายแบรนด์', hotel_or_appointment: 'นัดหมาย / โรงแรม', in_store_brand_format: 'มุมแบรนด์ในร้าน',
  co_branded_store: 'ร้านร่วมแบรนด์', brand_store_experience_center: 'ร้านแบรนด์และศูนย์ประสบการณ์', building_showroom: 'โชว์รูมในอาคาร',
  appointment_showroom: 'โชว์รูมแบบนัดหมาย', downtown_travel_retail: 'ดิวตี้ฟรีในเมือง', adjacent_retail_channel_store: 'ร้านช่องทางขายเสริม',
});
/** The format line of an outlet, or '' when it only repeats the banner name. */
export const formatLabel = r => {
  const raw = String(r?.format || '').trim();
  if (!raw) return '';
  const label = FORMATS[raw] || raw.split(/;\s*/).join(' · ');
  return label.toLocaleLowerCase() === String(r?.brand || '').toLocaleLowerCase() ? '' : label;
};

/** Default `current` = retail outlet listings; `all` adds the listed contact location; `review` = identity or location holds. */
export const COHORTS = Object.freeze({
  current: 'สาขาขายปลีก',
  all: 'ทั้งหมด รวมที่อยู่ติดต่อ',
  review: 'รอตรวจตัวตน / ที่ตั้ง',
});
export const DEFAULT_COHORT = 'current';

/**
 * All 77 provinces, keyed by the code CityMETER production uses in its
 * drill-down path (/v3/citymeter/{code}; production base/info/lv0 `abbrEn`,
 * retrieved 2026-10-22). `th` is the value stored in each row's `province`
 * field and the breadcrumb label; `dopa` is the two-digit DOPA code (order).
 */
export const PROVINCES = Object.freeze([
  ['BKK', 'กรุงเทพมหานคร', 'Bangkok', '10'], ['SPK', 'สมุทรปราการ', 'Samut Prakan', '11'], ['NBI', 'นนทบุรี', 'Nonthaburi', '12'],
  ['PTE', 'ปทุมธานี', 'Pathum Thani', '13'], ['AYA', 'พระนครศรีอยุธยา', 'Phra Nakhon Si Ayutthaya', '14'], ['ATG', 'อ่างทอง', 'Ang Thong', '15'],
  ['LRI', 'ลพบุรี', 'Lop Buri', '16'], ['SBR', 'สิงห์บุรี', 'Sing Buri', '17'], ['CNT', 'ชัยนาท', 'Chai Nat', '18'],
  ['SRI', 'สระบุรี', 'Saraburi', '19'], ['CBI', 'ชลบุรี', 'Chon Buri', '20'], ['RYG', 'ระยอง', 'Rayong', '21'],
  ['CTI', 'จันทบุรี', 'Chanthaburi', '22'], ['TRT', 'ตราด', 'Trat', '23'], ['CCO', 'ฉะเชิงเทรา', 'Chachoengsao', '24'],
  ['PRI', 'ปราจีนบุรี', 'Prachin Buri', '25'], ['NYK', 'นครนายก', 'Nakhon Nayok', '26'], ['SKW', 'สระแก้ว', 'Sa Kaeo', '27'],
  ['NMA', 'นครราชสีมา', 'Nakhon Ratchasima', '30'], ['BRM', 'บุรีรัมย์', 'Buri Ram', '31'], ['SRN', 'สุรินทร์', 'Surin', '32'],
  ['SSK', 'ศรีสะเกษ', 'Si Sa Ket', '33'], ['UBN', 'อุบลราชธานี', 'Ubon Ratchathani', '34'], ['YST', 'ยโสธร', 'Yasothon', '35'],
  ['CPM', 'ชัยภูมิ', 'Chaiyaphum', '36'], ['ACR', 'อำนาจเจริญ', 'Amnat Charoen', '37'], ['BKN', 'บึงกาฬ', 'Bueng Kan', '38'],
  ['NBP', 'หนองบัวลำภู', 'Nong Bua Lam Phu', '39'], ['KKN', 'ขอนแก่น', 'Khon Kaen', '40'], ['UDN', 'อุดรธานี', 'Udon Thani', '41'],
  ['LEI', 'เลย', 'Loei', '42'], ['NKI', 'หนองคาย', 'Nong Khai', '43'], ['MKM', 'มหาสารคาม', 'Maha Sarakham', '44'],
  ['RET', 'ร้อยเอ็ด', 'Roi Et', '45'], ['KSN', 'กาฬสินธุ์', 'Kalasin', '46'], ['SNK', 'สกลนคร', 'Sakon Nakhon', '47'],
  ['NPM', 'นครพนม', 'Nakhon Phanom', '48'], ['MDH', 'มุกดาหาร', 'Mukdahan', '49'], ['CMI', 'เชียงใหม่', 'Chiang Mai', '50'],
  ['LPN', 'ลำพูน', 'Lamphun', '51'], ['LPG', 'ลำปาง', 'Lampang', '52'], ['UTT', 'อุตรดิตถ์', 'Uttaradit', '53'],
  ['PRE', 'แพร่', 'Phrae', '54'], ['NAN', 'น่าน', 'Nan', '55'], ['PYO', 'พะเยา', 'Phayao', '56'],
  ['CRI', 'เชียงราย', 'Chiang Rai', '57'], ['MSN', 'แม่ฮ่องสอน', 'Mae Hong Son', '58'], ['NSN', 'นครสวรรค์', 'Nakhon Sawan', '60'],
  ['UTI', 'อุทัยธานี', 'Uthai Thani', '61'], ['KPT', 'กำแพงเพชร', 'Kamphaeng Phet', '62'], ['TAK', 'ตาก', 'Tak', '63'],
  ['STI', 'สุโขทัย', 'Sukhothai', '64'], ['PLK', 'พิษณุโลก', 'Phitsanulok', '65'], ['PCT', 'พิจิตร', 'Phichit', '66'],
  ['PNB', 'เพชรบูรณ์', 'Phetchabun', '67'], ['RBR', 'ราชบุรี', 'Ratchaburi', '70'], ['KRI', 'กาญจนบุรี', 'Kanchanaburi', '71'],
  ['SPB', 'สุพรรณบุรี', 'Suphan Buri', '72'], ['NPT', 'นครปฐม', 'Nakhon Pathom', '73'], ['SKN', 'สมุทรสาคร', 'Samut Sakhon', '74'],
  ['SKM', 'สมุทรสงคราม', 'Samut Songkhram', '75'], ['PBI', 'เพชรบุรี', 'Phetchaburi', '76'], ['PKN', 'ประจวบคีรีขันธ์', 'Prachuap Khiri Khan', '77'],
  ['NST', 'นครศรีธรรมราช', 'Nakhon Si Thammarat', '80'], ['KBI', 'กระบี่', 'Krabi', '81'], ['PNA', 'พังงา', 'Phangnga', '82'],
  ['PKT', 'ภูเก็ต', 'Phuket', '83'], ['SNI', 'สุราษฎร์ธานี', 'Surat Thani', '84'], ['RNG', 'ระนอง', 'Ranong', '85'],
  ['CPN', 'ชุมพร', 'Chumphon', '86'], ['SKA', 'สงขลา', 'Songkhla', '90'], ['STN', 'สตูล', 'Satun', '91'],
  ['TRG', 'ตรัง', 'Trang', '92'], ['PLG', 'พัทลุง', 'Phatthalung', '93'], ['PTN', 'ปัตตานี', 'Pattani', '94'],
  ['YLA', 'ยะลา', 'Yala', '95'], ['NWT', 'นราธิวาส', 'Narathiwat', '96'],
].map(([code, th, en, dopa]) => Object.freeze({code, th, en, dopa})));
export const provinceByCode = code => PROVINCES.find(p => p.code === String(code || '').toUpperCase()) || null;
/** Accept the dataset (Thai) name or the English name. */
export const provinceByName = name => PROVINCES.find(p => p.th === name || p.en === name) || null;
/** Accept a production code (BKK) or a name; returns the dataset (Thai) name or ''. */
export const provinceNameFrom = value => (provinceByCode(value) || provinceByName(value))?.th || '';

/** A usable source coordinate inside Thailand's bounding box. */
export const hasPoint = r => Number.isFinite(r.latitude) && Number.isFinite(r.longitude) &&
  r.latitude >= 5 && r.latitude <= 21 && r.longitude >= 97 && r.longitude <= 106;

/** Closures stay factual; the 2026-10-22 research has no closed outlet row (Eastbourne closed at brand level). */
export const isClosed = r => r.status === 'permanently_closed' || r.status === 'permanently closed';
/** Identity, unit or location holds, or a listed contact location (not a point of sale). */
export const isReview = r => r.role !== 'retail_outlet_listing' || (Boolean(r.identity) && r.identity !== 'source_listed_not_field_verified');

/**
 * Map-chip labels for long banner names (display only: rows, search and counts
 * keep the research name). Every label is the research name's own leading words
 * or one of its 01_BRANDS aliases; names of 18 characters or fewer are shown as is.
 */
export const BANNER_LABELS = Object.freeze({
  'Insta360 Experience Store by BIG Camera': 'Insta360',
  'FUJIFILM House of Photography Bangkok': 'FUJIFILM House',
  'DJI Experience Store': 'DJI Experience',
  'Hasselblad Bangkok Store': 'Hasselblad Store',
  'Leica Store / Leica Boutique': 'Leica Store',
  'JIA Colorlab / JIA Camera': 'JIA Colorlab',
  'DJI 13 Store / 13Store': '13Store',
  'B2H / Best2Home': 'B2H',
  'STM / STM-Viltrox': 'STM',
  'SYG Camera Thailand': 'SYG Camera',
});
export const bannerLabel = name => BANNER_LABELS[name] || (String(name || '').length > 18 ? `${String(name).slice(0, 17).trimEnd()}…` : String(name || ''));

/** Counted banners of a row (primary first). */
export const bannersOf = r => {
  const list = Array.isArray(r?.brands) && r.brands.length ? r.brands : [r?.brand];
  return list.filter(Boolean);
};
/** Segment of each banner of a row, parallel to bannersOf. */
export const bannerSegmentsOf = r => {
  const list = Array.isArray(r?.brands) && r.brands.length ? r.brands : [r?.brand];
  const segs = Array.isArray(r?.bannerSegments) ? r.bannerSegments : [];
  return list.map((b, i) => segs[i] || r?.segment || '').filter((s, i) => Boolean(list[i]));
};
/** Distinct banners over rows. */
export function brandSet(rows = []) {
  const out = new Set();
  for (const r of rows) for (const b of bannersOf(r)) out.add(b);
  return out;
}
export const countBrands = rows => brandSet(rows).size;

/**
 * A segment view of one row: only the banners of that segment, the first of them
 * as `brand`. Returns the row itself when nothing changes (a copy otherwise —
 * never a mutation); null when the row has no banner of the segment.
 */
export function projectSegment(r, segment) {
  const names = bannersOf(r), segs = bannerSegmentsOf(r);
  const keep = names.map((b, i) => (segs[i] === segment ? i : -1)).filter(i => i >= 0);
  if (!keep.length) return null;
  if (keep.length === names.length && r.segment === segment) return r;
  return {...r, brand: names[keep[0]], brands: keep.map(i => names[i]), bannerSegments: keep.map(() => segment), segment};
}

/**
 * Shared filter used by map, counters, charts, panel and table.
 * Default cohort `current` = retail outlet listings (identity holds stay in, with
 * their status label). A segment filter keeps an outlet when any of its banners
 * is in the segment and counts only those banners.
 */
export function filterRows(rows, f = {}) {
  const q = (f.search || '').trim().toLocaleLowerCase();
  const cohort = f.cohort || DEFAULT_COHORT;
  const out = [];
  for (const source of rows) {
    if (cohort === 'current' && source.role !== 'retail_outlet_listing') continue;
    if (cohort === 'review' && !isReview(source)) continue;
    if (cohort === 'closed' && !isClosed(source)) continue;
    const r = f.segment ? projectSegment(source, f.segment) : source;
    if (!r) continue;
    if (f.province && r.province !== f.province) continue;
    if (f.channel && r.channel !== f.channel) continue;
    if (f.venue && r.venue !== f.venue) continue;
    if (f.mallId && r.mallId !== f.mallId) continue;
    if (f.mallIds && !f.mallIds.has(r.mallId)) continue;
    if (f.neighborhoodIds && !f.neighborhoodIds.has(r.id)) continue;
    if (q && ![...bannersOf(source), r.name, r.venue, r.neighborhood, r.province].some(v => (v || '').toLocaleLowerCase().includes(q))) continue;
    out.push(r);
  }
  return out;
}

const venueKey = r => r.mallId || (r.venue ? `venue:${r.venue}` : '');

/** Counts for the selection: distinct banners, outlet rows, mapped rows, hosts, venues and segments. */
export function summarize(rows, shoppingCenters) {
  const grouped = new Map();
  for (const r of rows) {
    if (!r.mallId) continue;
    if (!grouped.has(r.mallId)) grouped.set(r.mallId, []);
    grouped.get(r.mallId).push(r);
  }
  const centers = (shoppingCenters || []).filter(c => grouped.has(c.id)).map(c => {
    const rs = grouped.get(c.id);
    return {...c, brands: countBrands(rs), pos: rs.length, venue: rs[0].venue, segments: [...new Set(rs.flatMap(bannerSegmentsOf))]};
  }).sort((a, b) => b.brands - a.brands || a.name.localeCompare(b.name));
  const segments = Object.entries(SEGMENTS).map(([id, name]) => {
    const rs = rows.filter(r => bannerSegmentsOf(r).includes(id));
    return {id, name, count: rs.length, brands: new Set(rs.flatMap(r => bannersOf(r).filter((b, i) => bannerSegmentsOf(r)[i] === id))).size};
  }).filter(r => r.count);
  const venues = new Set(rows.map(venueKey).filter(Boolean)).size;
  return {brands: countBrands(rows), pos: rows.length, mapped: rows.filter(hasPoint).length, centers, venues, segments};
}

/** Retained compatibility model: top three hosts (the pre-neighborhood Aha). */
export function summarizeFirstInsight(rows = [], shoppingCenters = []) {
  const selected = Array.isArray(rows) ? rows : [], hosts = Array.isArray(shoppingCenters) ? shoppingCenters : [];
  const summary = summarize(selected, hosts), centers = summary.centers.slice(0, 3);
  const centerIds = centers.map(center => center.id), ids = new Set(centerIds);
  const topRows = selected.filter(row => ids.has(row.mallId));
  // A banner present in several hosts contributes once to the coverage numerator.
  const brands = countBrands(topRows), totalBrands = summary.brands;
  return {centers, centerIds, brands, totalBrands, share: totalBrands ? (brands / totalBrands) * 100 : 0, pos: topRows.length, totalPos: selected.length};
}

/**
 * One GeoJSON point feature per mapped row. Co-location never merges rows and
 * never changes the source coordinate; screen displacement lives in pins.js.
 */
export function pointFeatures(rows) {
  return {
    type: 'FeatureCollection',
    features: rows.filter(hasPoint).map(r => ({
      type: 'Feature', id: r.id,
      geometry: {type: 'Point', coordinates: [r.longitude, r.latitude]},
      properties: {id: r.id, brand: r.brand, venue: r.venue, closed: isClosed(r) ? 1 : 0},
    })),
  };
}

export const safeURL = value => {
  try { const u = new URL(value); return u.protocol === 'https:' ? u.href : ''; }
  catch { return ''; }
};

/** Retained for tests and scripted exports; there is no CSV control in the UI (INV07). */
export function toCSV(rows) {
  const headers = ['id', 'brand', 'brands', 'name', 'venue', 'province', 'segment', 'channel', 'status', 'identity', 'role', 'latitude', 'longitude', 'geometryRole', 'geometryStatus', 'coordinateSource', 'mallId', 'hostKind', 'source', 'statusSource', 'checkedOn'];
  const quote = v => { const s = v == null ? '' : Array.isArray(v) ? v.join('; ') : String(v); return '"' + (/^[=+@\-]/.test(s) ? "'" + s : s).replaceAll('"', '""') + '"'; };
  return '﻿' + [headers, ...rows.map(r => headers.map(h => r[h]))].map(a => a.map(quote).join(',')).join('\r\n');
}

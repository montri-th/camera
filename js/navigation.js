/**
 * This demo's navigation on the shared header code: the titles of its controls and its pictogram subset. The
 * nav-7 glyphs and the help dialog are js/shell/navigation.js, the dataset picker js/shell/header.js
 * (citymeter-shell: edit those in every repository at once, js/shell/manifest.json).
 */
import {installNavigation, NAV_GLYPHS, NAV_ICON_CONTRACT} from './shell/navigation.js';
import {installHeader} from './shell/header.js';

export {NAV_GLYPHS, NAV_ICON_CONTRACT};

/**
 * Metric-tile pictograms (test exception approved by the owner 2026-10-22; to be
 * registered in LDS if it proves itself). Same family and axes as nav-7, a
 * separate subset so the approved nav-7 bytes stay unchanged. Roles → glyphs:
 * brand (แบรนด์) photo_camera · store storefront · venue local_mall · area map ·
 * province location_city · exclusive star · gla square_foot · segment category.
 */
export const PICTOGRAM_CONTRACT = Object.freeze({
  family: 'LDS Material Symbols Rounded Pictogram',
  file: 'assets/icons/material-pictogram-300.woff2', bytes: 1724,
  sha256: '259de66e057385539f2352657951597b1cad7206c1ca03205373e7f39d8edcb4',
  manifest: 'assets/icons/material-pictogram-300.json',
  axes: Object.freeze({FILL: 0, wght: 300, GRAD: 0, opsz: 24}),
  glyphs: Object.freeze({brand: '\uE412', store: '\uEA12', venue: '\uE54C', area: '\uE55B', province: '\uE7F1', exclusive: '\uF09A', gla: '\uEA49', segment: '\uE72C'}),
  status: 'test exception to LDS nav-7 (owner 2026-10-22)',
  fallback: 'Text labels carry the meaning; pictograms stay hidden until the font has loaded.',
});
const TITLES = {
  'fit-map': 'ปรับแผนที่ให้เห็นทุกสาขาตามตัวกรอง',
  'bangkok-map': 'กลับไปดูพื้นที่กรุงเทพฯ',
  'toggle-3d': 'สลับมุมมอง 3 มิติ (อาคารทั้งเมือง) กับแผนผัง 2 มิติ',
  'toggle-eye': 'มุมสถาปนิก: เปอร์สเปกทีฟ 2 จุดที่ระดับศูนย์การค้า อาคารรอบข้างจางลง อาคารที่บังศูนย์การค้าโปร่งใส',
  'toggle-neighborhoods': 'แสดงหรือซ่อนสีและขอบเขตย่าน',
  'mobile-panel': 'เปิดแผงข้อมูลและตัวกรอง',
  'open-help': 'เปิดวิธีใช้',
  'toggle-insights': 'เปิดหรือย่อกราฟเปรียบเทียบย่าน',
  'open-table': 'เปิดตารางสาขาตามตัวกรอง',
  'toggle-table': 'ปิดตารางและกลับไปแผนที่',
  'search': 'ค้นหาแบรนด์ สาขา ศูนย์การค้า ย่าน หรือจังหวัด',
  'cohort': 'เลือกสาขาขายปลีก ทั้งหมด หรือรายการที่รอตรวจตัวตนและที่ตั้ง',
  'segment': 'เลือกประเภทแบรนด์',
  'province': 'กรองตามจังหวัด',
  'count-metric': 'เลือกจำนวนแบรนด์ไม่ซ้ำหรือจำนวนสาขาสำหรับสี ป้าย และอันดับ',
  'channel': 'แยกร้านในศูนย์การค้า ร้านริมถนน/อาคาร และรูปแบบอื่น',
  'venue': 'กรองตามศูนย์การค้า (ศูนย์การค้า ไฮเปอร์มาร์เก็ต หรืออาคาร)',
  'neighborhood': 'เลือกย่าน (Locale ของ CityMETER ในกรุงเทพฯ)',
  'prev-page': 'ดูหน้าก่อนหน้าของตาราง',
  'next-page': 'ดูหน้าถัดไปของตาราง',
  'tab-centers': 'เปรียบเทียบจำนวนแบรนด์ในแต่ละย่าน',
  'tab-mix': 'ดูบุคลิกของย่านผ่านประเภทแบรนด์',
  'tab-compare': 'เปรียบเทียบแบรนด์เฉพาะย่านและแบรนด์ที่พบร่วมกัน',
};

if (typeof document !== 'undefined') {
  installNavigation({titles: TITLES, pictogramProbe: PICTOGRAM_CONTRACT.glyphs.store});
  installHeader();
}

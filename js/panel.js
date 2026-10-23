/**
 * Reading panel views as HTML strings. Pure: no DOM access, no map.
 *
 * Every actionable element carries data-action (and data-id / data-value) and
 * the app binds one delegated click handler. Actions:
 *   select-area · select-store · select-venue · search-brand · back
 *   explore-top · clear-focus · open-charts · open-table · clear-filter · select-province
 *
 * Copy is Thai, short and natural (owner instruction 2026-10-22: no caveats on
 * screen — provenance lives in the data section, help and docs). Units:
 * ร้าน = distinct shop banners (BIG CAMERA, Sony Store …), สาขา = one outlet
 * record (store, counter or shop-in-shop; a co-branded storefront is one สาขา),
 * สถานที่ = venue (shopping centre, hypermarket or building), ย่าน = CityMETER
 * Locale. "แบรนด์" is not used: it would read as camera makers. Closures stay
 * factual; missing is never zero.
 * Metric tiles and section headings carry pictograms (Material Symbols Rounded
 * subset, js/navigation.js PICTOGRAM_CONTRACT) so labels can stay one word; the
 * text is the meaning, the pictogram is decorative.
 */
import {SEGMENTS, SEGMENT_SHORT, DEFAULT_COHORT, hasPoint, bannersOf, formatLabel} from './model.js?v=20261023-camera-r2';
import {brandLogoMarkup, getBrandLogo} from './brand-logos.js?v=20261023-camera-r2';
import {venueLogoMarkup, getVenueLogo} from './venue-logos.js?v=20261023-camera-r2';

const NUMBER = new Intl.NumberFormat('th-TH', {maximumFractionDigits: 0});
export const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
export const num = n => NUMBER.format(n);
const safeURL = value => { try { const u = new URL(value); return u.protocol === 'https:' ? u.href : ''; } catch { return ''; } };
const SEGMENT_ORDER = Object.keys(SEGMENTS);
const segIndex = id => Math.max(0, SEGMENT_ORDER.indexOf(id) + 1);
/** Production taxonomy of the host (CityMETER supMallType / Grocery store type), in Thai for the panel. */
const HOST_TYPES = Object.freeze({'Super-Regional Mall': 'ศูนย์การค้าขนาดใหญ่พิเศษ', 'Regional Mall': 'ศูนย์การค้าขนาดใหญ่', 'Neighborhood Center': 'ศูนย์การค้าชุมชน',
  'Community Mall': 'คอมมูนิตี้มอลล์', 'Market': 'ตลาด', 'Airport Retail': 'ร้านค้าในสนามบิน', 'Factory Outlet': 'เอาต์เล็ต', 'Hypermarket': 'ไฮเปอร์มาร์เก็ต'});
export const hostTypeLabel = type => HOST_TYPES[type] || type || '';
/** Banner line for an outlet: the primary banner, then any linked banner (co-branded storefront). */
const bannerLine = r => bannersOf(r).join(' · ');

export function link(url, label, cls = 'source-link') {
  const u = safeURL(url);
  return u ? `<a class="${cls}" href="${esc(u)}" target="_blank" rel="noopener">${esc(label)}</a>` : '';
}

function thaiDate(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || '')) return iso || '';
  const [y, m, d] = iso.split('-').map(Number);
  const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  return `${d} ${months[m - 1]} ${y + 543}`;
}

export function statusPill(status) {
  if (!status) return '';
  return `<span class="status-pill tone-${esc(status.tone)}" title="${esc(status.detail)}">${esc(status.label)}</span>`;
}

/**
 * Metric tile with a pictogram (brand = camera, store = storefront, venue = shopping
 * bag, area = map, province = city, exclusive = star, gla = ruler). The pictogram
 * is decorative; the one-word label carries the meaning. Pictograms are a test
 * exception to LDS nav-7 approved by the owner 2026-10-22 (js/navigation.js PICTOGRAM_CONTRACT).
 */
export function metricTile(value, label, kind = '') {
  return `<div class="metric${kind ? ` metric-${kind}` : ''}"><i class="metric-symbol pictogram pic-${esc(kind || 'plain')}" aria-hidden="true"></i><strong class="data-number">${num(value)}</strong><span>${esc(label)}</span></div>`;
}
/** Section heading with a pictogram. */
export const heading = (kind, text, id = '') => `<h3${id ? ` id="${esc(id)}"` : ''}><i class="pictogram pic-${esc(kind)}" aria-hidden="true"></i>${esc(text)}</h3>`;

function segmentBars(segmentMix, totalBrands) {
  if (!segmentMix.length) return '';
  const max = Math.max(1, ...segmentMix.map(s => s.brands));
  return `<ul class="mix-list" aria-label="ประเภทร้าน (ร้าน / สาขา)">${segmentMix.map(s => `
    <li><span class="mix-label"><i class="category-swatch category-${s.index}" aria-hidden="true"></i>${esc(s.name)}</span>
      <span class="mix-track" aria-hidden="true"><span class="mix-fill category-${s.index}" style="width:${Math.max(3, Math.round((s.brands / max) * 100))}%"></span></span>
      <span class="mix-value data-number" aria-label="${num(s.brands)} ร้าน ${num(s.pos)} สาขา" title="${num(s.brands)} ร้าน · ${num(s.pos)} สาขา">${num(s.brands)}<small>/${num(s.pos)}</small></span></li>`).join('')}</ul>`;
}

/* ---------- Overview ---------- */

/**
 * focusMode: 'auto' (default — the top areas carry the detail, the rest is quiet),
 * 'explicit' (user-chosen areas) or 'none' (every area in detail).
 */
export function renderOverview({insight, overview, summary, focusMode = 'auto', focused, areaModel, asOf, venues = [], view3d = true, provinces = []}) {
  const count = insight.areas.length;
  const share = insight.totalBrands ? Math.round(insight.share) : 0;
  const names = insight.areas.map(a => a.name);
  const nameList = names.length > 1 ? `${names.slice(0, -1).join(' · ')} และ${names.at(-1)}` : names[0] || '';
  const mode = focused === true ? 'explicit' : focusMode;
  let aha;
  if (!count && !summary.pos) {
    aha = `<section class="aha" aria-label="ข้อค้นพบ"><p class="eyebrow">ข้อค้นพบแรก</p><h2>ไม่พบสาขาตามตัวกรองนี้</h2>
      <div class="aha-actions"><button type="button" data-action="clear-filter" data-id="all" class="btn">ล้างตัวกรอง</button></div></section>`;
  } else if (!count && venues.some(v => v.mallId)) {
    // No Locale holds a row (a province outside Bangkok, or a filter): the finding moves to the venue level —
    // the share of the selection's shop banners present at its leading venue on the map (a venue without a
    // host point stays in the venue list but cannot carry the map finding).
    const [lead, ...next] = venues.filter(v => v.mallId);
    const venueShare = summary.brands ? Math.round((lead.brands / summary.brands) * 100) : 0;
    aha = `<section class="aha" aria-label="ข้อค้นพบ"><p class="eyebrow">ข้อค้นพบแรก</p>
      <h2><span class="aha-number data-number">${num(venueShare)}%</span><span class="aha-headline">ของร้านกล้องมีสาขาที่ ${esc(lead.name)}</span></h2>
      <p class="aha-copy"><strong class="data-number">${num(lead.brands)}</strong> จาก ${num(summary.brands)} ร้าน · <strong class="data-number">${num(lead.pos)}</strong> จาก ${num(summary.pos)} สาขา${next.length ? `<br>ถัดมา: ${next.slice(0, 2).map(c => `${esc(c.name)} <span class="data-number">${num(c.brands)}</span>`).join(' · ')}` : ''}</p>
      <div class="aha-actions"><button type="button" data-action="select-venue" data-id="${esc(lead.mallId)}" data-value="${esc(lead.venue)}" class="btn">ดูสถานที่นี้</button><button type="button" data-action="open-table" class="btn quiet">ดูสาขา</button></div></section>`;
  } else if (!count) {
    aha = `<section class="aha" aria-label="ข้อค้นพบ"><p class="eyebrow">ข้อค้นพบแรก</p><h2>${num(summary.pos)} สาขา · ${num(summary.brands)} ร้าน</h2>
      <div class="aha-actions"><button type="button" data-action="open-table" class="btn">ดูสาขา</button><button type="button" data-action="clear-filter" data-id="all" class="btn quiet">ล้างตัวกรอง</button></div></section>`;
  } else if (mode === 'explicit') {
    aha = `<section class="aha is-focused" aria-label="ข้อค้นพบ"><p class="eyebrow">กำลังสำรวจ ${num(count)} ย่าน</p>
      <h2>${esc(nameList)}</h2>
      <p class="aha-copy"><strong class="data-number">${num(insight.brands)}</strong> ร้าน · <strong class="data-number">${num(insight.pos)}</strong> สาขา</p>
      <div class="aha-actions"><button type="button" data-action="clear-focus" class="btn">ดูทุกย่าน</button><button type="button" data-action="open-charts" class="btn quiet">เปรียบเทียบย่าน</button></div></section>`;
  } else {
    const toggle = mode === 'auto'
      ? `<button type="button" data-action="clear-focus" class="btn">ดูทุกย่าน</button>`
      : `<button type="button" data-action="explore-top" class="btn primary">โฟกัส ${num(count)} ย่านนี้</button>`;
    aha = `<section class="aha${mode === 'auto' ? ' is-auto' : ''}" aria-label="ข้อค้นพบ"><p class="eyebrow">ข้อค้นพบแรก</p>
      <h2><span class="aha-number data-number">${num(share)}%</span><span class="aha-headline">ของร้านกล้องมีสาขาใน ${num(count)} ย่านนี้</span></h2>
      <p class="aha-copy">${names.map(n => `<button type="button" class="link-button" data-action="select-area" data-id="${esc(insight.areas[names.indexOf(n)].id)}">${esc(n)}</button>`).join(' · ')}<br><strong class="data-number">${num(insight.brands)}</strong> จาก ${num(insight.totalBrands)} ร้าน · <strong class="data-number">${num(insight.pos)}</strong> จาก ${num(insight.totalPos)} สาขา</p>
      ${overview.mostExclusive ? `<p class="aha-secondary">ร้านที่พบเฉพาะย่านมากที่สุด: <button type="button" class="link-button" data-action="select-area" data-id="${esc(overview.mostExclusive.id)}">${esc(overview.mostExclusive.name)}</button> <span class="data-number">${num(overview.mostExclusive.exclusiveBrands)}</span>/${num(overview.mostExclusive.brands)}</p>` : ''}
      <div class="aha-actions">${toggle}<button type="button" data-action="open-charts" class="btn quiet">เปรียบเทียบย่าน</button></div></section>`;
  }
  const ranking = overview.ranking.slice(0, 10);
  const max = Math.max(1, ...ranking.map(a => a.brands));
  const rankList = ranking.length ? `<section class="panel-section" aria-labelledby="rank-title">
    <div class="section-heading">${heading('area', 'ย่านเรียงตามจำนวนร้าน', 'rank-title')}<span class="hint">${num(overview.areaCount)} ย่าน</span></div>
    <ol class="rank-list">${ranking.map((a, i) => {
      const cls = areaModel?.areas.find(x => x.id === a.id);
      return `<li><button type="button" class="rank-row" data-action="select-area" data-id="${esc(a.id)}" aria-label="อันดับ ${i + 1} ${esc(a.name)} ${num(a.brands)} ร้าน ${num(a.pos)} สาขา">
        <span class="rank-index data-number" aria-hidden="true">${i + 1}</span>
        <span class="rank-name">${esc(a.name)}<small>${num(a.pos)} สาขา${a.exclusiveBrands ? ` · เฉพาะย่าน ${num(a.exclusiveBrands)}` : ''}</small></span>
        <span class="rank-track" aria-hidden="true"><span class="rank-fill" style="width:${Math.max(3, Math.round((a.brands / max) * 100))}%;background:${cls?.fill || 'var(--scale-count-3)'}"></span></span>
        <span class="rank-value data-number" aria-hidden="true">${num(a.brands)}</span></button></li>`;
    }).join('')}</ol>
    ${overview.outsidePos ? `<p class="hint">อีก ${num(overview.outsidePos)} สาขาอยู่นอกย่านหรือยังไม่มีพิกัด</p>` : ''}
  </section>` : (venues.length ? `<section class="panel-section" aria-labelledby="venue-rank-title">
    <div class="section-heading">${heading('venue', 'สถานที่เรียงตามจำนวนร้าน', 'venue-rank-title')}<span class="hint">${num(venues.length)} แห่ง</span></div>
    <ul class="venue-list">${venues.slice(0, 10).map(c => `<li><button type="button" class="venue-row${getVenueLogo({mallId: c.mallId, venue: c.venue}) ? ' has-logo' : ''}" data-action="select-venue" data-id="${esc(c.mallId)}" data-value="${esc(c.venue)}" aria-label="${esc(c.name)} ${num(c.brands)} ร้าน ${num(c.pos)} สาขา">${venueLogoMarkup({mallId: c.mallId, venue: c.venue}, {size: 'sm'})}<span class="venue-name">${esc(c.name)}<small>${esc(c.province || hostTypeLabel(c.type) || 'ทำเล')}</small></span><span class="venue-count data-number">${num(c.brands)}<small>ร้าน</small></span></button></li>`).join('')}</ul>
  </section>` : '');
  // Country level: the provinces that hold camera shops, each a drill-down (the map shows them as frames).
  // 60+ provinces: the first ten are listed, the rest fold behind a native disclosure (no script).
  const provinceRow = p => `<li><button type="button" class="province-row" data-action="select-province" data-id="${esc(p.code)}" aria-label="${esc(p.name)} ${num(p.brands)} ร้าน ${num(p.pos)} สาขา กดเพื่อดูจังหวัด"><i class="province-swatch" style="background:${esc(p.fill)}" aria-hidden="true"></i><span class="province-name">${esc(p.name)}</span><span class="province-count data-number">${num(p.brands)}<small>ร้าน · ${num(p.pos)} สาขา</small></span></button></li>`;
  const provinceList = provinces.length > 1 ? `<section class="panel-section" aria-labelledby="province-title">
    <div class="section-heading">${heading('province', 'จังหวัดที่มีร้านกล้อง', 'province-title')}<span class="hint">${num(provinces.length)} จังหวัด</span></div>
    <ul class="province-list">${provinces.slice(0, 10).map(provinceRow).join('')}</ul>
    ${provinces.length > 10 ? `<details class="province-more"><summary>อีก ${num(provinces.length - 10)} จังหวัด</summary><ul class="province-list">${provinces.slice(10).map(provinceRow).join('')}</ul></details>` : ''}
  </section>` : '';
  const narrowed = mode !== 'none' && count > 0 && summary.pos !== insight.totalPos;
  const metrics = `<section class="metrics" aria-label="${narrowed ? 'ตัวเลขของย่านที่โฟกัส' : 'ตัวเลขรวมของข้อมูลที่เลือก'}">
    ${metricTile(summary.brands, `ร้าน${narrowed ? ' ในโฟกัส' : ''}`, 'brand')}
    ${metricTile(summary.pos, `สาขา${narrowed ? ' ในโฟกัส' : ''}`, 'store')}
    ${metricTile(summary.venues ?? summary.centers.length, 'สถานที่', 'venue')}
    ${overview.areaCount ? metricTile(overview.areaCount, 'ย่าน', 'area') : ''}
  </section>`;
  return `${aha}${metrics}${provinceList}${rankList}<p class="hint panel-foot">Camera Shops Thailand · ข้อมูล ${esc(thaiDate(asOf))}</p>`;
}

/* ---------- Neighborhood profile ---------- */

export function renderNeighborhood(profile) {
  if (!profile) return '';
  const p = profile;
  const statusText = p.status === 'production_locale' ? 'Locale ของ CityMETER' : p.status === 'desk-reviewed' ? 'ตรวจบนโต๊ะแล้ว' : p.status === 'candidate' ? 'ขอบเขตรอทบทวน' : p.status;
  const venues = p.venues.length ? `<section class="panel-section"><div class="section-heading">${heading('venue', 'สถานที่ในย่าน')}<span class="hint">${num(p.venues.length)} แห่ง</span></div>
    <ul class="venue-list">${p.venues.slice(0, 12).map(v => `<li><button type="button" class="venue-row${getVenueLogo({mallId: v.mallId, venue: v.venue || v.name}) ? ' has-logo' : ''}" data-action="select-venue" data-id="${esc(v.mallId)}" data-value="${esc(v.venue || v.name)}" aria-label="${esc(v.name)} ${num(v.brands)} ร้าน ${num(v.pos)} สาขา">
      ${venueLogoMarkup({mallId: v.mallId, venue: v.venue || v.name}, {size: 'sm'})}<span class="venue-name">${esc(v.name)}<small>${esc(hostTypeLabel(v.type) || (v.mallId ? 'ศูนย์การค้า' : 'ทำเล / อาคาร'))}</small></span>
      <span class="venue-count data-number">${num(v.brands)}<small>ร้าน</small></span></button></li>`).join('')}</ul>
    ${p.venues.length > 12 ? `<p class="hint">+ อีก ${num(p.venues.length - 12)} แห่งในตาราง</p>` : ''}</section>` : '';
  const chips = (list, kind) => list.map(b => {
    const brand = typeof b === 'string' ? b : b.brand;
    const logo = getBrandLogo(brand);
    const title = typeof b === 'string' ? `${brand} — พบเฉพาะย่านนี้` : `${brand} — พบที่ ${b.elsewhere.join(', ')} ด้วย`;
    return `<li><button type="button" class="brand-chip chip-${kind}" data-action="search-brand" data-value="${esc(brand)}" title="${esc(title)}">${logo ? brandLogoMarkup(brand, {className: 'chip-logo'}) : ''}<span>${esc(brand)}</span></button></li>`;
  }).join('');
  const brands = `<section class="panel-section"><div class="section-heading">${heading('exclusive', 'ร้านที่พบเฉพาะย่านนี้')}<span class="hint">${num(p.exclusive.length)} จาก ${num(p.brands)}</span></div>
    ${p.exclusive.length ? `<ul class="chip-list">${chips(p.exclusive, 'exclusive')}</ul>` : '<p class="hint">ไม่มี — ทุกร้านพบในย่านอื่นด้วย</p>'}
    <div class="section-heading"><h3>พบในย่านอื่นด้วย</h3><span class="hint">${num(p.shared.length)}</span></div>
    ${p.shared.length ? `<ul class="chip-list">${chips(p.shared, 'shared')}</ul>` : '<p class="hint">ไม่มี</p>'}</section>`;
  return `<section class="detail-head">
      <button type="button" class="btn quiet back" data-action="back">กลับ</button>
      <p class="eyebrow">ย่าน${p.rank ? ` · อันดับ ${num(p.rank)} จาก ${num(p.areaCount)}` : ''}</p>
      <h2>${esc(p.name)}</h2>${p.nameEn ? `<p class="subtle">${esc(p.nameEn)}</p>` : ''}
      <div class="metrics compact">${metricTile(p.brands, 'ร้าน', 'brand')}${metricTile(p.pos, 'สาขา', 'store')}${metricTile(p.venues.length, 'สถานที่', 'venue')}${metricTile(p.exclusive.length, 'เฉพาะย่าน', 'exclusive')}</div>
      ${p.closed ? `<p class="hint">รวมปิดถาวร ${num(p.closed)} สาขา</p>` : ''}
      <div class="detail-actions"><button type="button" class="btn" data-action="open-table">ดูสาขา</button><button type="button" class="btn quiet" data-action="open-charts">เปรียบเทียบย่าน</button></div>
    </section>
    <section class="panel-section"><div class="section-heading">${heading('segment', 'ประเภทร้าน')}<span class="hint">ร้าน / สาขา</span></div>${segmentBars(p.segmentMix, p.brands)}</section>
    ${venues}${brands}
    <section class="panel-section boundary"><div class="section-heading"><h3>ขอบเขตย่าน</h3><span class="hint">${esc(statusText)}</span></div>
      ${p.productionUrl ? `<p class="links">${link(p.productionUrl, 'ย่านนี้ใน CityMETER')}</p>` : `<p class="subtle">${esc(p.definition)}</p>
      ${p.sourceURLs.length ? `<p class="links">${p.sourceURLs.slice(0, 4).map((u, i) => link(u, `อ้างอิง ${i + 1}`)).join(' ')}</p>` : ''}`}
    </section>`;
}

/* ---------- Venue ---------- */

export function renderVenue(v) {
  if (!v) return '';
  const rows = v.rows.map(r => `<li><button type="button" class="brand-row" data-action="select-store" data-id="${esc(r.id)}">${brandLogoMarkup(r.brand)}<span><strong>${esc(bannerLine(r))}</strong><br><span class="small muted">${esc(r.name || r.venue)}${r.unit ? ` · ${esc(r.unit)}` : ''}</span></span></button></li>`).join('');
  const logo = getVenueLogo({mallId: v.mallId, venue: v.name});
  return `<section class="detail-head venue${logo ? ' has-venue-logo' : ''}">
      <button type="button" class="btn quiet back" data-action="back">กลับ</button>
      ${logo ? venueLogoMarkup({mallId: v.mallId, venue: v.name}, {size: 'lg', className: 'detail-venue-logo', decorative: false}) : ''}
      <p class="eyebrow">${esc(hostTypeLabel(v.type) || 'สถานที่')}${v.area ? ` · <button type="button" class="link-button" data-action="select-area" data-id="${esc(v.area.id)}">${esc(v.area.name)}</button>` : ''}${logo?.roleLabel ? ` · <span class="venue-logo-role">${esc(logo.roleLabel)}</span>` : ''}</p>
      <h2>${esc(v.name)}</h2>${v.nameTh ? `<p class="subtle">${esc(v.nameTh)} · ${esc(v.province)}</p>` : `<p class="subtle">${v.venue && v.venue !== v.name ? `${esc(v.venue)} · ` : ''}${esc(v.province)}</p>`}
      <div class="metrics compact">${metricTile(v.brands, 'ร้าน', 'brand')}${metricTile(v.pos, 'สาขา', 'store')}${v.gla ? metricTile(v.gla, 'GLA ตร.ม.', 'gla') : ''}</div>
      ${v.source ? `<p class="links">${link(v.source, 'ศูนย์การค้านี้ใน CityMETER')}</p>` : ''}
    </section>
    <section class="panel-section"><div class="section-heading">${heading('segment', 'ประเภทร้าน')}<span class="hint">ร้าน / สาขา</span></div>${segmentBars(v.segmentMix, v.brands)}</section>
    <section class="panel-section"><div class="section-heading">${heading('store', 'สาขา')}<span class="hint">${num(v.rows.length)}</span></div><ul class="outlet-list">${rows}</ul></section>`;
}

/* ---------- Store ---------- */

export function renderStore(d) {
  if (!d) return '';
  const r = d.row;
  const logo = getBrandLogo(r.brand);
  const others = d.presence.stores.filter(s => s.id !== r.id);
  const coords = hasPoint(r) ? `${r.latitude.toFixed(6)}, ${r.longitude.toFixed(6)}` : 'ยังไม่มีพิกัด';
  const linked = bannersOf(r).slice(1);
  const venueFact = r.venue
    ? `${venueLogoMarkup({mallId: r.mallId, venue: r.venue}, {size: 'md'})}<span>${d.center || r.mallId ? `<button type="button" class="link-button" data-action="select-venue" data-id="${esc(r.mallId)}" data-value="${esc(r.venue)}">${esc(r.venue)}</button>` : esc(r.venue)} · ${esc(r.province)}</span>`
    : `<span>${esc(d.channel || 'ร้านริมถนน / อาคาร')} · ${esc(r.province)}</span>`;
  return `<section class="detail-head store">
      <button type="button" class="btn quiet back" data-action="back">กลับ</button>
      ${logo ? brandLogoMarkup(r.brand, {className: 'detail-logo', decorative: false}) : ''}
      <p class="eyebrow">${esc(d.segment)}</p>
      <h2>${esc(r.brand)}</h2>
      <p class="subtle">${esc(r.name || r.venue)}</p>
      ${linked.length ? `<p class="subtle">ร่วมกับ ${linked.map(b => `<button type="button" class="link-button" data-action="search-brand" data-value="${esc(b)}">${esc(b)}</button>`).join(' · ')}</p>` : ''}
      <p class="store-status">${statusPill(d.status)}</p>
      <dl class="facts">
        <dt>สถานที่</dt><dd class="fact-venue">${venueFact}</dd>
        <dt>ย่าน</dt><dd>${d.area ? `<button type="button" class="link-button" data-action="select-area" data-id="${esc(d.area.id)}">${esc(d.area.name)}</button>` : (hasPoint(r) ? 'นอกย่าน' : '—')}</dd>
        <dt>รูปแบบ</dt><dd>${esc(d.channel)}${formatLabel(r) && formatLabel(r) !== d.channel ? `<br><span class="hint">${esc(formatLabel(r))}</span>` : ''}</dd>
        ${r.address || r.unit ? `<dt>ที่อยู่</dt><dd>${esc(r.address || r.unit)}</dd>` : ''}
        <dt>พิกัด</dt><dd><span class="data-number">${esc(coords)}</span><br><span class="hint" title="${esc(d.geometry.note)}">${esc(d.geometry.label)}${d.coLocated ? ` · ร่วมพิกัดกับอีก ${num(d.coLocated)} สาขา` : ''}</span></dd>
        <dt>ตรวจเมื่อ</dt><dd>${esc(thaiDate(r.checkedOn)) || '—'}</dd>
      </dl>
      <p class="links">${link(r.source, 'หลักฐาน')} ${r.statusSource && r.statusSource !== r.source ? link(r.statusSource, 'สถานะ') : ''} ${link(r.coordinateSource, 'พิกัด')} ${link(r.mapUrl, 'แผนที่ของร้าน')} ${logo ? link(logo.sourceURL, 'โลโก้') : ''}</p>
    </section>
    <section class="panel-section"><div class="section-heading">${heading('store', `สาขาอื่นของ ${r.brand}`)}<span class="hint">${num(Math.max(0, d.presence.pos - 1))} สาขา · ${num(d.presence.venues)} สถานที่</span></div>
      ${d.presence.areas.length ? `<p class="subtle">${d.presence.areas.map(a => esc(a)).join(' · ')}</p>` : ''}
      ${others.length ? `<ul class="outlet-list">${others.slice(0, 10).map(s => `<li><button type="button" class="brand-row" data-action="select-store" data-id="${esc(s.id)}"><span><strong>${esc(s.venue || s.name)}</strong><br><span class="small muted">${s.venue ? `${esc(s.name || '')} · ` : ''}${esc(s.province)}</span></span></button></li>`).join('')}</ul>${others.length > 10 ? `<p class="hint">+ อีก ${num(others.length - 10)} สาขาในตาราง</p>` : ''}` : '<p class="hint">ไม่มี</p>'}
      <div class="detail-actions"><button type="button" class="btn quiet" data-action="search-brand" data-value="${esc(r.brand)}">ดูเฉพาะร้านนี้</button></div>
    </section>`;
}

/* ---------- Active filter chips ---------- */

export function renderFilterChips(values, labels) {
  const chips = [];
  const push = (key, text) => chips.push(`<li><button type="button" class="filter-chip" data-action="clear-filter" data-id="${esc(key)}" aria-label="ล้างตัวกรอง ${esc(text)}"><span>${esc(text)}</span><i aria-hidden="true">×</i></button></li>`);
  if (values.search) push('search', `ค้นหา “${values.search}”`);
  if (values.cohort && values.cohort !== DEFAULT_COHORT) push('cohort', labels.cohort[values.cohort] || values.cohort);
  if (values.segment) push('segment', SEGMENTS[values.segment] || values.segment);
  if (values.province) push('province', values.province);
  if (values.channel) push('channel', labels.channel[values.channel] || values.channel);
  if (values.venue) push('venue', values.venue);
  if (values.neighborhood) push('neighborhood', labels.neighborhood[values.neighborhood] || values.neighborhood);
  return chips.length ? `<ul class="filter-chips" aria-label="ตัวกรองที่ใช้อยู่">${chips.join('')}<li><button type="button" class="filter-chip clear-all" data-action="clear-filter" data-id="all">ล้างทั้งหมด</button></li></ul>` : '';
}

export {SEGMENT_SHORT, segIndex};

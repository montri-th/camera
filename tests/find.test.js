/**
 * The search box of CityMETER · Camera Shops (0.8.0; owner 2026-11-12 12:05, VERBATIM: “ศึกษาแนวคิดเรื่อง Fuzzy search
 * แล้ว implement กับ demo web ให้ได้ user benefit สูงสุดตาม user intent ในขณะนั้น และตาม product statement”): the names
 * js/find.js gives js/shell/fuzzy.js, read from the shipped data, and what a name typed opens.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createIndex, key1, STEP} from '../js/shell/fuzzy.js';
import {SEARCH_KINDS, SEARCH_HEADS, SEARCH_HINT, searchEntries, searchNote, storeTitle, venueKey} from '../js/find.js';
import {filterRows} from '../js/model.js';

const read = file => JSON.parse(fs.readFileSync(new URL(`../data/${file}`, import.meta.url), 'utf8'));
let built = null;
function index() {
  if (!built) {
    const loaded = {data: read('camera.json'), neighborhoods: read('neighborhoods.geojson')};
    const idx = createIndex({kinds: SEARCH_KINDS, heads: SEARCH_HEADS});
    idx.addAll(searchEntries(loaded));
    built = {idx, ...loaded};
  }
  return built;
}
const top = (result, n = 5) => result.items.slice(0, n).map(i => `${i.entry.kind}:${i.entry.id}`);

test('every place, filter, brand, shopping centre and branch of the data can be found by name', () => {
  const {idx, data, neighborhoods} = index();
  const entries = [...searchEntries({data, neighborhoods})];
  const nameless = entries.filter(e => !key1(e.name || '') && !key1(e.nameEn || '')).length;
  assert.ok(idx.size > 400 && entries.length - idx.size <= nameless, `${idx.size} of ${entries.length} entries: only one whose name has no letter (${nameless}) is left out`);
  assert.deepEqual([...new Set(entries.map(e => e.kind))].sort(), SEARCH_KINDS.map(k => k.id).sort(), 'every kind the list names has entries');
  assert.equal(entries.filter(e => e.kind === 'store').length, data.rows.length, 'every branch, of every cohort');
  assert.equal(entries.filter(e => e.kind === 'venue').length, new Set(data.rows.map(venueKey).filter(Boolean)).size, 'every shopping centre a branch names');
  let missed = 0;
  const stores = entries.filter(e => e.kind === 'store').filter((_, i) => i % 5 === 0);
  for (const e of stores) if (!idx.search(e.name).items.slice(0, 40).some(i => i.entry.kind === 'store' && i.entry.id === e.id)) missed++;
  assert.equal(missed, 0, `${stores.length} branches typed as listed`);
});

test('a name typed opens what it names: a place before a branch, one exact place or filter chosen ahead', () => {
  const {idx} = index();
  let r = idx.search('จ.ภูเก็ต');
  assert.deepEqual([top(r, 1)[0], r.preselect?.kind, r.total], ['province:PKT', 'province', 1]);
  assert.equal(top(idx.search('phuket'), 1)[0], 'province:PKT');
  r = idx.search('โคราช');
  assert.deepEqual([top(r, 1)[0], r.items[0].matched], ['province:NMA', 'โคราช']);
  r = idx.search('ย่านสยาม');
  assert.deepEqual([r.items[0].entry.kind, r.items[0].entry.name, r.preselect?.kind, r.total], ['hood', 'สยาม', 'hood', 1]);
  r = idx.search('สยาม');
  assert.deepEqual([r.items[0].entry.kind, r.preselect?.kind], ['hood', 'hood'], 'the ย่าน is written so; the shopping centre and the branches that carry the word are the next rows');
  assert.ok(r.items.slice(1, 4).some(i => i.entry.kind === 'venue'));
  // A brand, also by the other names the research sheet keeps for it.
  r = idx.search('big camera');
  assert.deepEqual([r.items[0].entry.kind, r.items[0].entry.name, r.preselect?.kind], ['brand', 'BIG CAMERA', 'brand']);
  r = idx.search('เวิลด์คาเมร่า');
  assert.deepEqual([r.items[0].entry.name, r.items[0].matched], ['WORLD CAMERA', 'เวิลด์คาเมร่า']);
  // A brand type and a branch format are filters.
  r = idx.search('มือสอง');
  assert.deepEqual([r.items[0].entry.kind, r.items[0].entry.id], ['segment', 'used_film_specialist']);
  r = idx.search('ในศูนย์การค้า');
  assert.deepEqual([r.items[0].entry.kind, r.preselect?.id], ['channel', 'mall']);
  // A shopping centre by the name the branches carry or the names its register keeps; never chosen ahead.
  for (const typed of ['siam paragon', 'สยามพารากอน']) {
    r = idx.search(typed);
    assert.deepEqual([r.items[0].entry.kind, r.items[0].entry.name, r.preselect], ['venue', 'Siam Paragon', null], typed);
  }
  r = idx.search('zoomcamera สยามพารากอน');
  assert.deepEqual([r.items[0].entry.kind, r.items[0].entry.name, r.preselect], ['store', 'ZoomCamera สยามพารากอน', null]);
});

test('a branch is named as the page names it, and a brand opens as the page opens one', () => {
  assert.equal(storeTitle({brand: 'BIG CAMERA', name: 'BIG CAMERA ฟอร์จูนทาวน์'}), 'BIG CAMERA ฟอร์จูนทาวน์');
  assert.equal(storeTitle({brand: 'DigiLife Thailand', name: 'DigiLifeThailand ฟอร์จูน ชั้น 2'}), 'DigiLifeThailand ฟอร์จูน ชั้น 2');
  assert.equal(storeTitle({brand: 'Leica Store / Leica Boutique', name: 'Leica Store Gaysorn'}), 'Leica Store Gaysorn', 'a brand written “A / B” goes by either');
  assert.equal(storeTitle({brand: 'Sony Store', name: '', venue: 'Siam Paragon'}), 'Sony Store Siam Paragon');
  // A brand has no filter of its own: its name is the words of the text filter, and they keep its branches.
  const {idx, data} = index();
  for (const typed of ['big camera', 'sony', 'zoom camera']) {
    const brand = idx.search(typed).items.find(i => i.entry.kind === 'brand').entry;
    assert.ok(filterRows(data.rows, {search: brand.name}).length > 0, brand.name);
  }
});

test('a name typed another way is still found, and a guess is said to be one', () => {
  const {idx} = index();
  let r = idx.search('เชียงใหม');
  assert.deepEqual([top(r, 1)[0], r.items[0].show], ['province:CMI', 'spelling']);
  r = idx.search('จ.เชียงหใม่');
  assert.deepEqual([top(r, 1)[0], r.items[0].show, r.preselect], ['province:CMI', 'near', null]);
  r = idx.search("g=up'.s,j");
  assert.deepEqual([r.layout, top(r, 1)[0], r.items[0].show, r.preselect], ['เชียงใหม่', 'province:CMI', 'near', null]);
  r = idx.search('big camrea');
  assert.ok(r.guessed && r.items[0].show === 'near' && /^BIG CAMERA/.test(r.items[0].entry.name) && r.preselect === null, r.items[0]?.entry.name);
  assert.equal(idx.search('zzzzqqqq').total, 0);
});

test('the list says what an entry is and where, and the page opens every kind it lists', () => {
  const {idx, data, neighborhoods} = index();
  const of = (typed, kind) => idx.search(typed).items.find(i => i.entry.kind === kind).entry;
  assert.equal(searchNote(of('ภูเก็ต', 'province')), 'จังหวัด');
  assert.equal(searchNote(of('ย่านสยาม', 'hood')), 'ย่าน · กรุงเทพมหานคร');
  assert.equal(searchNote(of('มือสอง', 'segment')), 'ประเภทแบรนด์');
  assert.equal(searchNote(of('ในศูนย์การค้า', 'channel')), 'รูปแบบสาขา');
  assert.equal(searchNote(of('big camera', 'brand')), 'แบรนด์ · หลายแบรนด์');
  assert.equal(searchNote(of('siam paragon', 'venue')), 'ศูนย์การค้า · กรุงเทพมหานคร');
  assert.equal(searchNote(of('zoomcamera สยามพารากอน', 'store')), 'หลายแบรนด์ · Siam Paragon · กรุงเทพมหานคร');
  for (const e of searchEntries({data, neighborhoods})) {
    const line = searchNote(e);
    assert.ok(line && !/ไม่ใช่|อาจ|ยังไม่ได้/.test(line.split(' · ')[0]) && !/ ·  ·|^ · | · $/.test(line), `${e.kind} ${e.name}: ${line}`);
  }
  const app = fs.readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
  for (const k of SEARCH_KINDS) assert.ok(app.includes(`entry.kind === '${k.id}'`), `js/app.js opens a ${k.id}`);
  assert.ok(SEARCH_HINT.startsWith('ลอง'));
  assert.ok(app.includes("f === 'search' && !state.finder ? 180 : 0"), 'without the list the box filters as it is typed in');
});

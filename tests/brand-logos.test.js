import test, {beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {configureBrandLogos, getBrandLogo, brandLogoMarkup, logoCoverage, normalizeBrandLabel} from '../js/brand-logos.js';

const catalog = JSON.parse(fs.readFileSync(new URL('../data/brand-logos.json', import.meta.url)));
const rows = JSON.parse(fs.readFileSync(new URL('../data/camera.json', import.meta.url))).rows;
const fixture = (id, name, extra = {}) => ({id, name, spriteId: `logo-${id}`, sourceURL: 'https://example.com/brand',
  sourceSHA256: 'a'.repeat(64), mime: 'image/svg+xml', width: 320, height: 160, ...extra});
beforeEach(() => configureBrandLogos(catalog, rows));

test('Camera Shops ships an explicit empty store-logo registry: no row resolves a logo, rows are untouched', () => {
  const before = JSON.stringify(rows);
  assert.equal(catalog.meta.status, 'not_collected');
  assert.deepEqual(catalog.brands, []);
  const coverage = configureBrandLogos(catalog, rows);
  assert.equal(coverage.configured, true);
  assert.equal(coverage.catalogBrands, 0);
  assert.equal(coverage.matchedRows, 0);
  assert.equal(coverage.totalRows, rows.length);
  assert.deepEqual(coverage.invalidCatalog, []);
  assert.equal(coverage.complete, false, 'coverage stays honest: nothing is matched');
  for (const row of rows) { assert.equal(getBrandLogo(row.brand), null); assert.equal(brandLogoMarkup(row.brand), ''); }
  assert.ok(!fs.existsSync(new URL('../assets/brand-logos.svg', import.meta.url)), 'no Luxury sprite is carried over');
  assert.equal(JSON.stringify(rows), before);
});

test('normalization resolves without fuzzy or partial matches', () => {
  configureBrandLogos({brands: [fixture('big', 'BIG CAMERA'), fixture('cis', 'Canon Image Square')]});
  assert.equal(getBrandLogo('  big camera  ')?.id, 'big');
  assert.equal(getBrandLogo('BIG  CAMERA')?.id, 'big');
  assert.equal(getBrandLogo('BIG CAMERA CC Powermall'), null);
  assert.equal(getBrandLogo('Canon'), null);
  assert.notEqual(normalizeBrandLabel('Foo.Bar'), normalizeBrandLabel('FooBar'));
  assert.notEqual(normalizeBrandLabel('A & B'), normalizeBrandLabel('A and B'));
});

test('ambiguous normalized labels or alias collisions stay unresolved and are reported', () => {
  const result = configureBrandLogos({brands: [fixture('one', 'Name'), fixture('two', 'NAME')]}, [{brand: 'name'}]);
  assert.equal(getBrandLogo('name'), null);
  assert.deepEqual(result.ambiguousBrands, ['name']);
  assert.equal(result.complete, false);
  configureBrandLogos({brands: [fixture('punctuated', 'Foo.Bar'), fixture('plain', 'FooBar')]});
  assert.equal(getBrandLogo('foo.bar')?.id, 'punctuated');
  assert.equal(getBrandLogo('foobar')?.id, 'plain');
  const aliasCollision = configureBrandLogos({brands: [fixture('apc', 'A.P.C.'), fixture('other', 'APC')]}, ['APC']);
  assert.equal(getBrandLogo('APC'), null);
  assert.equal(aliasCollision.complete, false);
});

test('markup escapes labels/classes and uses only the fixed local sprite and catalog symbol IDs', () => {
  const approved = [fixture('big', 'BIG CAMERA'), fixture('sony', 'Sony Store')];
  configureBrandLogos({meta: {spriteRevision: 'abcdef012345'}, brands: approved});
  for (const brand of approved) {
    const markup = brandLogoMarkup(brand.name);
    const hrefs = [...markup.matchAll(/\bhref="([^"]+)"/g)].map(match => match[1]);
    assert.deepEqual(hrefs, [`assets/brand-logos.svg?v=abcdef012345#${brand.spriteId}`]);
    assert.ok(!markup.includes('https:') && !markup.includes('drive.google.com'));
    const bounds = markup.match(/viewBox="([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+)"/).slice(1).map(Number);
    assert.ok(bounds[0] >= 0 && bounds[1] >= 0 && bounds[0] + bounds[2] <= 320.001 && bounds[1] + bounds[3] <= 160.001);
    assert.match(markup, /<use width="320" height="160"/);
    assert.match(markup, /aria-hidden="true"/);
  }
  configureBrandLogos({brands: [fixture('escaped', 'A & <B> "C"', {altEn: 'A & <B> "C"'})]});
  const markup = brandLogoMarkup('A & <B> "C"', {decorative: false, className: 'tile" onload="alert(1)'});
  assert.match(markup, /role="img"/);
  assert.match(markup, /<title>A &amp; &lt;B&gt; &quot;C&quot;<\/title>/);
  assert.ok(markup.includes('tile&quot; onload=&quot;alert(1)'));
  assert.ok(!markup.includes(' onload="'));
});

test('unconfigured or missing identities have an empty fallback and explicit coverage gaps', () => {
  configureBrandLogos(null);
  assert.equal(brandLogoMarkup('BIG CAMERA'), '');
  assert.equal(getBrandLogo('BIG CAMERA'), null);
  assert.equal(logoCoverage(['BIG CAMERA']).configured, false);
  assert.deepEqual(logoCoverage(['BIG CAMERA']).missingBrands, ['BIG CAMERA']);
  configureBrandLogos(catalog);
  assert.equal(brandLogoMarkup('Unapproved Brand'), '');
  assert.equal(logoCoverage(['Unapproved Brand']).complete, false);
});

test('sprite cache revisions accept only 12 or 64 hexadecimal characters and expose a validated short revision', () => {
  const logo = fixture('cache', 'Cache');
  for (const revision of ['ABCDEF012345', 'ABCDEF012345' + 'a'.repeat(52)]) {
    const coverage = configureBrandLogos({meta: {spriteRevision: revision}, brands: [logo]}, ['Cache']);
    assert.equal(coverage.spriteRevision, 'abcdef012345');
    assert.equal(coverage.complete, true);
    assert.match(brandLogoMarkup('Cache'), /href="assets\/brand-logos\.svg\?v=abcdef012345#logo-cache"/);
  }
  for (const revision of ['abcdef', 'a'.repeat(13), 'a'.repeat(63), 'a'.repeat(65),
    'abcdef012345#evil', 'abcdef012345&remote=https://evil.example', '" onload="x', 123456789012]) {
    const coverage = configureBrandLogos({meta: {spriteRevision: revision}, brands: [logo]}, ['Cache']);
    assert.equal(coverage.spriteRevision, null);
    assert.equal(coverage.complete, false);
    assert.deepEqual(coverage.invalidCatalog, [{reason: 'invalid_sprite_revision'}]);
    assert.match(brandLogoMarkup('Cache'), /href="assets\/brand-logos\.svg#logo-cache"/);
    assert.ok(!brandLogoMarkup('Cache').includes('?v='));
    assert.ok(!brandLogoMarkup('Cache').includes('evil.example'));
  }
  configureBrandLogos({brands: [logo]});
  assert.equal(logoCoverage(['Cache']).spriteRevision, null);
});

test('private, executable, external-sprite, and malformed catalog references cannot enter the registry', () => {
  const bad = [
    fixture('drive', 'Private Drive', {sourceURL: 'https://drive.google.com/file/d/private/view'}),
    fixture('exec', 'Executable', {sourceURL: 'javascript:alert(1)'}),
    fixture('external', 'External Sprite', {spriteId: 'https://evil.example/logo.svg#mark'}),
    fixture('local', 'Local', {sourceURL: 'https://127.0.0.1/private'}),
    fixture('hash', 'No Hash', {sourceSHA256: ''}),
  ];
  const coverage = configureBrandLogos({brands: bad}, bad.map(brand => brand.name));
  assert.equal(coverage.catalogBrands, 0);
  assert.equal(coverage.invalidCatalog.length, bad.length);
  assert.equal(coverage.complete, false);
  for (const brand of bad) assert.equal(brandLogoMarkup(brand.name), '');
  assert.equal(getBrandLogo('https://evil.example/logo.svg'), null);
});

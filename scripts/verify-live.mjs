#!/usr/bin/env node
/**
 * Live byte attestation: fetch every file listed in handoff/handoff-manifest.json
 * from the public site and compare SHA-256 with the manifest. Writes a JSON
 * report (default evidence/live-attestation.json) and exits non-zero on any
 * mismatch so a release cannot be reported as verified from local bytes.
 *
 *   node scripts/verify-live.mjs [--base https://montri-th.github.io/camera/] [--out file]
 *
 * Only audience-delivered files are compared (docs, data, assets, code);
 * tests, scripts and dotfiles are not published by GitHub Pages in a
 * meaningful way and are skipped by the `published` predicate below.
 */
import {createHash} from 'node:crypto';
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {join, resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (name, fallback) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : fallback; };
const base = opt('--base', 'https://montri-th.github.io/camera/');
const out = resolve(opt('--out', join(root, 'evidence/live-attestation.json')));
const manifest = JSON.parse(readFileSync(join(root, 'handoff/handoff-manifest.json'), 'utf8'));
const published = p => !p.startsWith('tests/') && !p.startsWith('scripts/') && !p.startsWith('.') && p !== 'package.json';
const sha256 = buffer => createHash('sha256').update(buffer).digest('hex');
const expectedMimes = p => {
  const ext = p.slice(p.lastIndexOf('.')).toLowerCase();
  return ({'.html':['text/html'],'.css':['text/css'],'.js':['application/javascript','text/javascript'],'.json':['application/json'],'.geojson':['application/geo+json','application/json'],'.svg':['image/svg+xml'],'.png':['image/png'],'.jpg':['image/jpeg'],'.jpeg':['image/jpeg'],'.webp':['image/webp'],'.woff2':['font/woff2'],'.md':['text/plain','text/markdown']})[ext] || [];
};
async function probe(path, wanted, rootDocument = false) {
  const requestedUrl = rootDocument ? base + `?attest=${Date.now()}` : new URL(path, base).href + `?attest=${Date.now()}`;
  const response = await fetch(requestedUrl, {cache:'no-store', signal:AbortSignal.timeout(20000)});
  const finalUrl = response.url;
  const mime = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  const allowed = expectedMimes(rootDocument ? 'index.html' : path);
  const transportOk = response.ok && finalUrl === requestedUrl && (!allowed.length || allowed.includes(mime));
  if (!transportOk) return {path, requestedUrl, finalUrl, status:response.status, mime, expectedMimes:allowed, ok:false, error:'Status, final URL or MIME mismatch; bytes not hashed'};
  const bytes = Buffer.from(await response.arrayBuffer());
  const hash = sha256(bytes);
  return {path, requestedUrl, finalUrl, status:response.status, mime, bytes:bytes.length, sha256:hash, expectedSha256:wanted.sha256, ok:bytes.length === wanted.bytes && hash === wanted.sha256};
}

const results = [];
for (const file of manifest.files.filter(f => published(f.path))) {
  try {
    results.push(await probe(file.path, file));
  } catch (error) {
    results.push({path: file.path, status: 0, bytes: 0, sha256: null, expectedSha256: file.sha256, ok: false, error: String(error.message || error)});
  }
}
// The root document must serve index.html bytes.
const index = manifest.files.find(f => f.path === 'index.html');
if (index) {
  results.push(await probe('/', index, true));
}
const report = {
  checkedAt: new Date().toISOString(), baseUrl: base,
  manifestCommit: manifest.sourceCommit, manifestGeneratedAt: manifest.generatedAt,
  passed: results.filter(r => r.ok).length, failed: results.filter(r => !r.ok).length, results,
};
mkdirSync(dirname(out), {recursive: true});
writeFileSync(out, JSON.stringify(report, null, 2) + '\n');
console.log(`live attestation: ${report.passed} ok, ${report.failed} failed → ${out}`);
for (const r of results.filter(r => !r.ok)) console.log(`  MISMATCH ${r.path} status=${r.status} ${r.error || ''}`);
process.exit(report.failed ? 1 : 0);

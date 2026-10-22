#!/usr/bin/env python3
"""Refresh assets/manifest.json (LDS asset registry of the public assets) from the bytes on disk.

  python3 scripts/build-asset-manifest.py

Keeps every listed entry whose file exists (path, scope), recomputes sha256 and bytes, drops entries whose file
is gone, and lists every file of assets/venue-logos/. Hashes are never hand-edited. The LDS release fields
(lds, release, baseDocumentSha256) are kept as they are.
"""
import hashlib, json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / 'assets' / 'manifest.json'
VENUE_SCOPE = 'Venue logo file (identity support; bytes as verified against the research sheet sha256; not a trademark licence)'

def main():
    m = json.loads(MANIFEST.read_text(encoding='utf-8'))
    entries, seen, dropped = [], set(), []
    for f in m['files']:
        if (ROOT / f['path']).is_file():
            entries.append(dict(f)); seen.add(f['path'])
        else:
            dropped.append(f['path'])
    for logo in sorted((ROOT / 'assets' / 'venue-logos').iterdir()):
        path = f'assets/venue-logos/{logo.name}'
        if logo.is_file() and path not in seen:
            entries.append({'path': path, 'scope': VENUE_SCOPE})
    out = []
    for e in entries:
        data = (ROOT / e['path']).read_bytes()
        row = {'path': e['path'], 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}
        if e.get('scope'):
            row['scope'] = e['scope']
        out.append(row)
    m['files'] = out
    MANIFEST.write_text(json.dumps(m, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'assets/manifest.json: {len(out)} files' + (f', dropped {dropped}' if dropped else ''))

if __name__ == '__main__':
    main()

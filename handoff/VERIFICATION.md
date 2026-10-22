# Verification record — Camera Shops release 0.5.0 (2026-10-22)

Dataset snapshot: 2026-10-22, research master revision 2026-10-22 13:13 UTC (20:13 Asia/Bangkok). Levels are reported separately: data build checks, unit tests, machine contracts, rendered harness, live checks and live byte attestation. None of them is a blanket LDS, accessibility or market-completeness certificate.

## Data rebase on the research master revision 13:13 UTC

The first 0.5.0 build (commit `cfb2ed4`) used a 12:36 UTC export of the research master, which had no venue join of its own, so the app matched hosts itself (208 rows with coordinates, 136 host-building features). At 13:13 UTC the master gained its own venue join (`12_SPATIAL_JOIN`, new columns in `02_STORES` / `07_VENUES`), a building join (`13_BUILDINGS` and its feature file) and holds on six venues. The release was rebuilt so that the app shows exactly the master's joins. Differences against `cfb2ed4`:

| Change | Outlets | Venues |
|---|---:|---:|
| Hypermarket hosts (CityMETER Grocery records) — the master marks them “มีชื่อ venue รอตรวจทะเบียน” | −19 | 19 |
| Robinson department stores matched by the app as the only Robinson record in the province — not joined by the master | −6 | 6 |
| Venues the master holds (Siam Square One 2, Central Phuket Floresta 2, Tops Phayao 1, Markfour Phrae 1) | −6 | 4 |
| Joined by the master, missed by the app crosswalk (Ayutthaya City Park, Jampha Shopping Mall Lamphun) | +2 | 2 |
| Host record changed (โลตัส สุราษฎร์ธานี: Grocery → Shopping Center 4c60b013) | 0 | 1 |

The app crosswalk is kept as a review: its 28 candidates (29 outlets) for venues the master has not joined are written to `host_link_proposals.csv` for the research team and never published.

## Data build — 0.5.0

| Check | Result |
|---|---|
| Master export | research master revision 2026-10-22 13:13:29 UTC exported as xlsx, one CSV per tab (dates rendered M/D/YYYY like the Sheets CSV export); against the 12:36 export the changes are the spatial join itself (tabs `12_SPATIAL_JOIN` and `13_BUILDINGS`, the new join columns, and the location fields of `02_STORES` / `07_VENUES` and `release_status` of `02_STORES` that the join fills), `04_SOURCE_REGISTER` +247 rows, `06_DATA_DICTIONARY` +62 rows (definitions of the new fields), `08_STATUS_AUDIT.map_host_reference_count` and `00_README` (spatial-join notes); `01_BRANDS`, `03_BRANCH_REVIEW`, `05_REVIEW_QUEUE`, `09_CLOSED_STORES`, `10_VENUE_LOGOS`, `11_STORE_BRANDS` and `99_APPROVED_SCOPE` are unchanged |
| Venue join verified | `scripts/host-links/03_verify_master_join.py`: 106 joined venues / 179 outlets; every `citymeter_shopping_center_id` read from production `shopping-center/detail`; the master's latitude/longitude equal the detail point for all 106 (exact); every point inside the production polygon of the research province; every outlet of a joined venue carries the same host and point; no held or unjoined outlet carries any; 31 Bangkok points get their Locale from `base/locatePoint` |
| Host links reproducible | steps `01…04` rerun on a copy of the 2026-10-22 production-response cache: `venues_resolved.json`, `host_link_proposals.{json,csv}`, `locales.geojson`, `grocery/candidates.json` identical; `npm run data:build` on them → every public data file byte-identical |
| Rows | 234 outlets (233 default); `venueJoin` joined 179 · awaiting_registry 32 · no_venue 15 · held 8; 179 rows with coordinates, all on their host point; `coordinateSource` = production detail URL |
| Locale membership | point-in-polygon on the 26 published Locales = production `base/locatePoint` for 31/31 Bangkok host points (`metadata.membershipCheck`; the build stops on any difference); the 26 polygons are byte-identical to the previous build; ตลาดคลองเตย dropped (it held only BigC พระราม 4) |
| Host buildings | the master's feature file, 103 features (69 footprints + 34 parts) for 69 hosts / 119 outlets; every feature equal to its `13_BUILDINGS` row (id, geometry sha256 of the compact JSON, heights, linked outlet count) and every linked outlet a joined outlet of the feature's host; display mapping → 95 extrusion, 8 outline (MBK CENTER and Terminal 21 Pattaya: outline parent, parts carry the heights); 37 hosts without an accepted building; attribution © OpenStreetMap contributors (ODbL 1.0) only |
| Province frames | 64 provinces with rows, OpenGISData commit `fafcea17…`, sha256 `310c3adf…`; rebuilt byte-identical; one ring collapsed by rounding (a hole in ร้อยเอ็ด) dropped |
| Venue logos | 30 files, every sha256 equal to the sheet's `logo_sha256` (23 identical to the Luxury Brands install set, 7 from the sheet's Drive files); 31 labels, 30 host links; no Drive URL in the registry; unchanged by the rebase |
| Privacy | no phone number in any public file (2 research notes scrubbed); no `drive.google.com` / `docs.google.com` / `googleusercontent.com` URL; the master's internal `raw_file` paths are not copied into the building layer |
| Pictogram font | `material-pictogram-300.woff2` rebuilt from the same source font (sha256 `32e40117…202e7`): 1,724 bytes, sha256 `259de66e…edcb4`, identical on two runs; each codepoint checked against its icon name (U+E412 = photo_camera); nav-7 subset unchanged (`d7e28310…`) |

## Automated (unit) — 0.5.0

`npm test` — **106/106 passed** (Node 22.22.0). Camera-specific coverage on top of the shared 0.5 suites (pins, massing, x-ray, mvt, geometry, venue logos):

- **scales** (owner rule 2026-10-22, colour scales always use the full 41-sample LDS scale): the exact 41-sample count LUT; a count maps linearly from 1 to the selection maximum (1 → sample 0, max → 40, up to 41 distinct values get distinct samples, beyond that every sample is used; max 1 → darkest); zero stays `measured_zero`, missing stays `no_data`; the legend ramp carries all 41 samples as equal hard stops with 1 · middle · max ticks; samples 27–29 reach < 4.5:1 with both foundation inks and are flagged for a surface chip

- **data contract** (new): every point comes from the master venue join (`venueJoin` joined, Shopping Center host, production detail URL, point = host point) and every row without a point has no host; the held venues equal `meta.heldVenues` (Siam Square One and Central Phuket Floresta have no point); host buildings have unique ids, two render modes, display heights for every extrusion, parts inside a footprint of the file, linked outlets that are joined outlets of the building's host, no internal paths; height label of a parts-owned parent
- **model**: cohorts `current` / `all` / `review`; ร้าน vs สาขา counting with a co-branded outlet; segment projection (copy, never a mutation, coordinates unchanged); search reads linked banners; host selection across venue labels; CSV joins banner lists; chip labels
- **area insight / first insight / chart model / profile model** on the real snapshot: top Locales รัชดา-ตะวันตก 13/17, ราชประสงค์ 8/10, สยาม 8/10 (tie broken by id), union 22 of 38 banners, 37 of 233 outlets, 82 assigned, 151 outside; co-branded outlets in segment cells; Fortune Town venue 13 ร้าน / 17 สาขา; hypermarket host venue (fixture: the Grocery kind stays supported); held store reads “พิกัดรอตรวจ”; street shops never form a venue
- **neighborhoods**: published ย่าน are production Locales (uuid ids, production URL, `membershipCheck` n/n, Central Ladprao → its production `localeId`)
- **provinces**: 64 frames with production codes and DOPA codes equal to `PROVINCES`; 77-province registry; province-level venue Aha (80% at Central Chiangmai fixture) without a “0 ย่าน” tile; the venue Aha names the leading venue with a host point (Phuket shape: held Floresta stays in the list) and falls back to the plain count without one; panel list folds after ten rows
- **brand logos**: the shipped registry is explicitly empty (`not_collected`), no Luxury sprite carried over; fixture-based safety tests unchanged
- **pins**: name chips content-sized, clear of every mark, near their anchor

Machine contracts: `product-statement.json`, `product-brief.json`, `implementation-plan.json` validate against `handoff.schema.json` **1.4.0** (ajv 8.17.1, draft 2020-12, 2026-10-22); the Luxury Brands 1.3.0 documents also still validate against 1.4.0.

## Rendered harness — 0.5.0

The container cannot reach unpkg.com or tiles.openfreemap.org. The harness serves the repository on 127.0.0.1:4173, fulfils the pinned MapLibre 5.6.2 JS/CSS from the npm package, answers the TileJSON URL with a stub whose tiles are **synthetic OpenMapTiles-schema tiles generated per request** (building with render_height, transportation, water, park) and aborts glyph requests. Data, layers, pins, labels, panel, charts, table, the generated style, the massing decoder, the camera and the x-ray are the real code paths; only the basemap geography is synthetic. Log: `evidence/harness.log`; screenshots `evidence/d-*`, `m-*`, `a11y-*`, `s-*`. Re-run in full after the data rebase.

| Viewport / theme | Flows checked | Result |
|---|---|---|
| 1280×800 light and dark | first paint = city preset z13.0 / pitch 56 / bearing 28 with auto focus of the three production Locales (37 rows of 233), crumb ประเทศไทย, Aha “58% ของร้านกล้องมีสาขาใน 3 ย่านนี้ · 22 จาก 38 ร้าน · 37 จาก 233 สาขา”, tiles 22 ร้าน / 37 สาขา / 5 สถานที่ / 26 ย่าน with the camera pictogram, legend “ย่าน · จำนวนร้าน” as the 41-sample ramp 1 · 7 · 13, focus massing 65 rounded buildings; all three focus areas above the legend; ดูทุกย่าน → country plan z4.7 (233 rows); charts ranking / mix (5 equal 144-px columns, cells on the 41-sample scale, ramp legend) / compare; ย่าน รัชดา-ตะวันตก → model preset z14.59, “อันดับ 1 จาก 26”, crumbs ประเทศไทย › กรุงเทพมหานคร › รัชดา-ตะวันตก, “ย่านนี้ใน CityMETER” → `/v3/citymeter/BKK/L/1d671f78…?d=shoppingCenter`, มุมสถาปนิก disabled; Fortune Town → eye preset at the host point z16 / pitch 75 / FOV 24 (the master has no accepted building there: no blue solid, the legend hides its building key), 4-level crumbs; zoom 17 → name chips (Pix-One, Snapshot Camera) beside the 17 co-located pins; store B2H / Best2Home (format ร้านในศูนย์การค้า, address, host-point precision, links หลักฐาน/พิกัด); co-branded BIG CAMERA CC Powermall พารากอน shows “ร่วมกับ Power Mall”; MBK CENTER → outline footprint + two master parts extruded (34.3 m, 23.1 m); Ayutthaya City Park (joined by the master) → its master footprint (OSM way 722877870, 11.44 m) blue; FUJIFILM House of Photography Bangkok at Siam Square One → no point, “พิกัดรอตรวจ”, ย่าน “—”, crumbs ประเทศไทย › กรุงเทพมหานคร › Siam Square One; country view legend “จังหวัด · จำนวนร้าน” as the 41-sample ramp 1 · 19 · 36, 64 frames, 17 chips after collision, panel 64 rows (54 folded); drill เชียงใหม่ → venue-level Aha (80% at Central Chiangmai); segment ช่องทางขายเสริม → 3 ร้าน / 7 สาขา; 2D plan; table 37 rows; help | pass — no page errors, no application errors, no horizontal overflow |
| 390×844 light and dark (DPR 2, touch) | first paint z12.73 with the three areas and the compact map Aha (58%); bottom sheet; neighborhood from the ranking (plan z12.5 while the sheet is open, model z13.6 after closing); charts mix in the tray; store DJI Experience Store - CentralWorld via URL (hold label ตัวตนหน้าร้านรอตรวจ, venue logo) | pass — no horizontal document overflow |
| keyboard | Tab from the theme control into the pin layer (one roving tab stop, no context pin focusable), ArrowRight, Enter → store mode (DJI Experience Store MBK Center) | pass |
| states | `?search=zzzz` (empty state + reset), `?cohort=review&areas=all` (17 rows: identity holds, the contact location and the 8 outlets of the venues the master holds), `?cohort=all` (234 rows, 56%), `?areas=all&view3d=0`, `?province=PKT` (67% at Central Phuket; the held Floresta stays in the venue list), `?province=TAK` (no venue on the map → plain count “2 สาขา · 1 ร้าน”), `?neighborhood=<สยาม>&view=mix` (อันดับ 3 จาก 26) | pass |

Fixed during the first pass: (1) a venue outside the automatic top three lost its detail (the venue rows were taken from the focused rows; now from `scopeRows`); (2) the spread-out focus (Ratchada ↔ Siam) put สยาม under the legend — the pitched fit now counts the legend on wide screens and keeps zoom ≥ 13 so the 3D massing shows; (3) Chiang Mai's first finding read “7 สาขาอยู่นอก 27 ย่านของกรุงเทพฯ” — now the venue-level share; (4) raw store-format codes in the store facts — now Thai labels; (5) segment labels truncated in the mix bars — shorter labels, wider column. Harness artefact (not an app issue): synthetic features without ids triggered a MapLibre `in`-expression warning; ids added.

Fixed during the rebase pass: (6) a row without a point showed ย่าน “นอกย่าน” in the store facts and the table — now “—”; (7) the venue-level finding could name a venue without a host point (Phuket: Central Phuket Floresta, held) — now the leading venue with a point, else the plain count; (8) the “อาคารของสถานที่” legend key showed when no host building was displayed — now hidden; (9) a parent footprint whose parts carry the heights read “ความสูง 0 ม.” — now its own label; (10) owner rule 2026-10-22 applied: the neighborhood choropleth, the province frames, the ranking bars and the matrix use the full 41-sample LDS count scale instead of five classes, legends show the 41-sample ramp, and matrix numbers on samples 27–29 sit on a surface chip (re-run of every scenario, 0 application errors).

Console: only Chromium software-WebGL notices and missing glyph/source-layer warnings of the stub tiles; no application errors.

## Live checks — 0.5.0

GitHub Pages was switched on at 2026-10-22 17:29 UTC (2026-10-23 00:29 Asia/Bangkok) in the owner's Chrome with the owner's go-ahead (Settings → Pages → Deploy from a branch → `main` / root); the Pages API is not reachable from the build container. Live URL: https://montri-th.github.io/camera/.

### Live byte attestation

| Commit | Pages run | Result |
|---|---|---|
| `fe58fda` (first deployment) | `pages build and deployment` 39823074930 — success | `npm run verify:live`: 116 of 116 published files equal the manifest (2026-10-22 17:30 UTC) |
| `a0b9c66` (41-sample colour scale, cache tag `20261023-c2`) | 39827085255 — success (`89030f3` was superseded and cancelled) | 116 of 116 (17:58 UTC) |

The attestation of the final commit (the one that adds this section) is recorded in `RELEASE_RECEIPT.json` and `evidence/live-attestation-<commit>.json` in the bundle; a file cannot carry the hash of its own commit.

### Browser on real tiles

Chrome 155 on macOS (the owner's browser through Claude in Chrome), viewport 1710×853 CSS px, DPR 2, system dark scheme; the theme control was set to Light for the light-theme checks and returned to Auto afterwards. The page loaded the real OpenFreeMap tiles and glyphs and the pinned MapLibre 5.6.2 from unpkg.

| Commit | Flow | Result |
|---|---|---|
| `a0b9c66` | first paint (dark and light): city preset z13 / pitch 56 / bearing 28, real massing decoded (7,939 features), auto focus รัชดา-ตะวันตก · ราชประสงค์ · สยาม, Aha “58% … 22 จาก 38 ร้าน · 37 จาก 233 สาขา”, legend “ย่าน · จำนวนร้าน” as the 41-sample ramp 1 · 7 · 13; `fetch(js/scales.js, {cache: 'reload'})` serves the 41-sample code and every entry file carries `?v=20261023-c2` | pass |
| `a0b9c66` | charts → บุคลิกของย่าน: 60 cells on the 41-sample scale, ramp 1 · 6 · 10, five equal 213-px columns | pass |
| `a0b9c66` | country view (light): z4.85, legend “จังหวัด · จำนวนร้าน” ramp 1 · 19 · 36, 21 province chips after collision at this viewport | pass |
| `a0b9c66` | MBK CENTER (light) and `fe58fda` (dark): eye preset z17.59 / pitch 75 / FOV 24, outline footprint + two blue master parts (34.3 m, 23.1 m) over the real massing, name chips FOTOFILE / BIG CAMERA, crumbs ประเทศไทย › กรุงเทพมหานคร › สยาม › MBK CENTER | pass |
| `fe58fda` | Fortune Town: eye preset at the host point z16 / pitch 75 / FOV 24, no host building, the legend's building key hidden, name chips Snapshot Camera / Pix-One | pass |
| `fe58fda` | FUJIFILM House of Photography Bangkok (Siam Square One, held): ย่าน “—”, พิกัด “ยังไม่มีพิกัด · พิกัดรอตรวจ”, crumbs ประเทศไทย › กรุงเทพมหานคร › Siam Square One | pass |

Not verified on the live site: a narrow screen (`resize_window` reported success but the viewport stayed 1710 px wide, so 390 px is covered by the harness only), the keyboard tour (harness only), Safari and Firefox, and the native `file:` entry.

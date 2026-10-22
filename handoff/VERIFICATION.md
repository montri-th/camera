# Verification record — Camera Shops release 0.5.0 (2026-10-22)

Dataset snapshot: 2026-10-22. Levels are reported separately: data build checks, unit tests, machine contracts, rendered harness, live checks and live byte attestation. None of them is a blanket LDS, accessibility or market-completeness certificate.

## Data build — 0.5.0

| Check | Result |
|---|---|
| Host links reproducible | `scripts/host-links/01…05` rerun on the 2026-10-22 production-response cache: `venues_resolved.json`, `locales.geojson`, `host_buildings_citymeter.json` and `grocery/candidates.json` identical to the release inputs; `npm run data:build` on them → every public data file byte-identical |
| Host crosswalk | 133 of 144 venues → 132 CityMETER host records (112 Shopping Center, 20 Grocery); every host point inside the production polygon of the research province; the 74 sheet coordinates agree with production (≤ 0.0005°); 11 venues unmatched and listed |
| Locale membership | point-in-polygon on the 27 published Locales = production `base/locatePoint` for 33/33 Bangkok host points (`metadata.membershipCheck`; the build stops on any difference); no host point in the three sub-metre overlap slivers left by simplification |
| Host buildings | 136 features, 105 hosts, 176 matched outlets; 60 Luxury Brands features for 29 shared centres, 68 CityMETER V4 footprints containing the host point, 8 OSM buildings named like the venue within 150 m; 27 hosts without an accepted footprint |
| Province frames | 64 provinces with rows, OpenGISData commit `fafcea17…`, sha256 `310c3adf…`; one ring collapsed by rounding (a hole in ร้อยเอ็ด) dropped |
| Venue logos | 30 files, every sha256 equal to the sheet's `logo_sha256` (23 identical to the Luxury Brands install set, 7 from the sheet's Drive files); 31 labels, 30 host links; no Drive URL in the registry |
| Privacy | no phone number in any public file (2 research notes scrubbed); no `drive.google.com` / `docs.google.com` / `googleusercontent.com` URL |
| Pictogram font | `material-pictogram-300.woff2` rebuilt from the same source font (sha256 `32e40117…202e7`): 1,724 bytes, sha256 `259de66e…edcb4`, identical on two runs; each codepoint checked against its icon name (U+E412 = photo_camera); nav-7 subset unchanged (`d7e28310…`) |

## Automated (unit) — 0.5.0

`npm test` — **102/102 passed** (Node 22.22.0). Camera-specific coverage on top of the shared 0.5 suites (pins, massing, x-ray, scales, mvt, geometry, venue logos):

- **model**: cohorts `current` / `all` / `review`; ร้าน vs สาขา counting with a co-branded outlet; segment projection (copy, never a mutation, coordinates unchanged); search reads linked banners; host selection across venue labels; CSV joins banner lists; chip labels
- **area insight / first insight / chart model / profile model** on the real snapshot: top Locales รัชดา-ตะวันตก 13/17, สยาม 9/12, ราชประสงค์ 8/10, union 23 of 38 banners, 39 of 233 outlets, 85 assigned; co-branded outlets in segment cells; Fortune Town venue 13 ร้าน / 17 สาขา; hypermarket host venue; hold-status labels; street shops never form a venue
- **neighborhoods**: published ย่าน are production Locales (uuid ids, production URL, `membershipCheck` n/n, Central Ladprao → its production `localeId`)
- **provinces**: 64 frames with production codes and DOPA codes equal to `PROVINCES`; 77-province registry; province-level venue Aha (80% at Central Chiangmai fixture) without a “0 ย่าน” tile; panel list folds after ten rows
- **brand logos**: the shipped registry is explicitly empty (`not_collected`), no Luxury sprite carried over; fixture-based safety tests unchanged
- **pins**: name chips content-sized, clear of every mark, near their anchor

Machine contracts: `product-statement.json`, `product-brief.json`, `implementation-plan.json` validate against `handoff.schema.json` **1.4.0** (ajv 8.17.1, draft 2020-12, 2026-10-22); the Luxury Brands 1.3.0 documents also still validate against 1.4.0.

## Rendered harness — 0.5.0

The container cannot reach unpkg.com or tiles.openfreemap.org. The harness serves the repository on 127.0.0.1:4173, fulfils the pinned MapLibre 5.6.2 JS/CSS from the npm package, answers the TileJSON URL with a stub whose tiles are **synthetic OpenMapTiles-schema tiles generated per request** (building with render_height, transportation, water, park) and aborts glyph requests. Data, layers, pins, labels, panel, charts, table, the generated style, the massing decoder, the camera and the x-ray are the real code paths; only the basemap geography is synthetic. Log: `evidence/harness.log`; screenshots `evidence/d-*`, `m-*`, `a11y-*`, `s-*`.

| Viewport / theme | Flows checked | Result |
|---|---|---|
| 1280×800 light and dark | first paint = city preset z13.0 / pitch 56 / bearing 28 with auto focus of the three production Locales (39 rows of 233), crumb ประเทศไทย, Aha “61% ของร้านกล้องมีสาขาใน 3 ย่านนี้ · 23 จาก 38 ร้าน · 39 จาก 233 สาขา”, tiles ร้าน/สาขา/สถานที่/ย่าน with the camera pictogram, focus massing 64 rounded buildings; all three focus areas above the legend; ดูทุกย่าน → country plan z4.65 (233 rows); charts ranking / mix (5 equal 144-px columns) / compare; ย่าน รัชดา-ตะวันตก → model preset z14.59, crumbs ประเทศไทย › กรุงเทพมหานคร › รัชดา-ตะวันตก, “ย่านนี้ใน CityMETER” → `/v3/citymeter/BKK/L/1d671f78…?d=shoppingCenter`, มุมสถาปนิก disabled; Fortune Town → eye preset z17.6 / pitch 75 / FOV 24, host OSM way 176298735 (39.9 m) blue with the x-ray, 4-level crumbs; zoom 17 → name chips (Pix-One, Snapshot Camera) beside 17 co-located pins; store B2H / Best2Home (format ร้านในศูนย์การค้า, address, host-point precision, links หลักฐาน/พิกัด); co-branded BIG CAMERA CC Powermall พารากอน shows “ร่วมกับ Power Mall”; hypermarket venue บิ๊กซี พระราม 4 (type ไฮเปอร์มาร์เก็ต, crumbs … › ตลาดคลองเตย › BigC พระราม 4, framed on the host point, its pin in detail although outside the auto focus); country view legend “จังหวัด · จำนวนร้าน 1–7 … 29–36”, 64 frames, 17 chips after collision, panel 64 rows (54 folded); drill ภูเก็ต/เชียงใหม่ → venue-level Aha (100% at Central Phuket; 80% at Central Chiangmai); segment ช่องทางขายเสริม → 3 ร้าน / 7 สาขา; 2D plan; table 39 rows; help | pass — no page errors, no application errors, no horizontal overflow |
| 390×844 light and dark (DPR 2, touch) | first paint z12.73 with the three areas and the compact map Aha; bottom sheet; neighborhood from the ranking (plan while the sheet is open, model z13.6 after closing); charts mix in the tray; store DJI Experience Store - CentralWorld via URL (hold label ตัวตนหน้าร้านรอตรวจ, venue logo) | pass — no horizontal document overflow |
| keyboard | Tab from the theme control into the pin layer (one roving tab stop, no context pin focusable), ArrowRight, Enter → store mode (DJI Experience Store MBK Center) | pass |
| states | `?search=zzzz` (empty state + reset), `?cohort=review&areas=all` (9 rows), `?cohort=all` (234 rows, 59%), `?areas=all&view3d=0`, `?province=PKT`, `?neighborhood=<สยาม>&view=mix` | pass |

Fixed during this pass: (1) a venue outside the automatic top three lost its detail (the venue rows were taken from the focused rows; now from `scopeRows`); (2) the spread-out focus (Ratchada ↔ Siam) put สยาม under the legend — the pitched fit now counts the legend on wide screens and keeps zoom ≥ 13 so the 3D massing shows; (3) Chiang Mai's first finding read “7 สาขาอยู่นอก 27 ย่านของกรุงเทพฯ” — now the venue-level share; (4) raw store-format codes in the store facts — now Thai labels; (5) segment labels truncated in the mix bars — shorter labels, wider column. Harness artefact (not an app issue): synthetic features without ids triggered a MapLibre `in`-expression warning; ids added.

Console: only Chromium software-WebGL notices and missing glyph/source-layer warnings of the stub tiles; no application errors.

## Live checks — 0.5.0

Recorded after publishing (see the next section of this file once filled, and `RELEASE_RECEIPT.json` in the bundle). The real-tile look needs a browser that reaches OpenFreeMap; the container verifies the published bytes and loads the live page against the synthetic tiles.

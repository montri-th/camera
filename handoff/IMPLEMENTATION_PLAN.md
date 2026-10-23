# CityMETER Camera Shops — Implementation Plan

รุ่นส่งต่อ **0.5.2** · 23 ตุลาคม 2569 · schema **1.4.0** · Current machine contract: `implementation-plan.json`

## Current 0.5.2 contract — 23 October 2026

- 111 source features = 76 footprints + 35 parts across 76 of 147 named venues (+7 venues); 160 outlet-building contexts = 145 inside + 12 named contexts with outside points + 3 linked contexts with no selected point. All 253 outlet IDs, 236 points, 17 missing points and 107 accepted CityMETER host records are unchanged.
- A reviewed, independently identified named host can have an accepted building even without a CityMETER registry join. No outlet/venue point moved and no registry join was upgraded. Preserve point containment, outside named context and missing-point context as different outcomes. The original 103 geometries are preserved and 34 original part ownership links restored; eight acquired/reused features add Fortune Town, Lido Connect, Vanilla Moon, Central Phuket Floresta, Future Park Rangsit, Siam Square One and Central Chidlom. The new hotel part is host-complex context, never proof that each tenant occupies that part.
- Fortune Town has 17 outlets / 13 counted banners. Retail-parent display top17.5m and hotel-context display top105m are explicit level-count models with source height_m=null, not published metre heights or surveyed measurements. Do not spread hotel/tower height across the retail parent. Unknown source height remains null; 3m fallbacks are display values only.
- All77 source province frames remain (64 with observed rows,13 with no observed rows); the original64 feature records are unchanged. count-metric / ?metric=brands|pos switches unique banners / deduplicated outlet IDs across colours, legends, badges and rankings. Zero means ยังไม่พบสาขาในชุดข้อมูล, not verified absence. Brand share and exclusive/shared analysis retain explicit brand units.
- 44 approved banners; 40 represented overall / 39 default; 252 default retail rows. 43 store-logo files and 83 venue-logo files cover 139 of 147 venue labels. 1,411 private network candidates remain excluded. Branch-specific camera evidence, including undated Canon stockist/current Power Buy branch intersections, qualifies listings; it does not confirm current stock or field operation.
- Public units: แบรนด์ / สาขา / ศูนย์การค้า / ย่าน. Current adapter: `scripts/refresh-camera-master.py --master …`; identity, selected points and building decisions remain independent. Real browser/live verification is recorded separately in `VERIFICATION.md` and the release receipt.
- Qualified host solids render from zoom 13; only visible positive-height extrusions suppress background massing. Append x-ray last after basemap labels for the current venue or selected neighborhood, with DOM outlet marks/logos above the canvas; keep overview x-ray empty. Verify actual layer order and visible solids in the browser after a spatial change.

Current implementation: restore exact parent-owned part links and render/mask from zoom13; accept reviewed new host geometry; preserve every selected point/ID; show all77provinces and wire metric across the existing layout. Root owns native integration, browser/live checks and release.

## Retained 0.5.0/0.5.1 implementation notes — historical where superseded

รุ่นส่งต่อ 0.5.0 · ปรับเอกสาร 22 ตุลาคม 2569 · ข้อมูลตรวจถึง 22 ตุลาคม 2569 (research master ฉบับแก้ไข 13:13 UTC) · ใช้คู่กับ [PRODUCT_BRIEF.md](PRODUCT_BRIEF.md), [PRODUCT_STATEMENT.md](../PRODUCT_STATEMENT.md) และ [implementation-plan.json](implementation-plan.json)

Camera Shops สร้างบนสถาปัตยกรรมเดียวกับ [CityMETER Luxury Brands 0.5](https://github.com/montri-th/luxurybrands): เมือง 3 มิติที่โฟกัส 3 ย่านอันดับต้นตั้งแต่ภาพแรก, focus + quiet, breadcrumb ประเทศไทย › จังหวัด › ย่าน › สถานที่, venue x-ray, กรอบจังหวัด, pictogram และโลโก้สถานที่ สิ่งที่เปลี่ยนคือ **ข้อมูล** (research master ร้านกล้อง 22 ต.ค. 2569 ฉบับแก้ไข 13:13 UTC — จุด host และอาคารที่ตั้งมาจาก venue join และ building join ของ master ซึ่ง build ตรวจซ้ำกับ CityMETER production), **หน่วยนับ** (ร้าน = ชื่อร้าน/banner ไม่ซ้ำ, สาขา = จุดขายหนึ่งรายการ; storefront ร่วมแบรนด์เป็นหนึ่งสาขาที่นับทุก banner), **ชั้นย่าน** (Locale จริงของ CityMETER production แทน core ที่นิยามเอง), host = ศูนย์การค้าของ CityMETER ที่ master จับคู่ (ชนิดไฮเปอร์มาร์เก็ตจาก CityMETER Grocery รองรับในโค้ดแต่ยังไม่มีสาขาใช้), ป้ายชื่อร้านบนหมุดแทนโลโก้ (ยังไม่ได้เก็บโลโก้ร้าน) และ pictogram กล้องสำหรับ “ร้าน” รุ่นนี้ยังแก้สองเรื่องที่พบระหว่างตรวจ: ระดับสถานที่อ่านแถวจาก `scopeRows` (สถานที่นอก 3 ย่านอัตโนมัติไม่เสียรายละเอียด) และการจัดกรอบภาพแรกที่นับ legend พร้อมพื้น zoom 13 บน desktop และ rebase ข้อมูลบน master ฉบับ 13:13 UTC แล้ว (P21: build แรกใช้ export 12:36 UTC; master เพิ่ม `12_SPATIAL_JOIN` / `13_BUILDINGS` และพักพิกัด 6 สถานที่) เป้าหมายของแผนนี้คือให้ developer หรือ coding agent รับช่วงต่อได้โดยไม่ต้องเดาสถานะ และรู้ว่าอะไรคือ display-only กับอะไรคือข้อมูล

## สถาปัตยกรรมที่มีจริง

Static HTML/CSS และ JavaScript ES modules ไม่มี build step ไม่มี framework ไลบรารีภายนอกตอนรันมีตัวเดียวคือ MapLibre GL 5.6.2 จาก URL ที่ pin ไว้ใน `js/vendors.js` (earcut 3.2.4 vendored) บริการภายนอกคือ tile และ glyph ของ OpenFreeMap (`https://tiles.openfreemap.org/planet`, OpenMapTiles schema) `npm start` เสิร์ฟผ่าน Python, `npm test` ใช้ Node test runner (Node ≥ 20) ไม่มี `node_modules` ส่วน build ข้อมูลใช้ Python 3 (mapbox-vector-tile, shapely, Pillow) และ CityMETER production API สาธารณะ — ไม่ใช่ส่วนของหน้าเว็บ

| ไฟล์ | หน้าที่ | ข้อต่อที่ต้องรักษา |
|---|---|---|
| `index.html` | โครงหน้าจอ: header + toolbar (3D, มุมสถาปนิก), map panel + chrome, ถาดกราฟ, ตาราง, แผงอ่านข้อมูล (breadcrumb บนสุด), help dialog, launch overlay | DOM IDs ที่ `app.js`/`navigation.js` ใช้; `?v=20261023-c2` บน entry files; ตัวเลือก cohort `current`/`all`/`review`; ไม่มี CSV/caveat UI |
| `js/launch.js` | boot script, file bridge, loading/slow/error fallback | events `citymeter:ready`, `citymeter:load-error`; public origin `https://montri-th.github.io/camera/` |
| `js/app.js` | state, สามขอบเขตข้อมูล + focus mode, panel modes + back stack, breadcrumb, URL state, map lifecycle, กล้อง, ติดตั้งชั้น spatial | `update()` จุดเดียวที่คำนวณ selection; `detailRows()` ระดับสถานที่ = แถวของสถานที่จาก `scopeRows`; `pitchedPadding()` นับ legend บนจอกว้าง; `CITY_MASSING_ZOOM = 13` เป็นพื้นของ city fit บน desktop; ซ่อนคีย์ “อาคารของสถานที่” เมื่อไม่มีอาคารของสถานที่บนแผนที่; ตารางแสดงย่าน “—” เมื่อไม่มีจุด |
| `js/model.js` | 5 segments (กลุ่ม A–E ของ research), 4 channels, cohorts (`isReview` รวมสาขาที่ master พักพิกัด `venueJoin = held`), `FORMATS`, `PROVINCES` 77 จังหวัด (รหัส production + DOPA), `bannersOf`/`bannerSegmentsOf`/`brandSet`/`countBrands`/`projectSegment`, `BANNER_LABELS`, ตัวกรองร่วม, summaries | ไม่แก้แถวต้นทาง (segment filter คืนสำเนา); ร้าน กับ สาขา นับแยก; operator ไม่ใช่ banner; รหัสจังหวัดตรง production |
| `js/neighborhoods.js` | point-in-polygon, membership, สรุปย่าน (ร้านผ่าน `countBrands`) | boundary คงที่; shared edge ใช้ priority แล้ว stable ID |
| `js/area-insight.js` | Aha 3 ย่าน และ area-focus filter | ตัวเศษ = union ของ banner ใน 3 ย่าน; ตัวหาร = banner ทั้งหมดในฐานที่กรอง รวมแถวนอก Locale และแถวไม่มีพิกัด |
| `js/chart-model.js` | อันดับ / matrix / exclusive-shared | เทียบทุก assigned areas ก่อนตัด Top-N; ช่อง matrix นับคู่ (สาขา × banner) ตาม segment ของ banner |
| `js/profile-model.js` | โปรไฟล์ย่าน สถานที่ ร้าน, `segmentMixOf`, `describeStatus` (ที่อยู่ติดต่อ, ตัวตนหน้าร้านรอตรวจ, รวมรายการรอตรวจ, ที่ตั้งขัดกัน), `describeGeometry` (จุดตัวแทนศูนย์การค้า; จุดตัวแทนไฮเปอร์มาร์เก็ตรองรับ; พิกัดรอตรวจ เมื่อ `venueJoin = held`), `rankVenues` | pure; ใช้ `scopeRows` เป็นฐานเทียบ; ไม่ยกระดับความแม่นพิกัด; ร้านริมถนนที่ไม่มีสถานที่ไม่ใช่ “สถานที่” |
| `js/scales.js` | LDS `count` LUT 41 ค่า ใช้ครบ 41 ระดับแบบเส้นตรง (`buildCountScale`, `countSampleIndex`, `countRamp`), EVID-05 | ห้าม interpolate สีใหม่; HEX เดียวกันสองธีม |
| `js/map-style.js`, `js/massing.js`, `js/mvt.js`, `js/geometry.js`, `js/camera.js`, `js/venue-xray.js` | basemap กระดาษ, มวลอาคารสองชั้น, MVT reader, เรขาคณิต, กล้อง, venue x-ray — **โค้ดเดียวกับ Luxury 0.5** | ลำดับชั้น 3D: city/focus/occluder → host extrusion → venue-xray → `water-name`; ทุก preset pitch ≤ 90° − fov/2 − 3° |
| `js/map-layers.js` | choropleth Locale + outline + selected, focus/quiet, ป้าย ink chip (ย่าน/จังหวัด) | fill ก่อน `waterway`, maxzoom 14.5; ป้ายนับ “ร้าน” |
| `js/pins.js` | หมุดรายสาขา, context pins, ป้ายที่ zoom ≥ 14 ในโฟกัส: โลโก้ banner เมื่อมีทะเบียน ไม่เช่นนั้นป้ายชื่อขนาดตามข้อความ (`textLabelWidth`), keyboard | พิกัดต้นทางไม่เปลี่ยน; ≤ 250 ป้าย; context pins ไม่มีป้ายและไม่อยู่ใน tab order; ป้ายชื่อไม่ใช่โลโก้แทน |
| `js/buildings.js` | อาคารของสถานที่ (`camera-venue-buildings`, `-3d`, `-outline`), coverage, `displayedFeatures()`, `HOST_LAYERS` | ข้อมูล = building join ของ research master; สี `map.activeLayer`; ติดตั้งก่อนมวลอาคาร; attribution © OpenStreetMap contributors · CityMETER |
| `js/provinces.js` | กรอบจังหวัดที่มีสาขา (fill < z9, outline < z12, selected < z13), `buildProvinceModel` | นับจากแถวที่ไม่ใช้ตัวกรองจังหวัด; EVID-05; ไม่ใช่ขอบเขตการปกครองที่ยืนยัน |
| `js/breadcrumb.js` | ประเทศไทย › จังหวัด › ย่าน › สถานที่, `document.title` | ย่าน = Locale ของ production (id = Locale uuid) จาก point-in-polygon; crumb สถานที่ถือ CityMETER host id; ไม่สร้าง Locale นอกกรุงเทพฯ |
| `js/charts.js` | ranking / matrix ช่องเท่ากัน / compare เป็น HTML+SVG | ทุก mark เป็น `<button>`; `SEGMENT_ORDER` มาจาก `SEGMENTS` |
| `js/panel.js` | HTML ของแผงทุกโหมด, `HOST_TYPES` (ประเภท host ภาษาไทย), รายการจังหวัด (10 + `<details>`), Aha ระดับสถานที่เมื่อจังหวัดไม่มี Locale (เฉพาะสถานที่ที่มีจุด host), ลิงก์ “ย่านนี้ใน CityMETER”, ข้อเท็จจริงของสาขา (ร้านร่วม, รูปแบบ, ที่อยู่, ลิงก์; ย่าน “—” เมื่อไม่มีจุด) | pure strings; ปุ่มทุกตัวมี `data-action`; ไม่มีคำว่า “แบรนด์” ใน UI |
| `js/brand-logos.js` | ทะเบียนโลโก้ banner (Camera Shops ว่าง, `ALIASES` ว่าง) | ไม่ fuzzy-match; ทะเบียนว่าง = ไม่มีโลโก้ |
| `js/venue-logos.js` | ทะเบียนโลโก้สถานที่: ค้นด้วย host id แล้วชื่อตรงตัว, กล่องพื้นรอง + บทบาท | ไม่ fuzzy; ชื่อสถานที่ยังเป็นตัวตน |
| `js/navigation.js` | nav-7 icons, `PICTOGRAM_CONTRACT` (ร้าน = `photo_camera` U+E412), toolbar titles, help | pictogram แสดงเมื่อฟอนต์โหลด (`pictograms-ready`); nav-7 bytes ไม่เปลี่ยน |
| `styles.css`, `logos.css`, `navigation.css`, `assets/theme.css` | layout, chips (`.pin-brand-label.is-text`, `.pin-name`), mix bars (คอลัมน์ป้าย 132 px), tokens | token-only colours |
| `scripts/build-camera-data.py` | research CSVs + venue join ของ master ที่ตรวจแล้ว (`venues_resolved.json`) + ไฟล์ feature อาคารของ master (`--buildings`) → `data/camera.json` (แถวมี `venueJoin`), `data/neighborhoods.geojson` (+ ตรวจ membership กับ `locatePoint`), `data/venue-buildings.geojson` (ตรวจทุก feature กับ `13_BUILDINGS`, แปลง `render_as`), `data/brand-logos.json`, `data/venue-logos.json` + `assets/venue-logos/` + manifest | ไม่มีเบอร์โทร (`no_phone`), ไม่มี URL ส่วนตัว (`public_https`); พิกัดเฉพาะสาขาที่ master จับคู่และเท่ากับจุดที่ตรวจแล้ว; หยุดเมื่อไม่ตรง |
| `scripts/extract-provinces.mjs` | `data/provinces.geojson` เฉพาะจังหวัดที่มีสาขา จาก OpenGISData-Thailand | provenance (commit, sha256, วันที่); ปัด 5 ตำแหน่ง; ตัด ring ที่เหลือ < 4 จุด |
| `scripts/build-pictogram-font.py` | ฟอนต์ pictogram 8 glyph + manifest | byte-reproducible (timestamp จากต้นฉบับ); ตรวจว่า codepoint คือไอคอนตามชื่อ |
| `scripts/host-links/` (`01`–`04`, `crosswalk_sc.py`, `crosswalk_grocery.py`) | ขั้นต้นน้ำ: อ้างอิง production (จังหวัด, lv1), ผู้สมัคร Grocery (เฉพาะข้อเสนอ), `03_verify_master_join.py` ตรวจ venue join ของ master กับ production → `venues_resolved.json` + `host_link_proposals.{json,csv}` (crosswalk ของแอปเป็นข้อเสนอให้ทีม research เท่านั้น), Locale → `locales.geojson` | ไม่เพิ่ม ย้าย หรือยกระดับการจับคู่ของ master; ไม่จับคู่ด้วยระยะ; ทุก host ตรวจจังหวัด; cache ทุก response → ทำซ้ำได้ byte-for-byte |
| `scripts/build-asset-manifest.py` | `assets/manifest.json` (ทะเบียน asset สาธารณะของ LDS) จาก bytes จริง | ห้ามแก้ hash ด้วยมือ |
| `scripts/build-handoff.mjs`, `scripts/verify-live.mjs` | manifest + ZIP, live byte attestation (`https://montri-th.github.io/camera/`) | hash จาก bytes จริง; ตรวจ live ก่อนอ้างว่าเผยแพร่ |

ถอดออกจากชุด Luxury: `data/luxury.json`, `data/legacy-audit.json`, `assets/brand-logos.svg`, `assets/brand-logos-manifest.json`, `scripts/build-venue-logos.py` (แทนด้วย `build-camera-data.py`)

## ข้อมูลและ pipeline

หน่วยแถว: หนึ่งรายการสาขาของ banner ร้านกล้อง (จุดขาย หรือที่อยู่ติดต่อหนึ่งแห่ง) — 234 สาขา (ค่าเริ่มต้น 233), 43 banner ที่อนุมัติ (39 มีสาขา), 241 ลิงก์ banner ที่นับ, storefront ร่วมแบรนด์ 7 แห่ง, 64 จังหวัด, กรุงเทพฯ 101 แถว

1. ส่งออกทุกแท็บของ research master ฉบับแก้ไข 2026-10-22 13:13 UTC เป็น CSV (`00_README` … `13_BUILDINGS`, `99_APPROVED_SCOPE`) และเก็บไฟล์ feature อาคารของ master (`CityMETER_Camera_Shops_Venue_Buildings_2026-10-22.geojson`)
2. ตรวจ venue join ของ master (`03_verify_master_join.py`): 144 สถานที่ → 106 จับคู่แล้ว → 106 Shopping Center (179 สาขา; วิธีของ master: `unique_normalized_exact_curated_alias` 43, `curated_distinctive_bilingual_or_official_host_alias` 33, `existing_explicit_host_reference` 30); detail ใน production มีอยู่และพิกัดตรงกันทุกแห่ง (106/106) ทุกจุดอยู่ในจังหวัดของสถานที่ตาม polygon ของ production; 32 สถานที่รอจับคู่ทะเบียน และ 6 สถานที่ถูกพักไว้ ไม่มีจุด; crosswalk ของแอปเขียนข้อเสนอ 28 สถานที่ / 29 สาขาลง `host_link_proposals.csv` (ไม่เผยแพร่)
3. ถอด Locale ของกรุงเทพฯ ที่มีจุด host จาก `base/mvt/ML` (z15) → 26 ย่าน; membership ตรง `base/locatePoint` 31/31
4. อาคารที่ตั้ง = building join ของ master: ทุก feature ตรงแถวใน `13_BUILDINGS` (id, sha256 ของ geometry, ความสูง, จำนวนสาขา) และสาขาที่ผูกเป็นสาขาที่จับคู่แล้วของ host นั้น → 103 features (footprint 69 + ส่วนอาคาร 34), 69 host, 119 จาก 179 สาขาที่มีพิกัด; 37 host ไม่มีอาคารที่ master ยอมรับ; `render_as` แปลงเป็น extrusion 95 / outline 8
5. `npm run data:build` → ไฟล์ข้อมูลสาธารณะ; `npm run data:provinces` → กรอบจังหวัด; `npm test` (fixture จาก snapshot จะล้มโดยตั้งใจเมื่อข้อมูลเปลี่ยน)

ขั้น 2–3 อยู่ใน `scripts/host-links/` (`01_production_reference.py`, `02_grocery_candidates.py`, `03_verify_master_join.py`, `04_build_locales.py` พร้อม crosswalk ที่ทบทวนแล้ว `crosswalk_sc.py`, `crosswalk_grocery.py` ซึ่งตอนนี้ใช้ทำข้อเสนอเท่านั้น) ผลิต `venues_resolved.json`, `host_link_proposals.{json,csv}`, `locales.geojson` ใน `CAMERA_WORK`; ขั้น 4 อยู่ใน `scripts/build-camera-data.py` — 22 ต.ค. 2569 รันซ้ำ 01–04 บนสำเนา cache ได้ไฟล์เหมือนเดิมทุก byte และ `npm run data:build` ได้ไฟล์สาธารณะเหมือนเดิมทุกไฟล์ (ดู `scripts/host-links/README.md`); ไฟล์ CSV ของ research ไฟล์ feature อาคารของ master และไฟล์โลโก้ 7 ไฟล์จาก Drive ยังเป็นข้อมูลทำงานภายใน

## แผนงานและสถานะ

| ID | งานและผลลัพธ์ | สถานะ | หลักฐาน |
|---|---|---|---|
| P01 | Repository บนสถาปัตยกรรม Luxury Brands 0.5; ถอดข้อมูล sprite ไฟล์โลโก้ และ builder ของ Luxury | done | tests geometry/massing/mvt/scales/venue-xray/map-style ผ่านบน repo นี้ |
| P02 | `data/camera.json` จาก research master: หน่วยสาขา, banners, segments, cohorts, holds; ล้างเบอร์โทร; ไม่มี URL ส่วนตัว | done | `scripts/build-camera-data.py`; `tests/model.test.js` |
| P03 | Host จาก venue join ของ research master: 106/144 สถานที่ → 106 ศูนย์การค้า (179 สาขา) ตรวจซ้ำกับ production; พิกัดเป็นจุด host เท่านั้น; ข้อเสนอของแอปไม่เผยแพร่ | done | `centers[]` พร้อม `match` (= `venue_join_method`); `03_verify_master_join.py`; `tests/data-contract.test.js` |
| P04 | ย่าน = Locale ของ production 26 แห่ง, id = Locale uuid, ลิงก์หน้า production | done | `metadata.membershipCheck` 31/31; `tests/neighborhoods.test.js` |
| P05 | อาคารของสถานที่ = building join ของ research master: 103 features (footprint 69 + ส่วนอาคาร 34) ของ 69 host | done | `data/venue-buildings.geojson` metadata; `tests/data-contract.test.js`; harness MBK CENTER, Ayutthaya City Park |
| P06 | กรอบจังหวัด 64 จังหวัด + `PROVINCES` ครบ 77 (รหัส production) | done | `tests/provinces.test.js`, `tests/map-style.test.js`; harness country |
| P07 | โลโก้สถานที่: 30 ไฟล์ (23 จากชุด Luxury, 7 จากไฟล์ Drive ของชีต; sha256 ตรงชีต), 31 จาก 144 ชื่อ, ทะเบียน complete | done | `tests/venue-logos.test.js` |
| P08 | นับ ร้าน/สาขา: storefront ร่วมแบรนด์นับครั้งเดียว, segment projection, mix นับคู่ (สาขา × banner) | done | `tests/model.test.js`, `area-insight`, `chart-model`, `profile-model`, `first-insight` |
| P09 | คำและป้าย: ร้าน / สาขา / สถานที่ / ย่าน; ป้าย segment/channel/cohort/format/host เป็นไทย; ป้ายสถานะ hold | done | `tests/provinces.test.js` (ไม่มี “แบรนด์”); harness |
| P10 | ป้ายชื่อบนหมุดเมื่อไม่มีโลโก้ (`BANNER_LABELS` เช่น Insta360, DJI Experience, FUJIFILM House) | done | `tests/pins.test.js`, `tests/brand-logos.test.js`, `tests/model.test.js` |
| P11 | Pictogram ร้าน = `photo_camera` (1,724 bytes, sha256 `259de66e…`), build ซ้ำได้ | done | `tests/provinces.test.js` (contract ↔ manifest ↔ CSS) |
| P12 | ระดับสถานที่อ่านแถวจาก `scopeRows` | done | harness Ayutthaya City Park (นอก 3 ย่าน) |
| P13 | จัดกรอบภาพแรก: padding นับ legend + พื้น zoom 13 บน desktop | done | harness desktop first paint z13 p56 b28 |
| P14 | จังหวัดที่ไม่มี Locale: Aha ย้ายไประดับสถานที่, ไม่มี tile “0 ย่าน” | done | `tests/provinces.test.js`; harness `?province=CMI`, `?province=PKT` |
| P15 | Unit tests บนข้อมูล Camera Shops | done | `npm test` 106/106 (รวม `tests/data-contract.test.js`) |
| P16 | Rendered harness: desktop/mobile × light/dark, a11y, states | done (scoped) | `VERIFICATION.md`; รันซ้ำหลัง rebase (0 app errors); basemap สังเคราะห์ — ยืนยันรูปจาก tile จริงที่ N02 |
| P17 | เอกสารและ machine contracts 0.5.0 (statement, brief, plan, schema 1.4.0, DATA_METHOD, NEIGHBORHOOD_METHOD, README, AGENTS) | done | ajv 8.17.1 (draft 2020-12) ก่อน release commit |
| P18 | Release 0.5.0: `assets/manifest.json` จาก bytes จริง, `?v=20261023-c2`, push `montri-th/camera` main, Pages branch deploy | pending | run `pages-build-deployment` |
| P19 | Live attestation + bundle (manifest บน commit ที่ push, `verify:live`, bundle พร้อม receipt/evidence) | pending | `RELEASE_RECEIPT.json` |
| P20 | Resilience จาก Luxury (launch overlay, file bridge, vendor retry) | retained, source-checked | file: ไปที่ `https://montri-th.github.io/camera/`; ไม่ได้ทำ fault injection ซ้ำ |
| P21 | Rebase บน research master ฉบับ 13:13 UTC: จุด host และอาคารที่ตั้งจาก venue join / building join ของ master; สาขามีจุด 208 → 179, ย่าน 27 → 26, อาคาร 136 → 103 features, ข้อค้นพบแรก 61% → 58%; ถอด `03_build_crosswalk.py` และ `05_build_host_buildings.py` | done | `tests/data-contract.test.js`; `scripts/host-links/README.md`; harness รันซ้ำ |
| P22 | สีข้อมูลใช้ครบ 41 ระดับของ LDS (กฎเจ้าของ 2026-10-22): `buildCountScale` / `countSampleIndex` / `countRamp` แทนการจัด 5 ชั้น ทั้งสีย่าน กรอบจังหวัด แท่งอันดับ และตารางกราฟ; คำอธิบายเป็นแถบไล่สี 41 ช่อง (1 · 7 · 13 สำหรับย่าน, 1 · 19 · 36 สำหรับจังหวัด); ตัวเลขบนสีลำดับ 27–29 อยู่บนชิปพื้นการ์ด | done | `tests/scales.test.js`; harness รันซ้ำทุก scenario |

## งานถัดไปที่แนะนำ (backlog สำหรับ vibe coding)

| ID | งาน | เจ้าของ/สถานะ |
|---|---|---|
| N01 | ย้าย harness (Playwright + vendored MapLibre + stub TileJSON + tile สังเคราะห์) เข้า CI พร้อม fault injection และ `file:` (AC02/AC03/AC05) | frontend |
| N02 | ตรวจ live ด้วย tile จริง (container เข้าถึง OpenFreeMap ไม่ได้): ภาพแรก 3D, x-ray ที่ MBK CENTER / Siam Paragon, Fortune Town ที่จุด host, มุมมองประเทศ, ธีมมืด, 390 px | QA / owner — หลัง publish |
| N03 | เก็บโลโก้ร้าน (คอลัมน์ logo ของ `01_BRANDS` ว่าง; `data/brand-logos.json` = `not_collected`); หมุดจะแสดงโลโก้แทนป้ายชื่อผ่านทะเบียนเดิม | data owner + frontend |
| N04 | ตรวจตัวตนลิงก์แผนที่ทางการ 143 ลิงก์ แล้วหาพิกัดของร้านริมถนน 15 ร้าน — ไม่เอาพิกัดจากลิงก์ที่ยังไม่ตรวจ | data/field |
| N05 | host ให้ 32 สถานที่ที่ master ยังไม่จับคู่: ตรวจข้อเสนอใน `host_link_proposals.csv` 25 แห่ง (ไฮเปอร์มาร์เก็ต Big C/Lotus's 19 บนระเบียน Grocery, โรบินสัน 6 บนระเบียน Shopping Center ที่ชื่อไม่เฉพาะสาขา (“Robinson”/“ROBINSON” 5, “Robinson Lifestyle Center” 1)) และหา host ให้อีก 7 แห่ง (Lit Bangkok Hotel, Maneeya Center North, Panasiri Resident, The Rich Biz Home, แพชชั่น ระยอง, เม-ญ่า ไลฟ์สไตล์ เชียงใหม่, เจียง-ฟิวเจอร์ หนองคาย); คลี่คลาย 6 สถานที่ที่ master พักไว้ (Siam Square One, Central Phuket Floresta, ท็อปส์ ซูเปอร์สโตร์ พะเยา, มาร์คโฟร์ แพร่, ไชยแสง สิงห์บุรี, ไอที พลาซ่า สำโรง); จุดขึ้นแอปเมื่อ master จับคู่แล้วเท่านั้น — host ชนิด Grocery ต้องมีคอลัมน์ชนิด host ใน master | ทีม research (master) + data owner + CityMETER platform |
| N06 | ตรวจภาคสนาม 9 แถว hold: คู่ DJI Experience Store / Phantom Thailand 6 แถว (centralwOrld, Central Hat Yai, Megabangna), BIG CAMERA เดอะมอลล์บางแค (รวมห้องเดียวกัน), UNIT CAMERA SHOP สยาม (Lido Connect กับ Siam Square ซอย 2), World Camera บรมราชชนนี (ที่อยู่ติดต่อ) | field research |
| N07 | ทบทวน `03_BRANCH_REVIEW` 72 แถว (dealer เดิมของ WORLD CAMERA 42 แถว) และชื่อใน review queue 7 ชื่อ ก่อนเข้าชุดข้อมูล | data research |
| N08 | หาสาขาของ banner ที่อนุมัติแต่ยังไม่มีสาขา 4 ชื่อ (Pixpros House, Naituanoi Store, BaNANA, Studio7) หรือถอดออกจาก scope | data owner |
| N09 | ระดับย่านนอกกรุงเทพฯ: production มี Locale เฉพาะกรุงเทพฯ — ลงทะเบียน Locale หรือใช้ระดับเทศบาล (`/M/{dopa code}`) สำหรับเชียงใหม่ พัทยา หาดใหญ่ ขอนแก่น ภูเก็ต | platform + data owner (ตัดสินใจ) |
| N10 | แทนกรอบ OpenGISData-Thailand ด้วยขอบเขตจังหวัดของ production และต่อการกดเข้ากับ route ของ production (เหมือน Luxury N13) | platform + data owner (ตัดสินใจ) |
| N11 | อาคารให้ 37 host ที่ master ยังไม่ยอมรับอาคาร (เช่น Fortune Town ที่ไม่มีอาคารต้นทางที่จุดตัวแทน) และอาคารที่ master พักไว้รอตรวจตัวตน (`รอตรวจตัวตนอาคาร` 21 สาขา); อาคารขึ้นแอปผ่าน `13_BUILDINGS` เท่านั้น | ทีม research (building join) |
| N12 | Backport ไป Luxury Brands: ระดับสถานที่อ่านแถวจาก `scopeRows` (Luxury 0.5 ใช้ `state.rows` ทำให้สถานที่นอก 3 ย่านอัตโนมัติไม่มีอาคารสีน้ำเงินและหมุดสี) และ padding นับ legend + พื้น zoom 13 | frontend (repo luxurybrands) |
| N13 | ~~commit crosswalk ที่ทบทวนแล้วและ builder ต้นน้ำ~~ — ทำแล้วใน 0.5.0: `scripts/host-links/` 01–04 (ทำซ้ำได้ byte-for-byte จาก cache); หลัง rebase master เป็นเจ้าของ venue join และ building join; ที่เหลือ: ส่ง `host_link_proposals.csv` ให้ทีม research ทุกรอบ และทำ candidate review ของ Shopping Center (ค้นชื่อในจังหวัด) ให้เป็นสคริปต์ | data engineer |
| N14 | เจ้าของรอบอัปเดตข้อมูล รอบเวลา และการทบทวนการปิด (snapshot นี้ไม่มีสาขาปิด; Eastbourne ปิดระดับแบรนด์ 15 ก.พ. 2568) | data owner |
| N15 | ทดสอบสมมติฐาน Who/What/Which/How กับร้านกล้อง ทีมค้าปลีกของแบรนด์กล้อง และฝ่ายเช่าพื้นที่ศูนย์การค้า | product owner |
| N16 | ลงทะเบียนชุด pictogram (ร้าน = `photo_camera` ที่นี่, diamond ใน Luxury) ใน LDS แล้วยกเลิกข้อยกเว้น | design system owner |
| N17 | โลโก้สถานที่อีก 113 ชื่อ และโลโก้สถานที่บนแผนที่ | data owner + frontend |
| N18 | งบ 3D บนมือถือ: ภาพแรกบนโทรศัพท์ต่ำกว่า z13 เพื่อให้เห็นครบ 3 ย่านจึงไม่มีมวลอาคาร — พิจารณากรอบเฉพาะมือถือหรือมวลอาคารจาก z12.5; decode tile บน worker | frontend |

## เกณฑ์รับงาน

| ID | สถานการณ์ | ผลที่ต้องเห็น |
|---|---|---|
| AC01 | เปิดผ่าน HTTP/HTTPS | ข้อมูลและแผงพร้อมก่อน map; launch overlay ปิดเมื่อ `citymeter:ready` |
| AC02 | เปิด `index.html` ผ่าน `file:` | ไปยัง `https://montri-th.github.io/camera/` โดยเก็บ query/hash |
| AC03 | core data ล้มเหลว | ข้อความสั้น ลิงก์ ลองใหม่; ไม่มี shell ว่าง |
| AC04 | optional GeoJSON/catalog ผิดรูป | counts/filter/table ใช้ได้; invalid geometry ไม่เข้าการคำนวณ |
| AC05 | MapLibre timeout แล้วลองใหม่ | ข้อมูล ตาราง กราฟยังอยู่; retry ใช้ได้; ไม่มี script ซ้อน |
| AC06 | ตัวกรอง/ย่าน/focus/ล้าง | pins/counters/table ใช้ `rows`; Aha/choropleth/charts ใช้ `scopeRows`; cohort `current` (ค่าเริ่มต้น) / `all` / `review` (17 แถว รวมสาขาที่ master พักพิกัด); URL คืนสถานะได้ |
| AC07 | สาขาหลายรายการที่จุด host เดียว | ทุกสาขามีหมุด (Fortune Town 17 สาขา); slot ใกล้ anchor; พิกัดไม่เปลี่ยน |
| AC08 | ป้ายหนาแน่น | ≤ 250 (โลโก้เมื่อมีทะเบียน ไม่เช่นนั้นป้ายชื่อ), ต่าง banner ก่อน, ไม่มีป้ายต่ำกว่า zoom 14 หรือบน context pins |
| AC09 | desktop/mobile, light/dark | header 48 px; แผง/sheet ตามสัญญา; ไม่มี horizontal overflow ที่ 390 px; basemap ที่สร้างเองทั้งสองธีม |
| AC10 | คีย์บอร์ด/reduced motion | Tab เข้าชั้นหมุด, ลูกศรเลื่อน, Enter เปิดสาขา; context pins ไม่อยู่ใน tab order |
| AC11 | ข้อความ dynamic | ไม่มี caveat/research/CSV; แถว hold มีป้ายสถานะของตัวเอง (สถานที่ที่ master พักไว้: “พิกัดรอตรวจ”); missing ไม่แสดงเป็น 0 |
| AC12 | release/handoff | commit, live bytes, manifest, bundle ตรงกัน; ไม่มี private URL, secrets หรือเบอร์โทรในไฟล์ที่เผยแพร่ |
| AC13 | focus + quiet | ย่านนอก focus เป็นเส้นขอบบาง ป้ายจาง สาขานอก focus เป็นจุดเทาไม่มีป้าย มวลอาคารเมืองโทนเงียบ |
| AC14 | choropleth | ระดับสีตรง legend และกราฟอันดับ; ค่าคือ “ร้านไม่ซ้ำต่อย่าน”; measured zero มีเส้นขอบศูนย์; HEX เดียวกันสองธีม |
| AC15 | 3D first Aha | preset `city` (pitch 56, bearing 28) ที่รัชดา-ตะวันตก · ราชประสงค์ · สยาม; desktop ไม่ต่ำกว่า z13 (มีมวลอาคาร) โดย padding นับ legend; แผง: 58% = 22 จาก 38 ร้าน · 37 จาก 233 สาขา (fixture ของ master ฉบับ 13:13 UTC) + ดูทุกย่าน + เปรียบเทียบย่าน |
| AC16 | basemap ที่สร้างเอง | `buildMapStyle` + `--basemap-*` เท่านั้น; data fill ก่อน `waterway`; massing ก่อน `water-name`; เปลี่ยนธีมแล้วติดตั้งชั้นใหม่ |
| AC17 | มวลอาคารโฟกัสมุมโค้ง | ล้อมจุดยอดต้นฉบับทุกจุด; twin ของอาคารที่ตั้งถูกซ่อน |
| AC18 | กล้อง | `model` FOV 14 ในย่าน; ระดับสถานที่ `eye` (pitch 75 / FOV 24) เป็นค่าเริ่มต้น จัดกรอบที่ footprint (หรือจุด host เมื่อไม่มี); `?cam=model`; `plan` เมื่อปิด 3D |
| AC19 | breadcrumb | ย่าน = Locale ของ production จาก point-in-polygon; crumb สถานที่ถือ host id (Shopping Center; Grocery รองรับ); สถานที่ที่ไม่มีจุดข้ามระดับย่าน; `province` = รหัส production; ร้านไม่เป็น crumb; จอแคบพับเป็น “…” |
| AC20 | matrix | ทุกช่องเท่ากัน (5 คอลัมน์ × 144 px ใน harness); ตัวเลขคือความหมาย |
| AC21 | product statement | MD + JSON มี Who/What/Which/How, quality bar, hypotheses ของ Camera Shops; JSON ผ่าน schema 1.4.0 |
| AC22 | โฟกัสระดับสถานที่ | เฉพาะอาคารของสถานที่เป็นสีน้ำเงินและเฉพาะแถวของสถานที่มีหมุดสี — แถวมาจาก `scopeRows` จึงใช้ได้แม้สถานที่อยู่นอก focus อัตโนมัติ; ฉากมองทะลุเหมือน Luxury 0.5 |
| AC23 | คำ | ใช้ ร้าน / สาขา / สถานที่ / ย่าน สม่ำเสมอ ไม่มี “แบรนด์” ใน UI; อ่านเป็นธรรมชาติที่ 390 px และ desktop |
| AC24 | อาคารของสถานที่มองเห็นเสมอ | เห็นและกดได้ทุกมุมใน 3D (pitch ≤ 75, zoom ≥ 13); ลำดับชั้นตามสัญญา |
| AC25 | มุมมองทั้งประเทศ | z < 9 กรอบ 64 จังหวัดระบายตาม count classes, legend “จังหวัด · จำนวนร้าน”, ชิป; แผงแสดง 10 จังหวัดและพับที่เหลือ; กดแล้วได้ตัวกรอง breadcrumb กล้อง |
| AC26 | Pictogram | แสดงหลังฟอนต์โหลด; ร้าน = `photo_camera`; ไม่มีฟอนต์ข้อความยังอ่านได้; nav-7 ไม่เปลี่ยน |
| AC27 | โลโก้สถานที่ | ค้นด้วย host id แล้วชื่อตรงตัว; ไม่มีลิงก์ = ไม่มีกล่อง; sha256 ตรงทะเบียน; ไม่มีลิงก์ Drive |
| AC28 | การนับ banner | storefront ร่วมแบรนด์เป็นหนึ่งสาขา banner แต่ละชื่อนับครั้งเดียว (BIG CAMERA + Power Mall, DJI + Hasselblad, Insta360 + BIG CAMERA); operator ไม่ใช่ banner |
| AC29 | segment projection | กรองประเภท “ช่องทางขายเสริม” → 3 ร้าน · 7 สาขา (Power Buy, King Power, Power Mall 5 จุด); ไม่แก้แถวต้นทาง |
| AC30 | Locale เป็นย่าน | id = Locale uuid ของ production; membership 31/31 ตรง `locatePoint`; ลิงก์ “ย่านนี้ใน CityMETER” → `/v3/citymeter/BKK/L/{uuid}?d=shoppingCenter` |
| AC31 | host ชนิดไฮเปอร์มาร์เก็ต (รองรับ ไม่มีในข้อมูลรุ่นนี้) | host ที่เป็นระเบียน Grocery (`centers[].kind = grocery`) เปิดเป็นสถานที่ประเภท ไฮเปอร์มาร์เก็ต อ่าน “จุดตัวแทนไฮเปอร์มาร์เก็ต” และไม่มีลิงก์ Shopping Center — ตรวจด้วย fixture เพราะ master ฉบับ 13:13 UTC ยังไม่จับคู่ระเบียน Grocery |
| AC32 | จังหวัดที่ไม่มี Locale | Aha “{share}% ของร้านกล้องมีสาขาที่ {สถานที่นำที่มีจุด host}” พร้อมตัวเศษตัวหาร (เชียงใหม่ 80% = 4 จาก 5 ร้านที่ Central Chiangmai; ภูเก็ต 67% = 2 จาก 3 ร้านที่ Central Phuket — Central Phuket Floresta ที่ถูกพักไว้อยู่ในรายการแต่ไม่ถือข้อค้นพบ), ปุ่ม ดูสถานที่นี้ / ดูสาขา, ไม่มี tile “0 ย่าน”; ไม่มีสถานที่ใดมีจุด → “{สาขา} สาขา · {ร้าน} ร้าน” (ตาก) |
| AC33 | ความสะอาดของข้อมูลสาธารณะ | ไม่มีเบอร์โทร (แทนด้วย `[เบอร์โทรไม่เผยแพร่]`); ไม่มี URL Drive/Google ส่วนตัว; ลิงก์แผนที่ทางการเป็นลิงก์เท่านั้น ไม่ใช่พิกัด |
| AC34 | ป้ายชื่อ | zoom ≥ 14 หมุดในโฟกัสที่ไม่มีโลโก้ได้ป้ายชื่อขนาดตามข้อความ (≤ 18 ตัวอักษร); ไม่ขึ้นบนจุดบริบท; ไม่อ้างว่าเป็นโลโก้; บรรทัดสถานะนับเป็น “ป้ายชื่อ” |
| AC35 | สาขาไม่มีพิกัด | 55 สาขา (ร้านริมถนน 15, สถานที่ที่ master รอจับคู่ทะเบียน 32, สถานที่ที่ master พักไว้ 8) อยู่ในจำนวน ตาราง ยอดจังหวัด และตัวหารของ Aha; ไม่มีหมุดและไม่มีย่าน (ย่านแสดง “—”); ร้านริมถนนไม่เป็นกลุ่มสถานที่ ส่วนสาขาที่สถานที่ไม่มี host คงชื่อสถานที่ไว้ |
| AC36 | สถานที่ที่ research master พักไว้ | สาขาที่ `venueJoin = held` (Siam Square One, Central Phuket Floresta และอีก 4 แห่ง รวม 8 สาขา) ไม่มีจุด; หน้าร้านอ่าน “พิกัดรอตรวจ”, ย่าน “—”, breadcrumb ข้ามระดับย่าน; ยังอยู่ในจำนวน ตาราง ตัวหารของ Aha และ cohort `review` (17 แถว) |
| AC37 | จุดและอาคารมาจาก research master | ทุกแถวที่มีจุดเป็นสาขาที่ master จับคู่และอยู่บนจุด detail ของ Shopping Center (`coordinateSource` = URL ของ detail); แถวที่พักไว้หรือยังไม่จับคู่ไม่มีจุด; อาคารทุกรูปเป็น feature ของ `13_BUILDINGS` (id ไม่ซ้ำ, `render_as` extrusion/outline, สาขาที่ผูกเป็นสาขาที่จับคู่แล้วของ host นั้น, © OpenStreetMap contributors); ข้อเสนอของแอปไม่เผยแพร่ |
| AC38 | สีข้อมูล 41 ระดับ (กฎเจ้าของ) | ทุกค่าที่ระบายสี (ย่าน กรอบจังหวัด แท่งอันดับ ช่องตาราง) ได้หนึ่งใน 41 สีของ LDS `count` แบบเส้นตรงจาก 1 ถึงค่าสูงสุดของตัวกรอง ไม่มีการจัด 5 ชั้นเหลือ; คำอธิบายเป็นแถบไล่สี 41 ช่องพร้อมค่า 1 · กลาง · สูงสุด; ศูนย์ยังเป็น measured_zero; ตัวเลขบนสีได้ contrast ≥ 4.5:1 (ลำดับ 27–29 ผ่านชิป) |

วิธีตรวจของแต่ละข้อ (ชื่อ unit test, ฉาก harness หรือ live) อยู่ใน `implementation-plan.json` (`verification`, `result`)

## วิธีพัฒนาและทดสอบ

```sh
npm start                  # http://127.0.0.1:4173/
npm test                   # 106 unit tests บนข้อมูลจริงและ fixture tile
(cd scripts/host-links && python3 01_production_reference.py && python3 02_grocery_candidates.py && python3 03_verify_master_join.py && python3 04_build_locales.py)  # CAMERA_RESEARCH, CAMERA_WORK
npm run data:build -- --research <CSV dir> --build <CAMERA_WORK> --buildings <CityMETER_Camera_Shops_Venue_Buildings_2026-10-22.geojson> --lux-logos <luxurybrands>
npm run data:provinces -- <provinces.geojson> --commit <sha> --sha256 <hex> --retrieved 2026-10-22
npm run handoff:manifest   # เขียน handoff/handoff-manifest.json จาก bytes จริง
npm run handoff:bundle     # + dist/CityMETER-Camera-Shops-Developer-Handoff.zip
npm run verify:live        # เทียบ SHA-256 ของไฟล์บน GitHub Pages กับ manifest
```

ตรวจ browser ที่ 390 px และ 1280 px ทั้งสองธีม: 3D first Aha (3 Locale, 58%), ดูทุกย่าน, ดูทั้งหมด (กรอบ 64 จังหวัด + legend จังหวัด + ชิป + รายการพับ), เจาะลงจังหวัด (Aha ระดับสถานที่), โปรไฟล์ย่าน (model preset + ลิงก์ Locale), สถานที่ Fortune Town (มุมสถาปนิกที่จุด host, ป้ายชื่อที่ zoom ≥ 14), MBK CENTER (x-ray ของส่วนอาคาร), สถานที่นอก 3 ย่าน (Ayutthaya City Park), สาขาร่วมแบรนด์, สาขา hold, สาขาในสถานที่ที่ master พักไว้ (“พิกัดรอตรวจ”), จังหวัดที่ไม่มีสถานที่มีจุด (ตาก), กรองประเภท “ช่องทางขายเสริม”, ปุ่ม 3D → plan, กราฟสามมุมมอง, ตาราง, help, ไม่พบผล ถ้า CDN/tiles ถูกบล็อกในเครื่องทดสอบ ให้ vendored MapLibre จาก npm, stub TileJSON และ tile สังเคราะห์ตาม OpenMapTiles schema (ใส่ feature id ทุกตัว — ไม่เช่นนั้น MapLibre เตือน `in` expression) ผ่าน request interception แล้วยืนยันรูปจาก tile จริงบน live อีกครั้ง (N02) การอ่าน source ไม่เท่ากับทดสอบ browser จริง

จูนกล้อง/มวลอาคารสดได้จาก console: `__citymeter.applyPreset('eye')`, `__citymeter.fitMap()`, `__citymeter.state.massingResult` ก่อนแก้ค่าคงที่ใน `js/camera.js` / `js/massing.js`

## Release บน GitHub Pages

Repository `https://github.com/montri-th/camera` · branch `main` · Pages ใช้ branch deploy (ไม่มี workflow ใน repo) · Live `https://montri-th.github.io/camera/`

ขั้นตอน: `npm test` → bump `?v=` ใน `index.html` และ `version` ใน `package.json` → สร้าง `assets/manifest.json` ใหม่จาก bytes จริง → commit → `git push origin main` → รอ run `pages-build-deployment` สำเร็จ → `npm run handoff:manifest` บน commit ที่ push → `npm run verify:live` ต้องผ่านทุกไฟล์ → `npm run handoff:bundle` พร้อม `--receipt` และ `--evidence` ห้ามรายงานว่าเผยแพร่แล้วจากผลในเครื่อง cache ของ Pages อยู่ที่ราว 10 นาที จึงใช้ `?v=<release>` บน entry files และ `cache: 'no-store'` ใน verify

คง attribution ของ OpenFreeMap/OpenMapTiles/OpenStreetMap (รวมอาคารที่ตั้งจาก building join ของ master, ODbL 1.0) และ OpenGISData-Thailand (CC BY 4.0) ไม่รวม governed LDS package, research master หรือ raw internal sources ลง repository

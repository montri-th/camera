# CityMETER Camera Shops — Implementation Plan

รุ่นส่งต่อ 0.5.0 · ปรับเอกสาร 22 ตุลาคม 2569 · ข้อมูลตรวจถึง 22 ตุลาคม 2569 · ใช้คู่กับ [PRODUCT_BRIEF.md](PRODUCT_BRIEF.md), [PRODUCT_STATEMENT.md](../PRODUCT_STATEMENT.md) และ [implementation-plan.json](implementation-plan.json)

Camera Shops สร้างบนสถาปัตยกรรมเดียวกับ [CityMETER Luxury Brands 0.5](https://github.com/montri-th/luxurybrands): เมือง 3 มิติที่โฟกัส 3 ย่านอันดับต้นตั้งแต่ภาพแรก, focus + quiet, breadcrumb ประเทศไทย › จังหวัด › ย่าน › สถานที่, venue x-ray, กรอบจังหวัด, pictogram และโลโก้สถานที่ สิ่งที่เปลี่ยนคือ **ข้อมูล** (research master ร้านกล้อง 22 ต.ค. 2569 + host จาก CityMETER production), **หน่วยนับ** (ร้าน = ชื่อร้าน/banner ไม่ซ้ำ, สาขา = จุดขายหนึ่งรายการ; storefront ร่วมแบรนด์เป็นหนึ่งสาขาที่นับทุก banner), **ชั้นย่าน** (Locale จริงของ CityMETER production แทน core ที่นิยามเอง), host สองชนิด (ศูนย์การค้า + ไฮเปอร์มาร์เก็ตจาก CityMETER Grocery), ป้ายชื่อร้านบนหมุดแทนโลโก้ (ยังไม่ได้เก็บโลโก้ร้าน) และ pictogram กล้องสำหรับ “ร้าน” รุ่นนี้ยังแก้สองเรื่องที่พบระหว่างตรวจ: ระดับสถานที่อ่านแถวจาก `scopeRows` (สถานที่นอก 3 ย่านอัตโนมัติไม่เสียรายละเอียด) และการจัดกรอบภาพแรกที่นับ legend พร้อมพื้น zoom 13 บน desktop เป้าหมายของแผนนี้คือให้ developer หรือ coding agent รับช่วงต่อได้โดยไม่ต้องเดาสถานะ และรู้ว่าอะไรคือ display-only กับอะไรคือข้อมูล

## สถาปัตยกรรมที่มีจริง

Static HTML/CSS และ JavaScript ES modules ไม่มี build step ไม่มี framework ไลบรารีภายนอกตอนรันมีตัวเดียวคือ MapLibre GL 5.6.2 จาก URL ที่ pin ไว้ใน `js/vendors.js` (earcut 3.2.4 vendored) บริการภายนอกคือ tile และ glyph ของ OpenFreeMap (`https://tiles.openfreemap.org/planet`, OpenMapTiles schema) `npm start` เสิร์ฟผ่าน Python, `npm test` ใช้ Node test runner (Node ≥ 20) ไม่มี `node_modules` ส่วน build ข้อมูลใช้ Python 3 (mapbox-vector-tile, shapely, Pillow) และ CityMETER production API สาธารณะ — ไม่ใช่ส่วนของหน้าเว็บ

| ไฟล์ | หน้าที่ | ข้อต่อที่ต้องรักษา |
|---|---|---|
| `index.html` | โครงหน้าจอ: header + toolbar (3D, มุมสถาปนิก), map panel + chrome, ถาดกราฟ, ตาราง, แผงอ่านข้อมูล (breadcrumb บนสุด), help dialog, launch overlay | DOM IDs ที่ `app.js`/`navigation.js` ใช้; `?v=20261022-c1` บน entry files; ตัวเลือก cohort `current`/`all`/`review`; ไม่มี CSV/caveat UI |
| `js/launch.js` | boot script, file bridge, loading/slow/error fallback | events `citymeter:ready`, `citymeter:load-error`; public origin `https://montri-th.github.io/camera/` |
| `js/app.js` | state, สามขอบเขตข้อมูล + focus mode, panel modes + back stack, breadcrumb, URL state, map lifecycle, กล้อง, ติดตั้งชั้น spatial | `update()` จุดเดียวที่คำนวณ selection; `detailRows()` ระดับสถานที่ = แถวของสถานที่จาก `scopeRows`; `pitchedPadding()` นับ legend บนจอกว้าง; `CITY_MASSING_ZOOM = 13` เป็นพื้นของ city fit บน desktop |
| `js/model.js` | 5 segments (กลุ่ม A–E ของ research), 4 channels, cohorts, `FORMATS`, `PROVINCES` 77 จังหวัด (รหัส production + DOPA), `bannersOf`/`bannerSegmentsOf`/`brandSet`/`countBrands`/`projectSegment`, `BANNER_LABELS`, ตัวกรองร่วม, summaries | ไม่แก้แถวต้นทาง (segment filter คืนสำเนา); ร้าน กับ สาขา นับแยก; operator ไม่ใช่ banner; รหัสจังหวัดตรง production |
| `js/neighborhoods.js` | point-in-polygon, membership, สรุปย่าน (ร้านผ่าน `countBrands`) | boundary คงที่; shared edge ใช้ priority แล้ว stable ID |
| `js/area-insight.js` | Aha 3 ย่าน และ area-focus filter | ตัวเศษ = union ของ banner ใน 3 ย่าน; ตัวหาร = banner ทั้งหมดในฐานที่กรอง รวมแถวนอก Locale และแถวไม่มีพิกัด |
| `js/chart-model.js` | อันดับ / matrix / exclusive-shared | เทียบทุก assigned areas ก่อนตัด Top-N; ช่อง matrix นับคู่ (สาขา × banner) ตาม segment ของ banner |
| `js/profile-model.js` | โปรไฟล์ย่าน สถานที่ ร้าน, `segmentMixOf`, `describeStatus` (ที่อยู่ติดต่อ, ตัวตนหน้าร้านรอตรวจ, รวมรายการรอตรวจ, ที่ตั้งขัดกัน), `describeGeometry` (จุดตัวแทนศูนย์การค้า/ไฮเปอร์มาร์เก็ต), `rankVenues` | pure; ใช้ `scopeRows` เป็นฐานเทียบ; ไม่ยกระดับความแม่นพิกัด; ร้านริมถนนที่ไม่มีสถานที่ไม่ใช่ “สถานที่” |
| `js/scales.js` | LDS `count` LUT 41 ค่า, class projection, EVID-05 | ห้าม interpolate สีใหม่; HEX เดียวกันสองธีม |
| `js/map-style.js`, `js/massing.js`, `js/mvt.js`, `js/geometry.js`, `js/camera.js`, `js/venue-xray.js` | basemap กระดาษ, มวลอาคารสองชั้น, MVT reader, เรขาคณิต, กล้อง, venue x-ray — **โค้ดเดียวกับ Luxury 0.5** | ลำดับชั้น 3D: city/focus/occluder → host extrusion → venue-xray → `water-name`; ทุก preset pitch ≤ 90° − fov/2 − 3° |
| `js/map-layers.js` | choropleth Locale + outline + selected, focus/quiet, ป้าย ink chip (ย่าน/จังหวัด) | fill ก่อน `waterway`, maxzoom 14.5; ป้ายนับ “ร้าน” |
| `js/pins.js` | หมุดรายสาขา, context pins, ป้ายที่ zoom ≥ 14 ในโฟกัส: โลโก้ banner เมื่อมีทะเบียน ไม่เช่นนั้นป้ายชื่อขนาดตามข้อความ (`textLabelWidth`), keyboard | พิกัดต้นทางไม่เปลี่ยน; ≤ 250 ป้าย; context pins ไม่มีป้ายและไม่อยู่ใน tab order; ป้ายชื่อไม่ใช่โลโก้แทน |
| `js/buildings.js` | อาคารของสถานที่ (`camera-venue-buildings`, `-3d`, `-outline`), coverage, `displayedFeatures()`, `HOST_LAYERS` | สี `map.activeLayer`; ติดตั้งก่อนมวลอาคาร; attribution OSM + Microsoft Global ML Building Footprints |
| `js/provinces.js` | กรอบจังหวัดที่มีสาขา (fill < z9, outline < z12, selected < z13), `buildProvinceModel` | นับจากแถวที่ไม่ใช้ตัวกรองจังหวัด; EVID-05; ไม่ใช่ขอบเขตการปกครองที่ยืนยัน |
| `js/breadcrumb.js` | ประเทศไทย › จังหวัด › ย่าน › สถานที่, `document.title` | ย่าน = Locale ของ production (id = Locale uuid) จาก point-in-polygon; crumb สถานที่ถือ CityMETER host id; ไม่สร้าง Locale นอกกรุงเทพฯ |
| `js/charts.js` | ranking / matrix ช่องเท่ากัน / compare เป็น HTML+SVG | ทุก mark เป็น `<button>`; `SEGMENT_ORDER` มาจาก `SEGMENTS` |
| `js/panel.js` | HTML ของแผงทุกโหมด, `HOST_TYPES` (ประเภท host ภาษาไทย), รายการจังหวัด (10 + `<details>`), Aha ระดับสถานที่เมื่อจังหวัดไม่มี Locale, ลิงก์ “ย่านนี้ใน CityMETER”, ข้อเท็จจริงของสาขา (ร้านร่วม, รูปแบบ, ที่อยู่, ลิงก์) | pure strings; ปุ่มทุกตัวมี `data-action`; ไม่มีคำว่า “แบรนด์” ใน UI |
| `js/brand-logos.js` | ทะเบียนโลโก้ banner (Camera Shops ว่าง, `ALIASES` ว่าง) | ไม่ fuzzy-match; ทะเบียนว่าง = ไม่มีโลโก้ |
| `js/venue-logos.js` | ทะเบียนโลโก้สถานที่: ค้นด้วย host id แล้วชื่อตรงตัว, กล่องพื้นรอง + บทบาท | ไม่ fuzzy; ชื่อสถานที่ยังเป็นตัวตน |
| `js/navigation.js` | nav-7 icons, `PICTOGRAM_CONTRACT` (ร้าน = `photo_camera` U+E412), toolbar titles, help | pictogram แสดงเมื่อฟอนต์โหลด (`pictograms-ready`); nav-7 bytes ไม่เปลี่ยน |
| `styles.css`, `logos.css`, `navigation.css`, `assets/theme.css` | layout, chips (`.pin-brand-label.is-text`, `.pin-name`), mix bars (คอลัมน์ป้าย 132 px), tokens | token-only colours |
| `scripts/build-camera-data.py` | research CSVs + host links ที่ตรวจแล้ว → `data/camera.json`, `data/neighborhoods.geojson` (+ ตรวจ membership กับ `locatePoint`), `data/venue-buildings.geojson`, `data/brand-logos.json`, `data/venue-logos.json` + `assets/venue-logos/` + manifest | ไม่มีเบอร์โทร (`no_phone`), ไม่มี URL ส่วนตัว (`public_https`); พิกัดเฉพาะจุด host; hypermarket อ้าง tile ของ production |
| `scripts/extract-provinces.mjs` | `data/provinces.geojson` เฉพาะจังหวัดที่มีสาขา จาก OpenGISData-Thailand | provenance (commit, sha256, วันที่); ปัด 5 ตำแหน่ง; ตัด ring ที่เหลือ < 4 จุด |
| `scripts/build-pictogram-font.py` | ฟอนต์ pictogram 8 glyph + manifest | byte-reproducible (timestamp จากต้นฉบับ); ตรวจว่า codepoint คือไอคอนตามชื่อ |
| `scripts/build-handoff.mjs`, `scripts/verify-live.mjs` | manifest + ZIP, live byte attestation (`https://montri-th.github.io/camera/`) | hash จาก bytes จริง; ตรวจ live ก่อนอ้างว่าเผยแพร่ |

ถอดออกจากชุด Luxury: `data/luxury.json`, `data/legacy-audit.json`, `assets/brand-logos.svg`, `assets/brand-logos-manifest.json`, `scripts/build-venue-logos.py` (แทนด้วย `build-camera-data.py`)

## ข้อมูลและ pipeline

หน่วยแถว: หนึ่งรายการสาขาของ banner ร้านกล้อง (จุดขาย หรือที่อยู่ติดต่อหนึ่งแห่ง) — 234 สาขา (ค่าเริ่มต้น 233), 43 banner ที่อนุมัติ (39 มีสาขา), 241 ลิงก์ banner ที่นับ, storefront ร่วมแบรนด์ 7 แห่ง, 64 จังหวัด, กรุงเทพฯ 101 แถว

1. ส่งออกทุกแท็บของ research master เป็น CSV (`00_README` … `99_APPROVED_SCOPE`)
2. จับคู่ 144 สถานที่กับ host ของ CityMETER production ด้วย crosswalk ที่ทบทวนแล้ว: 133 สถานที่ → 112 Shopping Center (ลิงก์จากชีต 31 ชื่อ, ชื่อ 70, ที่อยู่ 3, หนึ่งเดียวในจังหวัด 6, alias 2, ชื่อซ้ำ 1) + 20 Grocery hypermarket (ที่อยู่ร้าน 19, หนึ่งเดียวในจังหวัด 1); ทุกจุดอยู่ในจังหวัดของสถานที่ตาม polygon ของ production; 11 สถานที่ยังไม่มี host
3. ถอด Locale ของกรุงเทพฯ ที่มีจุด host จาก `base/mvt/ML` (z15) → 27 ย่าน; membership ตรง `base/locatePoint` 33/33
4. เลือก footprint: ใช้ของ Luxury Brands สำหรับศูนย์ที่ใช้ร่วม (60 features, 29 ศูนย์) ไม่เช่นนั้นอาคาร CityMETER V4 ที่ครอบจุด host (68) หรืออาคาร OSM ชื่อตรงสถานที่ภายใน 150 ม. (8) → 136 features, 105 host, 176 จาก 208 สาขาที่มีพิกัด; 27 host ไม่มี footprint ที่ผ่านเกณฑ์
5. `npm run data:build` → ไฟล์ข้อมูลสาธารณะ; `npm run data:provinces` → กรอบจังหวัด; `npm test` (fixture จาก snapshot จะล้มโดยตั้งใจเมื่อข้อมูลเปลี่ยน)

ขั้น 2–4 อยู่ใน `scripts/host-links/` (`01_production_reference.py` … `05_build_host_buildings.py` พร้อม crosswalk ที่ทบทวนแล้ว `crosswalk_sc.py`, `crosswalk_grocery.py`) ผลิต `venues_resolved.json`, `locales.geojson`, `host_buildings_citymeter.json` ใน `CAMERA_WORK` — 22 ต.ค. 2569 รันซ้ำบน cache เดิมได้ไฟล์เหมือนเดิมทุก byte และ `npm run data:build` ได้ไฟล์สาธารณะเหมือนเดิมทุกไฟล์ (ดู `scripts/host-links/README.md`); ไฟล์ CSV ของ research และไฟล์โลโก้ 7 ไฟล์จาก Drive ยังเป็นข้อมูลทำงานภายใน

## แผนงานและสถานะ

| ID | งานและผลลัพธ์ | สถานะ | หลักฐาน |
|---|---|---|---|
| P01 | Repository บนสถาปัตยกรรม Luxury Brands 0.5; ถอดข้อมูล sprite ไฟล์โลโก้ และ builder ของ Luxury | done | tests geometry/massing/mvt/scales/venue-xray/map-style ผ่านบน repo นี้ |
| P02 | `data/camera.json` จาก research master: หน่วยสาขา, banners, segments, cohorts, holds; ล้างเบอร์โทร; ไม่มี URL ส่วนตัว | done | `scripts/build-camera-data.py`; `tests/model.test.js` |
| P03 | Host crosswalk: 133/144 สถานที่ → 112 ศูนย์การค้า + 20 ไฮเปอร์มาร์เก็ต; พิกัดเป็นจุด host เท่านั้น | done | `centers[]` พร้อม `match`; `tests/profile-model.test.js` (venue ไฮเปอร์มาร์เก็ต) |
| P04 | ย่าน = Locale ของ production 27 แห่ง, id = Locale uuid, ลิงก์หน้า production | done | `metadata.membershipCheck` 33/33; `tests/neighborhoods.test.js` |
| P05 | อาคารของสถานที่: Luxury 60 features (29 ศูนย์) + CityMETER V4 76 features | done | `data/venue-buildings.geojson` metadata; harness venue |
| P06 | กรอบจังหวัด 64 จังหวัด + `PROVINCES` ครบ 77 (รหัส production) | done | `tests/provinces.test.js`, `tests/map-style.test.js`; harness country |
| P07 | โลโก้สถานที่: 30 ไฟล์ (23 จากชุด Luxury, 7 จากไฟล์ Drive ของชีต; sha256 ตรงชีต), 31 จาก 144 ชื่อ, ทะเบียน complete | done | `tests/venue-logos.test.js` |
| P08 | นับ ร้าน/สาขา: storefront ร่วมแบรนด์นับครั้งเดียว, segment projection, mix นับคู่ (สาขา × banner) | done | `tests/model.test.js`, `area-insight`, `chart-model`, `profile-model`, `first-insight` |
| P09 | คำและป้าย: ร้าน / สาขา / สถานที่ / ย่าน; ป้าย segment/channel/cohort/format/host เป็นไทย; ป้ายสถานะ hold | done | `tests/provinces.test.js` (ไม่มี “แบรนด์”); harness |
| P10 | ป้ายชื่อบนหมุดเมื่อไม่มีโลโก้ (`BANNER_LABELS` เช่น Insta360, DJI Experience, FUJIFILM House) | done | `tests/pins.test.js`, `tests/brand-logos.test.js`, `tests/model.test.js` |
| P11 | Pictogram ร้าน = `photo_camera` (1,724 bytes, sha256 `259de66e…`), build ซ้ำได้ | done | `tests/provinces.test.js` (contract ↔ manifest ↔ CSS) |
| P12 | ระดับสถานที่อ่านแถวจาก `scopeRows` | done | harness venue-hypermarket (BigC พระราม 4 นอก 3 ย่าน) |
| P13 | จัดกรอบภาพแรก: padding นับ legend + พื้น zoom 13 บน desktop | done | harness desktop first paint z13 p56 b28 |
| P14 | จังหวัดที่ไม่มี Locale: Aha ย้ายไประดับสถานที่, ไม่มี tile “0 ย่าน” | done | `tests/provinces.test.js`; harness `?province=CMI`, `?province=PKT` |
| P15 | Unit tests บนข้อมูล Camera Shops | done | `npm test` 102/102 |
| P16 | Rendered harness: desktop/mobile × light/dark, a11y, states | done (scoped) | `VERIFICATION.md`; basemap สังเคราะห์ — ยืนยันรูปจาก tile จริงที่ N02 |
| P17 | เอกสารและ machine contracts 0.5.0 (statement, brief, plan, schema 1.4.0, DATA_METHOD, NEIGHBORHOOD_METHOD, README, AGENTS) | done | ajv 8.17.1 (draft 2020-12) ก่อน release commit |
| P18 | Release 0.5.0: `assets/manifest.json` จาก bytes จริง, `?v=20261022-c1`, push `montri-th/camera` main, Pages branch deploy | pending | run `pages-build-deployment` |
| P19 | Live attestation + bundle (manifest บน commit ที่ push, `verify:live`, bundle พร้อม receipt/evidence) | pending | `RELEASE_RECEIPT.json` |
| P20 | Resilience จาก Luxury (launch overlay, file bridge, vendor retry) | retained, source-checked | file: ไปที่ `https://montri-th.github.io/camera/`; ไม่ได้ทำ fault injection ซ้ำ |

## งานถัดไปที่แนะนำ (backlog สำหรับ vibe coding)

| ID | งาน | เจ้าของ/สถานะ |
|---|---|---|
| N01 | ย้าย harness (Playwright + vendored MapLibre + stub TileJSON + tile สังเคราะห์) เข้า CI พร้อม fault injection และ `file:` (AC02/AC03/AC05) | frontend |
| N02 | ตรวจ live ด้วย tile จริง (container เข้าถึง OpenFreeMap ไม่ได้): ภาพแรก 3D, x-ray ที่ Fortune Town, มุมมองประเทศ, ธีมมืด, 390 px | QA / owner — หลัง publish |
| N03 | เก็บโลโก้ร้าน (คอลัมน์ logo ของ `01_BRANDS` ว่าง; `data/brand-logos.json` = `not_collected`); หมุดจะแสดงโลโก้แทนป้ายชื่อผ่านทะเบียนเดิม | data owner + frontend |
| N04 | ตรวจตัวตนลิงก์แผนที่ทางการ 143 ลิงก์ แล้วหาพิกัดของร้านริมถนน 15 ร้าน — ไม่เอาพิกัดจากลิงก์ที่ยังไม่ตรวจ | data/field |
| N05 | หา host ให้ 11 สถานที่: Lit Bangkok Hotel, Maneeya Center North, Panasiri Resident, The Rich Biz Home, แพชชั่น ระยอง, แจ่มฟ้าช้อปปิ้งมอลล์, Ayutthaya Park, ไอที พลาซ่า สำโรง, เม-ญ่า ไลฟ์สไตล์ เชียงใหม่, เจียง-ฟิวเจอร์ หนองคาย, ไชยแสง สิงห์บุรี | data owner + CityMETER platform |
| N06 | ตรวจภาคสนาม 9 แถว hold: คู่ DJI Experience Store / Phantom Thailand 6 แถว (centralwOrld, Central Hat Yai, Megabangna), BIG CAMERA เดอะมอลล์บางแค (รวมห้องเดียวกัน), UNIT CAMERA SHOP สยาม (Lido Connect กับ Siam Square ซอย 2), World Camera บรมราชชนนี (ที่อยู่ติดต่อ) | field research |
| N07 | ทบทวน `03_BRANCH_REVIEW` 72 แถว (dealer เดิมของ WORLD CAMERA 42 แถว) และชื่อใน review queue 7 ชื่อ ก่อนเข้าชุดข้อมูล | data research |
| N08 | หาสาขาของ banner ที่อนุมัติแต่ยังไม่มีสาขา 4 ชื่อ (Pixpros House, Naituanoi Store, BaNANA, Studio7) หรือถอดออกจาก scope | data owner |
| N09 | ระดับย่านนอกกรุงเทพฯ: production มี Locale เฉพาะกรุงเทพฯ — ลงทะเบียน Locale หรือใช้ระดับเทศบาล (`/M/{dopa code}`) สำหรับเชียงใหม่ พัทยา หาดใหญ่ ขอนแก่น ภูเก็ต | platform + data owner (ตัดสินใจ) |
| N10 | แทนกรอบ OpenGISData-Thailand ด้วยขอบเขตจังหวัดของ production และต่อการกดเข้ากับ route ของ production (เหมือน Luxury N13) | platform + data owner (ตัดสินใจ) |
| N11 | footprint ให้ 27 host ที่ยังไม่มี (ศูนย์ 15, ไฮเปอร์มาร์เก็ต 12); ตรวจว่าอาคาร OSM “Fortune Town” (1,580 ตร.ม., ห่างจุด host 43 ม.) คือทั้งโครงการหรือเพียงส่วนหนึ่ง | data research |
| N12 | Backport ไป Luxury Brands: ระดับสถานที่อ่านแถวจาก `scopeRows` (Luxury 0.5 ใช้ `state.rows` ทำให้สถานที่นอก 3 ย่านอัตโนมัติไม่มีอาคารสีน้ำเงินและหมุดสี) และ padding นับ legend + พื้น zoom 13 | frontend (repo luxurybrands) |
| N13 | ~~commit crosswalk ที่ทบทวนแล้วและ builder ต้นน้ำ~~ — ทำแล้วใน 0.5.0: `scripts/host-links/` (ทำซ้ำได้ byte-for-byte จาก cache); ที่เหลือ: ทำ candidate review ของ Shopping Center (ค้นชื่อในจังหวัด) ให้เป็นสคริปต์ด้วย | data engineer |
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
| AC06 | ตัวกรอง/ย่าน/focus/ล้าง | pins/counters/table ใช้ `rows`; Aha/choropleth/charts ใช้ `scopeRows`; cohort `current` (ค่าเริ่มต้น) / `all` / `review`; URL คืนสถานะได้ |
| AC07 | สาขาหลายรายการที่จุด host เดียว | ทุกสาขามีหมุด (Fortune Town 17 สาขา); slot ใกล้ anchor; พิกัดไม่เปลี่ยน |
| AC08 | ป้ายหนาแน่น | ≤ 250 (โลโก้เมื่อมีทะเบียน ไม่เช่นนั้นป้ายชื่อ), ต่าง banner ก่อน, ไม่มีป้ายต่ำกว่า zoom 14 หรือบน context pins |
| AC09 | desktop/mobile, light/dark | header 48 px; แผง/sheet ตามสัญญา; ไม่มี horizontal overflow ที่ 390 px; basemap ที่สร้างเองทั้งสองธีม |
| AC10 | คีย์บอร์ด/reduced motion | Tab เข้าชั้นหมุด, ลูกศรเลื่อน, Enter เปิดสาขา; context pins ไม่อยู่ใน tab order |
| AC11 | ข้อความ dynamic | ไม่มี caveat/research/CSV; แถว hold มีป้ายสถานะของตัวเอง; missing ไม่แสดงเป็น 0 |
| AC12 | release/handoff | commit, live bytes, manifest, bundle ตรงกัน; ไม่มี private URL, secrets หรือเบอร์โทรในไฟล์ที่เผยแพร่ |
| AC13 | focus + quiet | ย่านนอก focus เป็นเส้นขอบบาง ป้ายจาง สาขานอก focus เป็นจุดเทาไม่มีป้าย มวลอาคารเมืองโทนเงียบ |
| AC14 | choropleth | ระดับสีตรง legend และกราฟอันดับ; ค่าคือ “ร้านไม่ซ้ำต่อย่าน”; measured zero มีเส้นขอบศูนย์; HEX เดียวกันสองธีม |
| AC15 | 3D first Aha | preset `city` (pitch 56, bearing 28) ที่รัชดา-ตะวันตก · สยาม · ราชประสงค์; desktop ไม่ต่ำกว่า z13 (มีมวลอาคาร) โดย padding นับ legend; แผง: 61% = 23 จาก 38 ร้าน · 39 จาก 233 สาขา (fixture ของ snapshot) + ดูทุกย่าน + เปรียบเทียบย่าน |
| AC16 | basemap ที่สร้างเอง | `buildMapStyle` + `--basemap-*` เท่านั้น; data fill ก่อน `waterway`; massing ก่อน `water-name`; เปลี่ยนธีมแล้วติดตั้งชั้นใหม่ |
| AC17 | มวลอาคารโฟกัสมุมโค้ง | ล้อมจุดยอดต้นฉบับทุกจุด; twin ของอาคารที่ตั้งถูกซ่อน |
| AC18 | กล้อง | `model` FOV 14 ในย่าน; ระดับสถานที่ `eye` (pitch 75 / FOV 24) เป็นค่าเริ่มต้น จัดกรอบที่ footprint (หรือจุด host เมื่อไม่มี); `?cam=model`; `plan` เมื่อปิด 3D |
| AC19 | breadcrumb | ย่าน = Locale ของ production จาก point-in-polygon; crumb สถานที่ถือ host id (Shopping Center หรือ Grocery); `province` = รหัส production; ร้านไม่เป็น crumb; จอแคบพับเป็น “…” |
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
| AC30 | Locale เป็นย่าน | id = Locale uuid ของ production; membership 33/33 ตรง `locatePoint`; ลิงก์ “ย่านนี้ใน CityMETER” → `/v3/citymeter/BKK/L/{uuid}?d=shoppingCenter` |
| AC31 | สถานที่ไฮเปอร์มาร์เก็ต | `?place=<Grocery id>` (BigC พระราม 4): ประเภท ไฮเปอร์มาร์เก็ต, crumbs … › ตลาดคลองเตย › BigC พระราม 4, หมุดยังมีรายละเอียด, ไม่มีลิงก์ Shopping Center |
| AC32 | จังหวัดที่ไม่มี Locale | Aha “{share}% ของร้านกล้องมีสาขาที่ {สถานที่นำ}” พร้อมตัวเศษตัวหาร (เชียงใหม่ 80% = 4 จาก 5 ร้านที่ Central Chiangmai), ปุ่ม ดูสถานที่นี้ / ดูสาขา, ไม่มี tile “0 ย่าน” |
| AC33 | ความสะอาดของข้อมูลสาธารณะ | ไม่มีเบอร์โทร (แทนด้วย `[เบอร์โทรไม่เผยแพร่]`); ไม่มี URL Drive/Google ส่วนตัว; ลิงก์แผนที่ทางการเป็นลิงก์เท่านั้น ไม่ใช่พิกัด |
| AC34 | ป้ายชื่อ | zoom ≥ 14 หมุดในโฟกัสที่ไม่มีโลโก้ได้ป้ายชื่อขนาดตามข้อความ (≤ 18 ตัวอักษร); ไม่ขึ้นบนจุดบริบท; ไม่อ้างว่าเป็นโลโก้; บรรทัดสถานะนับเป็น “ป้ายชื่อ” |
| AC35 | สาขาไม่มีพิกัด | 26 สาขา (ร้านริมถนน 15, สถานที่ยังไม่มี host 11) อยู่ในจำนวน ตาราง ยอดจังหวัด และตัวหารของ Aha; ไม่มีหมุดและไม่มีย่าน; ร้านริมถนนไม่เป็นกลุ่มสถานที่ ส่วนสาขาที่สถานที่ไม่มี host คงชื่อสถานที่ไว้ |

วิธีตรวจของแต่ละข้อ (ชื่อ unit test, ฉาก harness หรือ live) อยู่ใน `implementation-plan.json` (`verification`, `result`)

## วิธีพัฒนาและทดสอบ

```sh
npm start                  # http://127.0.0.1:4173/
npm test                   # 102 unit tests บนข้อมูลจริงและ fixture tile
npm run data:build -- --research <CSV dir> --build <host-link dir> --lux-buildings <luxurybrands>/data/venue-buildings.geojson --lux-logos <luxurybrands>
npm run data:provinces -- <provinces.geojson> --commit <sha> --sha256 <hex> --retrieved 2026-10-22
npm run handoff:manifest   # เขียน handoff/handoff-manifest.json จาก bytes จริง
npm run handoff:bundle     # + dist/CityMETER-Camera-Shops-Developer-Handoff.zip
npm run verify:live        # เทียบ SHA-256 ของไฟล์บน GitHub Pages กับ manifest
```

ตรวจ browser ที่ 390 px และ 1280 px ทั้งสองธีม: 3D first Aha (3 Locale, 61%), ดูทุกย่าน, ดูทั้งหมด (กรอบ 64 จังหวัด + legend จังหวัด + ชิป + รายการพับ), เจาะลงจังหวัด (Aha ระดับสถานที่), โปรไฟล์ย่าน (model preset + ลิงก์ Locale), สถานที่ Fortune Town (มุมสถาปนิก, x-ray, ป้ายชื่อที่ zoom ≥ 14), สถานที่ไฮเปอร์มาร์เก็ต, สาขาร่วมแบรนด์, สาขา hold, กรองประเภท “ช่องทางขายเสริม”, ปุ่ม 3D → plan, กราฟสามมุมมอง, ตาราง, help, ไม่พบผล ถ้า CDN/tiles ถูกบล็อกในเครื่องทดสอบ ให้ vendored MapLibre จาก npm, stub TileJSON และ tile สังเคราะห์ตาม OpenMapTiles schema (ใส่ feature id ทุกตัว — ไม่เช่นนั้น MapLibre เตือน `in` expression) ผ่าน request interception แล้วยืนยันรูปจาก tile จริงบน live อีกครั้ง (N02) การอ่าน source ไม่เท่ากับทดสอบ browser จริง

จูนกล้อง/มวลอาคารสดได้จาก console: `__citymeter.applyPreset('eye')`, `__citymeter.fitMap()`, `__citymeter.state.massingResult` ก่อนแก้ค่าคงที่ใน `js/camera.js` / `js/massing.js`

## Release บน GitHub Pages

Repository `https://github.com/montri-th/camera` · branch `main` · Pages ใช้ branch deploy (ไม่มี workflow ใน repo) · Live `https://montri-th.github.io/camera/`

ขั้นตอน: `npm test` → bump `?v=` ใน `index.html` และ `version` ใน `package.json` → สร้าง `assets/manifest.json` ใหม่จาก bytes จริง → commit → `git push origin main` → รอ run `pages-build-deployment` สำเร็จ → `npm run handoff:manifest` บน commit ที่ push → `npm run verify:live` ต้องผ่านทุกไฟล์ → `npm run handoff:bundle` พร้อม `--receipt` และ `--evidence` ห้ามรายงานว่าเผยแพร่แล้วจากผลในเครื่อง cache ของ Pages อยู่ที่ราว 10 นาที จึงใช้ `?v=<release>` บน entry files และ `cache: 'no-store'` ใน verify

คง attribution ของ OpenFreeMap/OpenMapTiles/OpenStreetMap, Microsoft Global ML Building Footprints และ OpenGISData-Thailand (CC BY 4.0) ไม่รวม governed LDS package, research master หรือ raw internal sources ลง repository

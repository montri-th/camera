# CityMETER: Camera Shops Thailand

**Live demo: [montri-th.github.io/camera](https://montri-th.github.io/camera/)** · [Source repository](https://github.com/montri-th/camera) · ผลิตภัณฑ์คู่กัน: [CityMETER: Luxury Brands](https://montri-th.github.io/luxurybrands/)

ถ้าจะเปิดร้านกล้องที่นี่ จะอยู่ข้างใคร: เห็นก่อนว่าร้านกล้องในไทย (ร้านหลายแบรนด์ มือสองและฟิล์ม ร้านแบรนด์ผู้ผลิต โดรนและอุปกรณ์ภาพ และช่องทางขายเสริม) กระจุกอยู่ย่านใด ในภาพเมือง 3 มิติที่โฟกัส 3 ย่านอันดับต้นทันที แล้วเจาะลงถึงสถานที่ อาคาร และหมุดรายสาขาพร้อมหลักฐานรายรายการ รุ่น **0.5.0** (22 ต.ค. 2569) สร้างด้วยสถาปัตยกรรมเดียวกับ Luxury Brands 0.5: Aha แรกแบบ 3 มิติ focus + quiet, breadcrumb ตาม CityMETER production, venue x-ray, กรอบจังหวัด, pictogram และโลโก้สถานที่

**Research snapshot: 22 Oct 2026 · Record grain: one outlet (สาขา) of a shop banner (ร้าน) · Artifact status: public research demo, not production.**

## ตัวเลขของ snapshot นี้

- **234 สาขา** จาก research master: ค่าเริ่มต้นแสดง **233 สาขาขายปลีก** (อีก 1 แถวเป็นที่อยู่ติดต่อของ World Camera ตามเว็บไซต์ ไม่ใช่หน้าร้าน) ใน **64 จังหวัด** กรุงเทพฯ 101 แถว
- **ร้าน = ชื่อร้าน (shop banner) ไม่ซ้ำ** ไม่ใช่ยี่ห้อกล้อง: อนุมัติ 43 ชื่อ มีสาขาที่ระบุได้ 39 ชื่อ (38 ในค่าเริ่มต้น) — BIG CAMERA 142 สาขา, DJI Experience Store 17, ZoomCamera 11, EC-MALL 8, FOTOFILE 7, Sony Store 6 …
- หน้าร้านร่วมแบรนด์นับเป็น **1 สาขา** ที่มีหลายร้าน (เช่น BIG CAMERA ในเคาน์เตอร์ Power Mall 5 จุด, DJI | Hasselblad Siam Paragon, Insta360 Experience Store by BIG Camera) — 241 การเชื่อมร้าน–สาขา; ผู้ดำเนินการ (operator) ไม่นับเป็นร้านเพิ่ม
- พิกัด **208/234** แถวเป็นจุดตัวแทนของสถานที่จาก CityMETER production (ไม่ใช่ประตูร้าน): ศูนย์การค้า 112 แห่ง (Shopping Center) และไฮเปอร์มาร์เก็ต 20 แห่ง (Grocery) — 133 จาก 144 สถานที่จับคู่ได้; อีก 26 แถวยังไม่มีพิกัด (ร้านริมถนน/อาคาร 15 แถวที่ไม่มีสถานที่ host — ไม่ geocode และไม่อ่านพิกัดจากลิงก์แผนที่ที่ยังไม่ตรวจตัวตน — และ 11 สถานที่ที่ยังไม่มีคู่ใน CityMETER) ยังอยู่ในตารางและตัวหาร
- **ข้อค้นพบแรก (snapshot):** 61% ของร้านกล้อง (23 จาก 38 ร้าน) มีสาขาใน 3 ย่าน — รัชดา-ตะวันตก (Fortune Town, 13 ร้าน · 17 สาขา, 9 ร้านพบที่นี่ที่เดียว), สยาม (9 · 12) และราชประสงค์ (8 · 10) — ทั้งที่เป็นเพียง 39 จาก 233 สาขา ตัวเลขบนหน้าจอคำนวณจากข้อมูลทุกครั้ง ค่าใน handoff เป็น fixture ไม่ใช่ค่าคงที่ของ UI

อ่าน metadata ล่าสุดจาก [data/camera.json](data/camera.json) และจำนวนตามตัวกรองบนหน้าจอ รายการเป็น “พบในแหล่งข้อมูล” (official locator / website) ยังไม่ได้ตรวจภาคสนาม

## ใช้งาน

```sh
npm start
```

เปิด <http://127.0.0.1:4173> เพื่อพัฒนาในเครื่อง; เปิดไฟล์ index.html โดยตรงจะนำไปยังเว็บสาธารณะด้านบน ไม่ต้อง build หรือติดตั้ง dependencies (Node ≥ 20 สำหรับ tests/scripts, Python 3 สำหรับ server) แผนที่ใช้เครือข่ายเพื่อโหลด MapLibre GL 5.6.2 และ OpenFreeMap vector tiles ส่วนกราฟวาดด้วย HTML/SVG ภายในโปรเจกต์

```sh
npm test
```

ชุดทดสอบ 102 ข้อ: การนับร้านแยกจากสาขา หน้าร้านร่วมแบรนด์ การกรองประเภทร้านแบบ projection (นับเฉพาะร้านของประเภทนั้น ไม่แก้แถวต้นทาง) ย่าน = Locale ของ CityMETER (id และ membership ตรง production) Aha แรก 3 ย่าน โปรไฟล์ย่าน/สถานที่/ร้าน (รวมไฮเปอร์มาร์เก็ต) ป้ายชื่อร้านบนหมุด กรอบจังหวัด 64 จังหวัด breadcrumb รหัสจังหวัด production 77 จังหวัด pictogram ทะเบียนโลโก้สถานที่ (sha256) ทะเบียนโลโก้ร้านที่ว่างอย่างชัดแจ้ง และชุดทดสอบเดิมของ 0.5 (pins, massing, x-ray, scales, mvt, geometry) ส่วนพฤติกรรมบนจอตรวจด้วย harness และเว็บจริงแยกต่างหาก (ดู `handoff/VERIFICATION.md`) สคริปต์ `npm run handoff:manifest`, `npm run handoff:bundle` และ `npm run verify:live` สร้าง manifest/bundle และเทียบ hash กับไฟล์บนเว็บจริง

สร้างข้อมูลใหม่ (ต้องมีไฟล์ทำงานภายในที่ไม่อยู่ใน repository: CSV ของแต่ละแท็บใน research master และผลจับคู่สถานที่กับ CityMETER):

```sh
npm run data:build -- --research <tab CSVs> --build <host links> --lux-buildings <luxurybrands>/data/venue-buildings.geojson --lux-logos <luxurybrands>
npm run data:provinces -- <OpenGISData provinces.geojson> --commit <sha> --sha256 <hex> --retrieved 2026-10-22
```

## สิ่งที่สำรวจได้

- **3D ก่อน ย่านก่อน:** หน้าแรกเปิดเป็นเมือง 3 มิติ (pitch 56°) ที่โฟกัส 3 ย่านอันดับต้นโดยอัตโนมัติ แผงอ่านข้อมูลเปิดด้วยสัดส่วนร้านที่มีสาขาใน 3 ย่านนั้น พร้อมอันดับย่าน และแผนที่ระบายสีย่านตามจำนวนร้านไม่ซ้ำด้วย LDS `count` family “ดูทุกย่าน” ยกเลิกโฟกัสอัตโนมัติ (`?areas=all`) “3D” สลับเป็นแผนผัง 2 มิติ
- **ย่าน = Locale ของ CityMETER production:** 27 Locale ในกรุงเทพฯ ที่มีสถานที่ของร้านกล้อง id ของย่านคือ uuid ของ Locale เดียวกับหน้า `/v3/citymeter/BKK/L/{uuid}` (ลิงก์ “ย่านนี้ใน CityMETER” ในโปรไฟล์ย่าน) และการจับจุดเข้าย่านตรงกับ `base/locatePoint` ของ production 33/33 จุด นอกกรุงเทพฯ production ยังไม่มี Locale แผงจึงเลื่อนข้อค้นพบไปที่ระดับสถานที่ (เช่น เชียงใหม่: 80% ของร้านกล้องมีสาขาที่ Central Chiangmai)
- **focus + quiet:** เฉพาะส่วนที่โฟกัสมีสี หมุดสีประเภท ป้ายชื่อร้าน อาคารที่ตั้ง และมวลอาคารมุมโค้ง ส่วนอื่นเหลือเส้นขอบบาง จุดบริบทสีเทา และมวลอาคารโทนเงียบ
- **ระดับสถานที่เป็นโฟกัสของตัวเอง:** เปิดศูนย์การค้าหรือไฮเปอร์มาร์เก็ตใด เฉพาะสาขาของที่นั้นมีรายละเอียด (แม้อยู่นอก 3 ย่านที่โฟกัส) อาคารของสถานที่เป็นสีน้ำเงินและมองเห็น/กดได้เสมอ (venue x-ray) มุมสถาปนิก (pitch 75 / FOV 24) เปิดอัตโนมัติ
- **ป้ายชื่อร้าน:** ยังไม่ได้รวบรวมโลโก้ร้าน หมุดที่ซูม ≥ 14 จึงแสดงชื่อร้านเป็นป้ายข้อความ (ชื่อยาวใช้คำต้นของชื่อหรือ alias ใน research เช่น FUJIFILM House, Leica Store) ไม่ใช่โลโก้ทดแทน ไม่เกิน 250 ป้าย และไม่ทับหมุดอื่น
- **breadcrumb:** ประเทศไทย › จังหวัด › ย่าน › สถานที่ ด้วยรหัสจังหวัดของ production (BKK, CMI, NST …) และ id ของสถานที่จาก CityMETER (Shopping Center หรือ Grocery) URL: `?province=BKK&neighborhood=<locale uuid>&place=<host id>`
- **กรอบจังหวัด:** ซูมออกทั้งประเทศ จังหวัดที่มีร้านกล้อง 64 จังหวัดมีกรอบ สีตามจำนวนร้าน ป้าย และรายการในแผง (10 อันดับแรก ที่เหลือพับไว้) กดเพื่อเจาะลงจังหวัด
- **สถานที่และร้าน:** ประเภทสถานที่ตาม CityMETER, GLA ที่รายงาน, ประเภทร้าน (ร้าน/สาขา), รายการสาขา; รายละเอียดสาขาแสดงร้านที่ร่วมหน้าร้าน สถานะ (รวมสถานะรอตรวจ: ตัวตนหน้าร้าน รวมรายการ ที่ตั้งขัดกัน ที่อยู่ติดต่อ) รูปแบบร้าน ที่อยู่ พิกัดและระดับความแม่น วันที่ตรวจ และลิงก์หลักฐาน/พิกัด/แผนที่ของร้าน
- กราฟสามมุมมอง (อันดับย่าน · ตารางย่าน × ประเภทร้าน · ร้านเฉพาะ/ร่วม) วาดด้วย HTML/SVG ทุกแท่งและช่องเป็นปุ่มจริง
- หนึ่งหมุดต่อหนึ่งสาขา ไม่รวมหมุด; missing ไม่แสดงเป็น 0; ไม่มีปุ่มดาวน์โหลด CSV

โครงสร้างหน้าจอยึด [CityMETER Shopping Center production](https://landometer.com/v3/citymeter?d=shoppingCenter): header 48 px แผนที่เต็มพื้นที่ แผงขวา และถาดกราฟด้านล่างที่ย่อได้; มือถือแนวตั้งใช้ bottom sheet

basemap สร้างเองใน `js/map-style.js` บน [OpenFreeMap](https://openfreemap.org/) vector tiles (OpenMapTiles schema, ข้อมูล OpenStreetMap) ด้วยสี `--basemap-*` ใน `assets/theme.css` โดยคง attribution ของ OpenFreeMap, OpenMapTiles และ OpenStreetMap

## Data and method

อ่าน [Product statement](PRODUCT_STATEMENT.md), [DATA_METHOD.md](DATA_METHOD.md) และ [วิธีใช้ Locale เป็นย่าน](docs/NEIGHBORHOOD_METHOD.md) ก่อนตีความผล จำนวนร้านในข้อมูลไม่ใช่ส่วนแบ่งตลาด ยอดขาย สต็อก หรือความครบถ้วนของตลาดกล้องไทย

- Research master: “CityMETER Camera Shops Thailand — Research Master 2026-10-22” (Google Sheets; internal working reference — public demo data: [data/camera.json](data/camera.json); ไม่มีเบอร์โทรหรือลิงก์ Drive ในไฟล์สาธารณะ)
- [CityMETER Shopping Center](https://landometer.com/v3/citymeter?d=shoppingCenter), CityMETER Grocery, Locale และ building (public production API) — จุดตัวแทนสถานที่ ย่าน และ footprint อาคาร
- ขอบเขตจังหวัด: [OpenGISData-Thailand](https://github.com/chingchai/OpenGISData-Thailand) (CC BY 4.0, อ้างอิงกรมการปกครอง)

## Assets and verification

ใช้ LDS **0.9.7 / v0.9.7-owner.1** (standalone-0.9.7-r1, color-srgb-10) เหมือน Luxury Brands: foundation pairs, semantic states, map roles, data states, categorical series ใน [assets/theme.css](assets/theme.css) และ LUT ของ `count` family ใน [js/scales.js](js/scales.js) pictogram ใช้ชุดย่อย Material Symbols Rounded 8 รูป (ร้าน = `photo_camera`) ไฟล์ asset บันทึก byte length และ SHA-256 ใน [assets/manifest.json](assets/manifest.json) และทุกไฟล์ของ repository บันทึกใน `handoff/handoff-manifest.json` (สร้างตอนออกรุ่น) ผลตรวจ hash ไม่ใช่การรับรองว่าผ่านการตรวจ UI หรือ production

โลโก้สถานที่ 30 ไฟล์ (31 ชื่อสถานที่) มาจากแท็บ `10_VENUE_LOGOS` ของ research master — เป็นไฟล์ชุดเดียวกับ Luxury Brands ตรวจ sha256 ตามชีตทุกไฟล์ ดู [manifest](assets/venue-logos-manifest.json) เครื่องหมายเป็นของเจ้าของ การแสดงเพื่อระบุสถานที่ไม่ใช่ใบอนุญาต footprint อาคาร: © OpenStreetMap contributors (ODbL) และ Microsoft Global ML Building Footprints (ODbL) ผ่าน CityMETER

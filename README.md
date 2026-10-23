# CityMETER: Camera Shops Thailand

**Live demo: [montri-th.github.io/camera](https://montri-th.github.io/camera/)** · [Source repository](https://github.com/montri-th/camera) · ผลิตภัณฑ์คู่กัน: [CityMETER: Luxury Brands](https://montri-th.github.io/luxurybrands/)

ถ้าจะเปิดร้านกล้องที่นี่ จะอยู่ข้างใคร: เห็นก่อนว่าร้านกล้องในไทย (ร้านหลายแบรนด์ มือสองและฟิล์ม ร้านแบรนด์ผู้ผลิต โดรนและอุปกรณ์ภาพ และช่องทางขายเสริม) กระจุกอยู่ย่านใด ในภาพเมือง 3 มิติที่โฟกัส 3 ย่านอันดับต้นทันที แล้วเจาะลงถึงสถานที่ อาคาร และหมุดรายสาขาพร้อมหลักฐานรายรายการ รุ่นข้อมูล **0.5.1** (23 ต.ค. 2569) ปรับรายสาขา พิกัด และคลังโลโก้ต่อจาก 0.5.0 โดยคงสถาปัตยกรรมเดียวกับ Luxury Brands 0.5: Aha แรกแบบ 3 มิติ focus + quiet, breadcrumb ตาม CityMETER production, venue x-ray, กรอบจังหวัด, pictogram และโลโก้สถานที่

**Research snapshot: 23 Oct 2026 · Record grain: one outlet (สาขา) of a shop banner (ร้าน) · Artifact status: public research demo, not production.**

## ตัวเลขของ snapshot นี้

- **253 สาขา** จาก research master: ค่าเริ่มต้นแสดง **252 สาขาขายปลีก** อีก 1 แถวเป็นที่อยู่ติดต่อของ World Camera ใน **64 จังหวัด** กรุงเทพฯ 110 แถว (109 ในค่าเริ่มต้น)
- **ร้าน = ชื่อร้าน (shop banner) ไม่ซ้ำ** ไม่ใช่ยี่ห้อกล้อง: อนุมัติ **44 ชื่อ** มีแถวสาขา/ที่ติดต่อ **40 ชื่อ** และ **39 ชื่อในค่าเริ่มต้นขายปลีก** การอนุมัติขอบเขตไม่เท่ากับมีสาขาที่ผ่านเกณฑ์ครบทุกชื่อ — BIG CAMERA 143 สาขารวมหน้าร้านร่วม, Power Buy 18, DJI Experience Store 17, ZoomCamera 11, EC-MALL 8, FOTOFILE 7, Sony Store 6
- หน้าร้านร่วมแบรนด์นับเป็น **1 สาขา** ที่มีหลายร้าน — **260 การเชื่อมป้ายร้าน–สาขา** ใน public data; native master มี 261 การเชื่อมรวม operator 1 รายการซึ่งไม่นับเป็นป้ายร้าน
- มีพิกัดที่เลือกใช้ **236/253 แถว** อีก **17 แถว** ไม่มีพิกัด: แยกจุดธุรกิจจากแหล่งร้าน จุดที่ร้านเผยแพร่ และจุดอ้างอิง host ตาม `geometryRole` การมีจุดไม่สร้าง venue/building join อัตโนมัติ ไม่มีจุดใดยืนยันทางเข้า ชั้น หรือรูปทรงหน้าร้าน
- อาคารที่ผ่านการเชื่อมเป็นบริบทของ **129 สาขา**: จุดอยู่ใน footprint **125** และ **4** เป็น named-host context ที่จุดอยู่นอก polygon; เก็บรูปทรงต้นฉบับ **103 features = 69 footprints + 34 parts** โดยไม่หาอาคารเพิ่ม ข้อค้นพบและตัวหารบนหน้าจอคำนวณจากข้อมูลปัจจุบัน ไม่ใช้ตัวเลข fixture ของ 0.5.0 เป็นค่าคงที่

เกณฑ์ช่องทางขายเสริมรับเฉพาะสาขาที่มีหลักฐานขายกล้องตรงสาขา; catalog ของเครือหรือ stock-response ว่างไม่ทำให้ทั้งเครือผ่านเกณฑ์ คิวเครือข่าย 1,411 รายการอยู่ในงานวิจัยภายในและไม่นับใน public data

อ่าน metadata ล่าสุดจาก [data/camera.json](data/camera.json) และจำนวนตามตัวกรองบนหน้าจอ รายการเป็น “พบในแหล่งข้อมูล” (official locator / website) ยังไม่ได้ตรวจภาคสนาม

## ใช้งาน

```sh
npm start
```

เปิด <http://127.0.0.1:4173> เพื่อพัฒนาในเครื่อง; เปิดไฟล์ index.html โดยตรงจะนำไปยังเว็บสาธารณะด้านบน ไม่ต้อง build หรือติดตั้ง dependencies (Node ≥ 20 สำหรับ tests/scripts, Python 3 สำหรับ server) แผนที่ใช้เครือข่ายเพื่อโหลด MapLibre GL 5.6.2 และ OpenFreeMap vector tiles ส่วนกราฟวาดด้วย HTML/SVG ภายในโปรเจกต์

```sh
npm test
```

ชุดทดสอบครอบคลุมหน่วยร้าน/สาขา หน้าร้านร่วม ตัวกรอง ย่านและจังหวัด แผนที่ รูปทรง โลโก้ และสัญญาข้อมูล ผลทดสอบของ 0.5.0 เป็นหลักฐานประวัติ ส่วนผล refresh และการตรวจ live ของ 0.5.1 ต้องอ่านแยกใน `handoff/VERIFICATION.md` และ release receipt สคริปต์ `npm run handoff:manifest`, `npm run handoff:bundle` และ `npm run verify:live` สร้าง manifest/bundle และเทียบไฟล์กับเว็บจริง

สร้างข้อมูล refresh จาก normalized master และ manifest ไฟล์จริง (inputs/cache ต้องอยู่นอก repository สาธารณะ; ต้องมี Pillow, shapely และ mapbox-vector-tile):

```sh
python3 scripts/refresh-camera-master.py --master <delivery-records.json> --logos <complete-logo-library-manifest.json> --cache <private-work-dir>
```

`scripts/refresh-camera-master.py` เป็น adapter ปัจจุบัน; pipeline `scripts/host-links/` และ `scripts/build-camera-data.py` เก็บไว้ทำซ้ำ snapshot 0.5.0 ซึ่งใช้ host-only coordinates ห้ามใช้กฎเดิมบังคับจุดธุรกิจใหม่ให้เท่ากับจุด venue

## สิ่งที่สำรวจได้

- **3D ก่อน ย่านก่อน:** หน้าแรกเปิดเป็นเมือง 3 มิติ (pitch 56°) ที่โฟกัส 3 ย่านอันดับต้นโดยอัตโนมัติ แผงอ่านข้อมูลเปิดด้วยสัดส่วนร้านที่มีสาขาใน 3 ย่านนั้น พร้อมอันดับย่าน และแผนที่ระบายสีย่านตามจำนวนร้านไม่ซ้ำด้วย LDS `count` family ครบ 41 ระดับ (ไล่สีเส้นตรงจาก 1 ถึงค่าสูงสุด) “ดูทุกย่าน” ยกเลิกโฟกัสอัตโนมัติ (`?areas=all`) “3D” สลับเป็นแผนผัง 2 มิติ
- **ย่าน = Locale ของ CityMETER production:** ใช้ uuid และ polygon ของ production; refresh มี 36 Locale ในกรุงเทพฯ ผล point-in-polygon ตรงกับ `base/locatePoint` สำหรับ 48/48 จุดกรุงเทพฯ ตาม metadata ของชุดข้อมูล นอกกรุงเทพฯไม่สร้าง Locale หรือจับคู่ด้วยชื่อ/ขอบเขตที่ใกล้ที่สุด
- **focus + quiet:** เฉพาะส่วนที่โฟกัสมีสี หมุดสีประเภท ป้ายชื่อร้าน อาคารที่ตั้ง และมวลอาคารมุมโค้ง ส่วนอื่นเหลือเส้นขอบบาง จุดบริบทสีเทา และมวลอาคารโทนเงียบ
- **ระดับสถานที่เป็นโฟกัสของตัวเอง:** เปิดศูนย์การค้าใด เฉพาะสาขาของที่นั้นมีรายละเอียด (แม้อยู่นอก 3 ย่านที่โฟกัส) อาคารของสถานที่ (จาก building join ของ master: 69 แห่ง) เป็นสีน้ำเงินและมองเห็น/กดได้เสมอ (venue x-ray) ที่เหลือจัดกรอบที่จุดของสถานที่ มุมสถาปนิก (pitch 75 / FOV 24) เปิดอัตโนมัติ
- **ป้ายและโลโก้ร้าน:** ใช้ไฟล์โลโก้ที่ตรวจตัวตนและ bytes แล้วตาม `data/brand-logos.json`; สถานะขาดยังแสดงชัด ชื่อร้านคงเป็นตัวระบุหลักและเป็น fallback เมื่อไม่มีโลโก้ ไม่วาดหรือใช้โลโก้ยี่ห้อสินค้าทดแทนร้าน
- **breadcrumb:** ประเทศไทย › จังหวัด › ย่าน › สถานที่ ด้วยรหัสจังหวัดของ production (BKK, CMI, NST …) และ id ของ host ที่ยืนยันในข้อมูล URL: `?province=BKK&neighborhood=<locale uuid>&place=<host id>`
- **กรอบจังหวัด:** ซูมออกทั้งประเทศ จังหวัดที่มีร้านกล้อง 64 จังหวัดมีกรอบ สีตามจำนวนร้าน ป้าย และรายการในแผง (10 อันดับแรก ที่เหลือพับไว้) กดเพื่อเจาะลงจังหวัด
- **สถานที่และร้าน:** ประเภทสถานที่ตาม CityMETER, GLA ที่รายงาน, ประเภทร้าน (ร้าน/สาขา), รายการสาขา; รายละเอียดสาขาแสดงร้านที่ร่วมหน้าร้าน สถานะ (รวมสถานะรอตรวจ: ตัวตนหน้าร้าน รวมรายการ ที่ตั้งขัดกัน ที่อยู่ติดต่อ) รูปแบบร้าน ที่อยู่ พิกัดและระดับความแม่น (หรือ “พิกัดรอตรวจ” เมื่อ master พักไว้) วันที่ตรวจ และลิงก์หลักฐาน/พิกัด/แผนที่ของร้าน
- กราฟสามมุมมอง (อันดับย่าน · ตารางย่าน × ประเภทร้าน · ร้านเฉพาะ/ร่วม) วาดด้วย HTML/SVG ทุกแท่งและช่องเป็นปุ่มจริง
- หนึ่งหมุดต่อหนึ่งสาขา ไม่รวมหมุด; missing ไม่แสดงเป็น 0; ไม่มีปุ่มดาวน์โหลด CSV

โครงสร้างหน้าจอยึด [CityMETER Shopping Center production](https://landometer.com/v3/citymeter?d=shoppingCenter): header 48 px แผนที่เต็มพื้นที่ แผงขวา และถาดกราฟด้านล่างที่ย่อได้; มือถือแนวตั้งใช้ bottom sheet

basemap สร้างเองใน `js/map-style.js` บน [OpenFreeMap](https://openfreemap.org/) vector tiles (OpenMapTiles schema, ข้อมูล OpenStreetMap) ด้วยสี `--basemap-*` ใน `assets/theme.css` โดยคง attribution ของ OpenFreeMap, OpenMapTiles และ OpenStreetMap

## Data and method

อ่าน [Product statement](PRODUCT_STATEMENT.md), [DATA_METHOD.md](DATA_METHOD.md) และ [วิธีใช้ Locale เป็นย่าน](docs/NEIGHBORHOOD_METHOD.md) ก่อนตีความผล จำนวนร้านในข้อมูลไม่ใช่ส่วนแบ่งตลาด ยอดขาย สต็อก หรือความครบถ้วนของตลาดกล้องไทย

- Research master: “CityMETER Camera Shops Thailand — Research Master 2026-10-22” (Google Sheets; internal working reference — public demo data: [data/camera.json](data/camera.json); ไม่มีเบอร์โทรหรือลิงก์ Drive ในไฟล์สาธารณะ)
- [CityMETER Shopping Center](https://landometer.com/v3/citymeter?d=shoppingCenter) และ Locale (public production API) — ตรวจจุดตัวแทนสถานที่ที่ master จับคู่ และขอบเขตย่าน; อาคารของสถานที่มาจาก building join ของ master (OpenStreetMap และ building parts ของ CityMETER)
- ขอบเขตจังหวัด: [OpenGISData-Thailand](https://github.com/chingchai/OpenGISData-Thailand) (CC BY 4.0, อ้างอิงกรมการปกครอง)

## Assets and verification

ใช้ LDS **0.9.7 / v0.9.7-owner.1** (standalone-0.9.7-r1, color-srgb-10) เหมือน Luxury Brands: foundation pairs, semantic states, map roles, data states, categorical series ใน [assets/theme.css](assets/theme.css) และ LUT ของ `count` family ใน [js/scales.js](js/scales.js) pictogram ใช้ชุดย่อย Material Symbols Rounded 8 รูป (ร้าน = `photo_camera`) ไฟล์ asset บันทึก byte length และ SHA-256 ใน [assets/manifest.json](assets/manifest.json) และทุกไฟล์ของ repository บันทึกใน `handoff/handoff-manifest.json` (สร้างตอนออกรุ่น) ผลตรวจ hash ไม่ใช่การรับรองว่าผ่านการตรวจ UI หรือ production

คลังโลโก้ร้านและสถานที่ปรับใน refresh นี้ด้วยไฟล์จริงและ provenance แยกบทบาท retailer / venue-specific / corporate / parent-project อ่านจำนวนและรายการขาดล่าสุดจาก `data/brand-logos.json`, `data/venue-logos.json` และ manifest ที่เกี่ยวข้อง; ไม่ตรึงจำนวนก่อน asset patch สุดท้าย การรวบรวมไฟล์ไม่ใช่ใบอนุญาตเครื่องหมายการค้า รูปทรงอาคาร: © OpenStreetMap contributors (ODbL 1.0) ผ่าน research master และ CityMETER

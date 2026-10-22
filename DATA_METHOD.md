# Data and method

**Dataset:** CityMETER Camera Shops Thailand  
**Snapshot date:** 2026-10-22 (Asia/Bangkok)  
**Record grain:** one outlet (point of sale, or one listed contact location) of a camera-shop banner  
**Release level:** exploratory public demo; not a complete market census

> หน่วยข้อมูล: หนึ่งรายการ = หนึ่ง **สาขา** (หน้าร้าน เคาน์เตอร์ หรือ shop-in-shop หนึ่งจุด) ส่วน **ร้าน** คือชื่อร้าน (shop banner) ไม่ซ้ำ เช่น BIG CAMERA หรือ Sony Store — ไม่ใช่ยี่ห้อกล้อง จึงไม่ใช้คำว่า “แบรนด์” เป็นหน่วยบนหน้าจอ

## แหล่งข้อมูล

- **Research master:** “CityMETER Camera Shops Thailand — Research Master 2026-10-22” (Google Sheets, internal working reference) แท็บ `01_BRANDS` (43 ชื่อร้านที่อนุมัติ), `02_STORES` (234 สาขา), `07_VENUES` (144 สถานที่), `09_CLOSED_STORES`, `10_VENUE_LOGOS`, `11_STORE_BRANDS` (การเชื่อมร้าน–สาขา) ตรวจเมื่อ 2026-10-22 ทุกแถว แหล่งหลักคือ official retailer locator / branch list / website ของร้าน (147 แถวจาก locator ทางการ) และ mall directory ส่วนน้อย
- **CityMETER production (public API, ดึง 2026-10-22):** Shopping Center (`shopping-center/detail/{id}`, overlay tiles), Grocery (`grocery/overlayMvt`), Locale และขอบเขตการปกครอง (`base/info/lv0`, `base/info/lv1`, `base/mvt/{P|S|ML}`, `base/locatePoint`) และอาคาร (`building/detail`, `building/detailMvt` V4)
- **ขอบเขตจังหวัด:** OpenGISData-Thailand `provinces.geojson` commit `fafcea179cda88b689f5697c3866a449e79cd298` (sha256 `310c3adf…d011c0`, CC BY 4.0, อ้างอิงกรมการปกครอง)
- **Luxury Brands 0.5:** footprint อาคารและไฟล์โลโก้สถานที่ที่ตรวจแล้ว สำหรับสถานที่ที่สองชุดข้อมูลใช้ร่วมกัน (ศูนย์การค้า CityMETER id เดียวกัน / sha256 เดียวกัน)

ไฟล์สาธารณะ (`data/camera.json` ฯลฯ) สร้างด้วย `scripts/build-camera-data.py` จาก CSV ของแต่ละแท็บและผลจับคู่สถานที่ ไฟล์ทำงานภายในเหล่านั้นไม่อยู่ใน repository

## หน่วยนับ: ร้าน กับ สาขา

- 234 สาขา: **233 retail outlet listings** (ค่าเริ่มต้น “สาขาขายปลีก”) และ **1 retailer contact location** — ที่อยู่ร้าน World Camera ตามเว็บไซต์ปัจจุบัน (ยังไม่ยืนยันว่าเป็นหน้าร้านขายปลีก) ดูได้ใน “ทั้งหมด รวมที่อยู่ติดต่อ”
- ร้านที่อนุมัติ 43 ชื่อ มีสาขาที่ระบุได้ 39 ชื่อ (38 ชื่อในค่าเริ่มต้น เพราะ WORLD CAMERA มีเพียงที่อยู่ติดต่อ) อีก 4 ชื่อ (Pixpros House, Naituanoi Store, BaNANA, Studio7) ยังระบุสาขาไม่ได้ จึงไม่มีแถว
- **หน้าร้านร่วมแบรนด์เป็นสาขาเดียว:** `11_STORE_BRANDS` มี 242 การเชื่อม — `retail_banner` 236, `host_counter_banner` 5 (เคาน์เตอร์กล้องของ BIG CAMERA ใน Power Mall), `operator` 1 (WORLD CAMERA ผู้ดำเนินการ Canon Image Square CentralWorld) แถวเก็บ `brands` (ร้านที่นับ: retail + host-counter, ไม่นับ operator) และ `bannerSegments` คู่กัน รวม 241 การเชื่อมที่นับ จำนวน **ร้าน** นับแต่ละชื่อครั้งเดียวต่อขอบเขต จำนวน **สาขา** นับแถว
- ตัวกรองประเภทร้านเลือกสาขาที่มีร้านอย่างน้อยหนึ่งชื่อในประเภทนั้น และนับเฉพาะร้านในประเภทนั้น (เช่น “ช่องทางขายเสริม” → Power Buy, King Power และเคาน์เตอร์ Power Mall 5 จุด = 3 ร้าน 7 สาขา) ทำเป็นสำเนา ไม่แก้แถวต้นทาง สัดส่วนประเภทร้านในแผงนับคู่ (สาขา × ประเภท) จึงผลรวมอาจมากกว่าจำนวนสาขาเมื่อมีหน้าร้านร่วมแบรนด์
- ประเภทร้าน (research scope groups): A กล้องหลายแบรนด์ 183 สาขา · B มือสองและฟิล์ม 8 · C ร้านแบรนด์ผู้ผลิต 29 · D โดรนและอุปกรณ์ภาพ 12 · E ช่องทางขายเสริม 2 (ตามร้านหลักของแต่ละแถว) การจัดกลุ่มเป็น research taxonomy

## สถานะ

- ทุกแถวเป็น `source_listed_not_field_verified`: พบในแหล่งทางการ ณ วันที่ตรวจ ไม่ใช่การยืนยันเปิดจริงด้วยการลงพื้นที่ บนจอแสดง “พบในแหล่งข้อมูล”
- สถานะรอตรวจคงไว้ในค่าเริ่มต้นพร้อมป้าย (ไม่ลบ ไม่รวมแถว): **ตัวตนหน้าร้านรอตรวจ** 6 แถว — DJI Experience Store กับ Phantom Thailand ที่ centralwOrld, Central Hat Yai และ Megabangna (เบอร์/ป้ายต่างกัน ยังไม่ยืนยันว่าเป็นหน้าร้านเดียวกัน); **รวมรายการรอตรวจ** 1 แถว — BIG CAMERA The Mall Bangkae (สองรายการชี้ห้องเดียวกัน รวมชั่วคราว); **ที่ตั้งขัดกัน** 1 แถว — UNIT CAMERA SHOP สยาม (Lido Connect กับ Siam Square Soi 2 — ไม่สร้างสองสาขาและไม่เลือกพิกัด); **ที่อยู่ติดต่อ** 1 แถว — World Camera ดูรวมได้ที่ชุดข้อมูล “รอตรวจตัวตน / ที่ตั้ง”
- ปิดถาวร: `09_CLOSED_STORES` มีเพียง Eastbourne ระดับร้าน (ปิด 15 ก.พ. 2568) ไม่มีแถวสาขา จึงอยู่ใน `meta.closedBrands` ไม่อยู่บนแผนที่
- ไม่รวม: `03_BRANCH_REVIEW` 72 แถว (รวมรายชื่อตัวแทนจำหน่ายเดิมของ WORLD CAMERA 42 แถว) และ `05_REVIEW_QUEUE` 7 ชื่อที่ยังไม่อยู่ในขอบเขต

## พิกัด: สถานที่ host ของ CityMETER

พิกัดมาจาก **record ของ CityMETER production เท่านั้น** และเป็น **จุดตัวแทนสถานที่ (host-complex point)** ไม่ใช่ประตูร้านหรือชั้นที่ตั้ง (`geometryRole` `host_complex_point_not_shopfront` หรือ `host_hypermarket_point_not_shopfront`, `coordinateSource` = URL ของ record)

- **Shopping Center** 112 record: 30 เชื่อมไว้แล้วในชีต (alias crosswalk จาก Luxury Brands) และ 82 ที่จับคู่ด้วยการทบทวนรายชื่อ — ชื่อเดียวกันหลัง normalize (name) 70, alias ที่ระบุ parent complex เดียวกัน 2, ที่อยู่ตรงกับ record (address) 3, เป็นศูนย์เดียวของชื่อ/ประเภทนั้นในพื้นที่ (sole) 6 และสถานที่ที่ชีตแยกเป็นสองชื่อแต่เป็น record เดียว (dup) 1 (ดู `centers[].match`) ไม่มีการจับคู่ด้วย “ศูนย์ที่ใกล้ที่สุด”
- **Grocery (ไฮเปอร์มาร์เก็ต)** 20 record: สาขา BIG CAMERA ใน Big C / Lotus's ที่ Shopping Center ไม่มี record ของ host จับคู่ด้วยเลขที่ หมู่ และตำบลในที่อยู่ของร้านกับ record ของ CityMETER Grocery (address 19; บิ๊กซี ศรีสะเกษ เป็น Big C ไฮเปอร์มาร์เก็ตแห่งเดียวในจังหวัดและตำบลตรงกับที่อยู่ร้าน — sole 1) พิกัดถอดจาก overlay tile z13 (ความละเอียดราว 1 ม.) `coordinateSource` ชี้ tile ที่อ่าน record นั้น
- ทุกจุดตรวจว่าอยู่ในจังหวัดเดียวกับที่ research ระบุ (polygon จังหวัดของ production) และจุดที่ชีตมีพิกัดอยู่แล้ว 74 แถวตรงกับ production
- `mallId` ของแถวคือ id ของ host (Shopping Center หรือ Grocery; `hostKind` บอกชนิด) สถานที่ 133 จาก 144 แห่งมี host (132 record — สองชื่อสถานที่ใช้ record เดียว) → **208/234 แถวมีพิกัด**
- **ยังไม่มีพิกัด 26 แถว:** ร้านริมถนน/อาคารที่ไม่มีสถานที่ (host) 15 แถว — ไม่ geocode ที่อยู่ และไม่ถอด lat/lng จากลิงก์แผนที่ (ลิงก์แผนที่ทางการ 143 ลิงก์ในชีตอยู่ในสถานะ “ยังไม่ได้ตรวจตัวตน”; ใน 15 แถวนี้มีลิงก์เพียง 1 แถว); และ 11 สถานที่ที่ยังไม่พบ record ที่ยืนยันได้ใน CityMETER (Lit Bangkok Hotel, Maneeya Center North, Panasiri Resident, The Rich Biz Home, แพชชั่น ระยอง, แจ่มฟ้าช้อปปิ้งมอลล์, Ayutthaya Park, ไอที พลาซ่า สำโรง, เม-ญ่า ไลฟ์สไตล์ เชียงใหม่, เจียง-ฟิวเจอร์ หนองคาย, ไชยแสง สิงห์บุรี) แถวเหล่านี้ยังอยู่ในตาราง จำนวน และตัวหาร ไม่ใช้จุดกึ่งกลางย่าน จังหวัด หรือร้านข้างเคียงแทน
- ลิงก์ “แผนที่ของร้าน” ในรายละเอียดสาขาเป็นลิงก์ที่ร้านเผยแพร่เอง แสดงเพื่อเปิดดู ไม่ได้ใช้เป็นพิกัด

ข้อมูล Shopping Center เป็นของ production: ชนิดสถานที่ (`supMallType`), GLA พร้อม `glaSource`/`glaConfidence` ไม่สรุปเป็นขนาดตลาดที่วัดยืนยันแล้ว

## ย่าน = Locale ของ CityMETER production

ย่านไม่ได้วาดขึ้นใหม่: ใช้ **Locale** ของ CityMETER production (Locale Insight) ที่มีสถานที่ของร้านกล้องอย่างน้อยหนึ่งแห่ง — 27 Locale ในกรุงเทพฯ (production ยังไม่มี Locale นอกกรุงเทพฯ) id ของ feature คือ uuid ของ Locale และ `productionUrl` คือหน้า `/v3/citymeter/BKK/L/{uuid}?d=shoppingCenter` รูปทรงถอดจาก vector tile `base/mvt/ML` ที่ z15 รวมชิ้นของ Locale เดียวกัน และลดจุดราว 0.5 ม. (เพื่อแสดงผล) การจับสาขาเข้าย่านใช้ point-in-polygon ของจุด host ไม่ใช้ชื่อ ไม่ใช้ย่านที่ใกล้ที่สุด และ build ตรวจว่าผลตรงกับ `base/locatePoint` ของ production ทุกจุดในกรุงเทพฯ (33/33) — ไม่ตรงคือหยุด build รอยต่อระหว่าง Locale ข้างเคียงอาจซ้อนกันเป็นแถบแคบกว่า 1 ม. จากการลดจุด ใช้ลำดับ id คงที่ตัดสิน รายละเอียดใน [docs/NEIGHBORHOOD_METHOD.md](docs/NEIGHBORHOOD_METHOD.md)

## อาคารของสถานที่

`data/venue-buildings.geojson` 136 features ของ 105 host (176 สาขา): (1) footprint/parts ของ Luxury Brands 0.5 สำหรับศูนย์การค้าที่ใช้ CityMETER id เดียวกัน (60 features ของ 29 host / 30 ชื่อสถานที่) และ (2) อาคาร CityMETER V4 ที่ **ครอบจุด host** และพื้นที่ตรงกับ `building/detail` ภายใน 12% (68) หรือ อาคาร OSM ที่ **ชื่อตรงกับสถานที่** ภายใน 150 ม. เมื่อจุด host ไม่อยู่บนอาคารใด (8, เช่น Fortune Town) อาคารที่เล็ก/เตี้ยเกินกว่าจะเป็น host และไม่มีชื่อตรง ถูกปฏิเสธ (ไม่มี footprint ดีกว่าผิดหลัง) — อีก 27 host (ศูนย์การค้า 15, ไฮเปอร์มาร์เก็ต 12) จึงยังไม่มีอาคาร และกล้องจัดกรอบที่จุด host แทน ความสูงจาก CityMETER (แบบจำลอง/แท็ก OSM) ไม่ใช่ผลรังวัด; ค่า 3.5 ม. ของ production ถือว่าไม่ทราบ → แสดง 3 ม. เพื่อรูปทรง (`unknown_display_fallback`) แหล่งรูปทรง: © OpenStreetMap contributors (ODbL) และ Microsoft Global ML Building Footprints (ODbL, 7 features) ระบุราย feature ใน `attribution`

## กรอบจังหวัด

64 จังหวัดที่มีอย่างน้อยหนึ่งแถว ตัดจาก OpenGISData-Thailand ด้วย `scripts/extract-provinces.mjs` (จับคู่ชื่อไทยกับ `js/model.js#PROVINCES` ซึ่งมีครบ 77 จังหวัดจาก production `base/info/lv0` พร้อมรหัส production เช่น BKK, NST, UTT และรหัสกรมการปกครอง) ปัดพิกัด 5 ตำแหน่ง ไม่ลดจุด รูปทรงที่ยุบเหลือน้อยกว่า 4 จุดหลังปัด (รูภายในของร้อยเอ็ด 1 วง) ถูกตัดออก กรอบเป็นบริบทนำทาง ไม่ใช่ขอบเขตทางการ

## หมุด ป้าย และโลโก้

- หนึ่งหมุดต่อหนึ่งสาขา ไม่รวมหมุด สาขาที่ใช้จุด host เดียวกันจัดแยกบนจอ (เช่น Fortune Town 17 สาขาในจุดเดียว) ไม่เขียนพิกัดใหม่
- **โลโก้ร้านยังไม่ได้รวบรวม** (`01_BRANDS` เตรียมคอลัมน์ไว้ ไม่มีไฟล์) `data/brand-logos.json` เป็นทะเบียนว่าง `meta.status: not_collected` หมุดที่ซูม ≥ 14 แสดง **ชื่อร้าน** เป็นป้ายข้อความ ชื่อยาวกว่า 18 ตัวอักษรใช้คำต้นของชื่อหรือ alias ใน `01_BRANDS` (`js/model.js#BANNER_LABELS`) — เป็นชื่อ ไม่ใช่โลโก้ทดแทน
- **โลโก้สถานที่** 30 ไฟล์ (31 ชื่อสถานที่, เชื่อม 30 host) จาก `10_VENUE_LOGOS` — 23 ไฟล์ใช้ชุดติดตั้งของ Luxury Brands และ 7 ไฟล์จากไฟล์ Drive ของชีต ตรวจ sha256 ตามชีตทุกไฟล์ (ไม่เปลี่ยน bytes) สีพื้นรอง: โปร่งใส → `#E5E9E6`, โปร่งใสสีอ่อน → `#182327`, ไฟล์ทึบ → `#FFFFFF` ค้นด้วย host id ก่อน แล้วจึงชื่อสถานที่ตรงตัว ไม่ fuzzy-match ชื่อสถานที่ยังเป็นตัวระบุหลัก การรวบรวมไฟล์ไม่ใช่ใบอนุญาตเครื่องหมายการค้า

## ความเป็นส่วนตัวและลิงก์

ไฟล์สาธารณะไม่มีเบอร์โทร: คอลัมน์ `phone` ไม่ถูกส่งออก และ build ลบเบอร์ที่ปรากฏในบันทึก research (2 แถว) แทนด้วย “[เบอร์โทรไม่เผยแพร่]” ไม่มีลิงก์ Google Drive / Docs (`logo_file_url`, `venue_logo_file_url` ไม่ถูกส่งออก) ลิงก์ที่เหลือเป็น https สาธารณะ (แหล่งทางการของร้าน production API และลิงก์แผนที่ที่ร้านเผยแพร่)

## ข้อจำกัด

- เป็น source observations ไม่ใช่สถานะเปิดที่ตรวจภาคสนาม และไม่ใช่สำมะโนร้านกล้องทั้งประเทศ (ร้านอิสระขนาดเล็ก ร้านออนไลน์ และตัวแทนจำหน่ายที่ไม่มี locator ไม่ครบ)
- จุดเป็นตัวแทนสถานที่ ไม่บอกชั้น ห้อง หรือทางเข้า
- จำนวนร้านไม่ใช่ส่วนแบ่งตลาด ยอดขาย สต็อก กำลังซื้อ หรือข้อมูลประชากร
- ย่านครอบคลุมเฉพาะ Locale ในกรุงเทพฯ ที่มีสถานที่ของร้านกล้อง นอกนั้นเป็น “นอกย่าน”

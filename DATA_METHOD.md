# Data and method — 0.5.2 building/metric refresh

**Province/metric update — 23 Oct 2026:** national frames now retain all 77 source provinces (the original 64 shapes are unchanged). “นับตาม” switches จำนวนแบรนด์ / จำนวนสาขา for map colours, legends, badges and rankings; `?metric=pos` selects branches. Zero means “ยังไม่พบสาขาในชุดข้อมูล”, not verified absence. Brand share and exclusive/shared analysis remain labelled as brands.
**Owner vocabulary override, 2026-10-23:** public counted banners use “แบรนด์”, outlets use “สาขา”, and the venue label is “ศูนย์การค้า”. Earlier “ร้าน/สถานที่” count labels in retained history are superseded. Source fields, entity names and business categories are unchanged.
**Snapshot:** 2026-10-23 (Asia/Bangkok). Public research demo; source listings are not field-verified operation or a market census. The refreshed master is projected by `scripts/refresh-camera-master.py`; the host-only 0.5.0 pipeline below is historical.

## Current units and coverage

- 253 canonical outlet records: 252 retail outlet listings in the default view and one World Camera contact-location record.
- 44 approved shop banners; 40 appear in all public rows and 39 in the default retail view. Pixpros House, Naituanoi Store, BaNANA and Studio7 have no qualified outlet row. Approval alone does not imply branch coverage.
- 147 persistent named venues. Public data has 260 counted retail/host-counter associations; native `11_STORE_BRANDS` has 261 including one operator-only link. Shared host/coordinates never merge independent outlets.
- 111 source features = 76 footprints + 35 parts across 76 of 147 named venues (+7 venues); 160 outlet-building contexts = 145 inside + 12 named contexts with outside points + 3 linked contexts with no selected point. All 253 outlet IDs, 236 points, 17 missing points and 107 accepted CityMETER host records are unchanged.
- Figures are computed from `data/camera.json` and the refreshed join. The 1,411 private network candidates do not enter public rows, counters or denominators.

## Camera-selling qualification

The latest scope requires evidence about the named physical branch. A chain-wide camera catalog, generic locator, pickup workflow, CCTV/webcam/phone-camera merchandise, marketplace seller or empty branch-stock response does not qualify its whole network. A stock response of zero/empty is not proof that a branch never sells cameras.

Sixteen additional Power Buy outlets qualify through the current retailer branch identity intersected with Canon's camera-category sales-stockist listing. Name/branch qualifier, leading address number and province/district must agree; the manufacturer's publication date is unknown and current stock/models remain unconfirmed. Five already recorded Power Mall counters have direct named camera-counter evidence. Central and Robinson outlets at Future Park keep distinct identities even though they share a parent complex.

AV VALUE is the only new approved banner (CAM-B044): its official contact identifies the Vanilla Moon 4F camera/lens/video-camera showroom. The separately labelled HQ at 65 Soi Chan 33 is an operator-address observation, not the showroom address. Advice/JIB and other unqualified networks remain research candidates. Existing 72 branch-review rows and seven pending banners retain their identity and approval state.

## Independent identity, point and building decisions

A selected point can be an official retailer coordinate, a named business-map destination, a host reference or an explicitly retained cross-dataset reference. Keep source URL, role, period and precision. Read named place-target coordinates, not viewport centres. A valid business point does not establish a venue; a venue identity does not establish a footprint. Never copy a business point to a venue, choose a nearest host, or fill missing positions with an administrative centroid.

UNIT's walk-in host is Lido Connect 2F; company address 236/11 Siam Square Soi 2 remains separate evidence. Lido's point comes from official published event-location records and represents the host, not the UNIT unit/entrance. Central Chidlom's host reference is retained from 21 October evidence; its provider returned 403 on 23 October, so it is not freshly revalidated. Chidlom's dated 2024 camera-assortment note/hold remains alongside additional undated manufacturer evidence.

Containment uses the actual selected point and the known qualified host feature. Leica Siam Paragon's new official point is outside its former footprint; preserve named-host context and exclude it from inside totals. New parts require complete polygon coverage against their qualified parent; a vertex-only test is insufficient. Retain source/modeled/unknown height separately from display fallback and never spread a tower's height across a parent.

## Reviewed host geometry and display heights

A reviewed, independently identified named host can have an accepted building even without a CityMETER registry join. No outlet/venue point moved and no registry join was upgraded. Preserve point containment, outside named context and missing-point context as different outcomes. The original 103 geometries are preserved and 34 original part ownership links restored; eight acquired/reused features add Fortune Town, Lido Connect, Vanilla Moon, Central Phuket Floresta, Future Park Rangsit, Siam Square One and Central Chidlom. The new hotel part is host-complex context, never proof that each tenant occupies that part.

Fortune Town has 17 outlets / 13 counted banners. Retail-parent display top17.5m and hotel-context display top105m are explicit level-count models with source height_m=null, not published metre heights or surveyed measurements. Do not spread hotel/tower height across the retail parent. Unknown source height remains null; 3m fallbacks are display values only.

## Locale, privacy and assets

Refresh data holds 36 production Bangkok Locales; metadata records agreement with `base/locatePoint` for 48/48 Bangkok points. No nearest-boundary/name fallback or invented Locale outside Bangkok. Locale Insight is context, not population, eligibility, statutory boundary, risk or actual behavior evidence.

Public projection strips phones and private Drive/Docs links. Research candidates, raw observations and reviewer material remain private. Logo files are joined by stable identity/exact accepted labels, preserve original artwork and hashes, and state venue-specific/corporate/parent roles. Read current coverage/missing lists from the logo registries after the final asset patch; collecting artwork does not grant trademark rights. Build, unit, browser, live and visual checks remain separate evidence levels.

---

## Historical method — 0.5.0, 22 October 2026

The retained record below describes that snapshot only. Its host-only coordinate gate, counts, empty brand-logo registry and old held cases are superseded by the refresh contract above; it is not the current build command.

# Data and method

**Dataset:** CityMETER Camera Shops Thailand  
**Snapshot date:** 2026-10-22 (Asia/Bangkok) — research master revision 2026-10-22 13:13 UTC (20:13 น.)  
**Record grain:** one outlet (point of sale, or one listed contact location) of a camera-shop banner  
**Release level:** exploratory public demo; not a complete market census

> หน่วยข้อมูล: หนึ่งรายการ = หนึ่ง **สาขา** (หน้าร้าน เคาน์เตอร์ หรือ shop-in-shop หนึ่งจุด) ส่วน **ร้าน** คือชื่อร้าน (shop banner) ไม่ซ้ำ เช่น BIG CAMERA หรือ Sony Store — ไม่ใช่ยี่ห้อกล้อง จึงไม่ใช้คำว่า “แบรนด์” เป็นหน่วยบนหน้าจอ

## แหล่งข้อมูล

- **Research master:** “CityMETER Camera Shops Thailand — Research Master 2026-10-22” (Google Sheets, internal working reference) revision 2026-10-22 13:13 UTC แท็บ `01_BRANDS` (43 ชื่อร้านที่อนุมัติ), `02_STORES` (234 สาขา), `07_VENUES` (144 สถานที่), `09_CLOSED_STORES`, `10_VENUE_LOGOS`, `11_STORE_BRANDS` (การเชื่อมร้าน–สาขา), `12_SPATIAL_JOIN` (ผล venue join และ building join หนึ่งแถวต่อสาขา) และ `13_BUILDINGS` (รูปทรงอาคาร 103 แถว) พร้อมไฟล์ feature ของ building join (`CityMETER_Camera_Shops_Venue_Buildings_2026-10-22.geojson`) ตรวจเมื่อ 2026-10-22 ทุกแถว แหล่งหลักคือ official retailer locator / branch list / website ของร้าน (147 แถวจาก locator ทางการ) และ mall directory ส่วนน้อย
- **CityMETER production (public API, ดึง 2026-10-22):** Shopping Center (`shopping-center/detail/{id}`) สำหรับตรวจ host ทุกแห่ง, Locale และขอบเขตการปกครอง (`base/info/lv0`, `base/info/lv1`, `base/mvt/{P|S|ML}`, `base/locatePoint`); Grocery (`grocery/overlayMvt`) ใช้เฉพาะข้อเสนอ host link ที่ไม่เผยแพร่
- **ขอบเขตจังหวัด:** OpenGISData-Thailand `provinces.geojson` commit `fafcea179cda88b689f5697c3866a449e79cd298` (sha256 `310c3adf…d011c0`, CC BY 4.0, อ้างอิงกรมการปกครอง)
- **Luxury Brands 0.5:** ไฟล์โลโก้สถานที่ที่ตรวจแล้ว สำหรับสถานที่ที่สองชุดข้อมูลใช้ร่วมกัน (sha256 เดียวกับชีต)

ไฟล์สาธารณะ (`data/camera.json` ฯลฯ) สร้างด้วย `scripts/build-camera-data.py` จาก CSV ของแต่ละแท็บ ไฟล์อาคารของ master และผลตรวจของ `scripts/host-links/` ไฟล์ทำงานภายในเหล่านั้นไม่อยู่ใน repository

> ประวัติ: build แรกของ 0.5.0 (commit `cfb2ed4`) ใช้ snapshot เวลา 12:36 UTC ซึ่งยังไม่มี venue join ของ master จึงจับคู่ host เอง (208 แถวมีพิกัด) master revision 13:13 UTC เพิ่ม venue join, building join และการพักพิกัด 6 สถานที่ release นี้จึง build ใหม่ให้ตรงกับ master — ลดลง 31 สาขาใน 29 สถานที่ (ไฮเปอร์มาร์เก็ต 19, โรบินสัน 6, สถานที่ที่ master พัก 4 แห่ง 6 สาขา) เพิ่ม 2 (Ayutthaya City Park, แจ่มฟ้า ลำพูน) และเปลี่ยน record ของ host 1 (โลตัส สุราษฎร์ธานี)

## หน่วยนับ: ร้าน กับ สาขา

- 234 สาขา: **233 retail outlet listings** (ค่าเริ่มต้น “สาขาขายปลีก”) และ **1 retailer contact location** — ที่อยู่ร้าน World Camera ตามเว็บไซต์ปัจจุบัน (ยังไม่ยืนยันว่าเป็นหน้าร้านขายปลีก) ดูได้ใน “ทั้งหมด รวมที่อยู่ติดต่อ”
- ร้านที่อนุมัติ 43 ชื่อ มีสาขาที่ระบุได้ 39 ชื่อ (38 ชื่อในค่าเริ่มต้น เพราะ WORLD CAMERA มีเพียงที่อยู่ติดต่อ) อีก 4 ชื่อ (Pixpros House, Naituanoi Store, BaNANA, Studio7) ยังระบุสาขาไม่ได้ จึงไม่มีแถว
- **หน้าร้านร่วมแบรนด์เป็นสาขาเดียว:** `11_STORE_BRANDS` มี 242 การเชื่อม — `retail_banner` 236, `host_counter_banner` 5 (เคาน์เตอร์กล้องของ BIG CAMERA ใน Power Mall), `operator` 1 (WORLD CAMERA ผู้ดำเนินการ Canon Image Square CentralWorld) แถวเก็บ `brands` (ร้านที่นับ: retail + host-counter, ไม่นับ operator) และ `bannerSegments` คู่กัน รวม 241 การเชื่อมที่นับ จำนวน **ร้าน** นับแต่ละชื่อครั้งเดียวต่อขอบเขต จำนวน **สาขา** นับแถว
- ตัวกรองประเภทร้านเลือกสาขาที่มีร้านอย่างน้อยหนึ่งชื่อในประเภทนั้น และนับเฉพาะร้านในประเภทนั้น (เช่น “ช่องทางขายเสริม” → Power Buy, King Power และเคาน์เตอร์ Power Mall 5 จุด = 3 ร้าน 7 สาขา) ทำเป็นสำเนา ไม่แก้แถวต้นทาง สัดส่วนประเภทร้านในแผงนับคู่ (สาขา × ประเภท) จึงผลรวมอาจมากกว่าจำนวนสาขาเมื่อมีหน้าร้านร่วมแบรนด์
- ประเภทร้าน (research scope groups): A กล้องหลายแบรนด์ 183 สาขา · B มือสองและฟิล์ม 8 · C ร้านแบรนด์ผู้ผลิต 29 · D โดรนและอุปกรณ์ภาพ 12 · E ช่องทางขายเสริม 2 (ตามร้านหลักของแต่ละแถว) การจัดกลุ่มเป็น research taxonomy

## สถานะ

- ทุกแถวเป็น `source_listed_not_field_verified`: พบในแหล่งทางการ ณ วันที่ตรวจ ไม่ใช่การยืนยันเปิดจริงด้วยการลงพื้นที่ บนจอแสดง “พบในแหล่งข้อมูล”
- สถานะรอตรวจคงไว้ในค่าเริ่มต้นพร้อมป้าย (ไม่ลบ ไม่รวมแถว): **ตัวตนหน้าร้านรอตรวจ** 6 แถว — DJI Experience Store กับ Phantom Thailand ที่ centralwOrld, Central Hat Yai และ Megabangna (เบอร์/ป้ายต่างกัน ยังไม่ยืนยันว่าเป็นหน้าร้านเดียวกัน); **รวมรายการรอตรวจ** 1 แถว — BIG CAMERA The Mall Bangkae (สองรายการชี้ห้องเดียวกัน รวมชั่วคราว); **ที่ตั้งขัดกัน** 1 แถว — UNIT CAMERA SHOP สยาม (Lido Connect กับ Siam Square Soi 2 — ไม่สร้างสองสาขาและไม่เลือกพิกัด); **ที่อยู่ติดต่อ** 1 แถว — World Camera ดูรวมได้ที่ชุดข้อมูล “รอตรวจตัวตน / ที่ตั้ง” (17 แถว: 9 แถวข้างต้นและ 8 สาขาของสถานที่ที่ research master พักพิกัด — ดู “พิกัด” ด้านล่าง)
- ปิดถาวร: `09_CLOSED_STORES` มีเพียง Eastbourne ระดับร้าน (ปิด 15 ก.พ. 2568) ไม่มีแถวสาขา จึงอยู่ใน `meta.closedBrands` ไม่อยู่บนแผนที่
- ไม่รวม: `03_BRANCH_REVIEW` 72 แถว (รวมรายชื่อตัวแทนจำหน่ายเดิมของ WORLD CAMERA 42 แถว) และ `05_REVIEW_QUEUE` 7 ชื่อที่ยังไม่อยู่ในขอบเขต

## พิกัด: venue join ของ research master

research master revision 13:13 UTC มี venue join ของตัวเอง (`07_VENUES`, `02_STORES`, `12_SPATIAL_JOIN`) และเป็นผู้ตัดสินว่าสาขาใดมีจุด host — build ตรวจและแปลงเท่านั้น ไม่เพิ่ม ไม่ย้าย ไม่ยกระดับการจับคู่ (`venueJoin` ของแถว: `joined` · `held` · `awaiting_registry` · `no_venue`)

- **จับคู่ venue แล้ว** 179 สาขา / 106 สถานที่ → 106 record Shopping Center ของ CityMETER (`citymeter_shopping_center_id`) วิธีของ master คือชื่อหรือ alias เฉพาะสาขาและจังหวัดที่ตรงทะเบียน (`existing_explicit_host_reference`, `unique_normalized_exact_curated_alias`, `curated_distinctive_bilingual_or_official_host_alias`) ไม่ใช้ชื่อถนนหรือย่านเป็นอาคาร และไม่เลือก venue ที่ใกล้ที่สุด จุดเป็น **จุดตัวแทนสถานที่ (host-complex point)** จาก `shopping-center/detail` ไม่ใช่ประตูร้านหรือชั้น (`geometryRole` `host_complex_point_not_shopfront`, `geometryStatus` `citymeter_host_reference`, `coordinateSource` = URL ของ detail)
- `scripts/host-links/03_verify_master_join.py` อ่าน detail ของทุก host จาก production อีกครั้ง: lat/lng ของ master ตรงกับ detail ทั้ง 106 แห่ง (ตรงทุกหลัก), จุดอยู่ใน polygon จังหวัดของ production ตรงกับจังหวัดใน research, ทุกสาขาของสถานที่ที่จับคู่ใช้ host และจุดเดียวกัน และสาขาที่ยังไม่จับคู่ไม่มีจุดใด — ไม่ตรงคือหยุด build
- **รอตรวจชื่อหรือขอบเขต** (master พักพิกัด) 8 สาขาใน 6 สถานที่: Siam Square One (จุดของ CityMETER และ polygon ใต้ดินที่ไม่มีชื่อขัดกับแผนผังผู้เช่าทางการของ Fujifilm), Central Phuket Floresta (คนละฝั่งกับ Festival), ท็อปส์ ซูเปอร์สโตร์ พะเยา, มาร์คโฟร์ แพร่, ไชยแสง สิงห์บุรี และไอที พลาซ่า สำโรง — ไม่มีจุด รายละเอียดสาขาแสดง “พิกัดรอตรวจ”
- **มีชื่อ venue รอตรวจทะเบียน** 32 สาขา และ **ไม่มี venue ที่ยืนยัน** 15 สาขา (ร้านริมถนน/อาคาร) — ไม่มีจุด ไม่ geocode ที่อยู่ และไม่ถอด lat/lng จากลิงก์แผนที่ (ลิงก์แผนที่ทางการ 143 ลิงก์ในชีตอยู่ในสถานะ “ยังไม่ได้ตรวจตัวตน”)
- รวม **179/234 แถวมีพิกัด** อีก 55 แถวยังอยู่ในตาราง จำนวน และตัวหาร ไม่ใช้จุดกึ่งกลางย่าน จังหวัด หรือร้านข้างเคียงแทน
- `mallId` ของแถวคือ id ของ Shopping Center ที่ master จับคู่ (`hostKind: shopping_center`) โค้ดยังรองรับ host ชนิด Grocery (ไฮเปอร์มาร์เก็ต, `centers[].kind`) แต่ revision นี้ไม่มีแถวใดใช้
- **ข้อเสนอ host link (ไม่เผยแพร่):** การทบทวนรายชื่อของ app (`scripts/host-links/crosswalk_sc.py`, `crosswalk_grocery.py`) เสนอ host ให้ 28 สถานที่ / 29 สาขาที่ master ยังไม่จับคู่ — Big C / Lotus's 19 แห่ง (record Grocery ของ CityMETER: ที่อยู่ตรงกับที่อยู่ร้าน 18, เป็นแห่งเดียวในจังหวัด 1), โรบินสัน 6 แห่ง (record Shopping Center ที่ชื่อไม่ระบุสาขา (“Robinson”/“ROBINSON” 5, “Robinson Lifestyle Center” 1) และเป็นแห่งเดียวในจังหวัด) และ 3 สถานที่ที่ master พักไว้ ทุกข้อเสนอตรวจ polygon จังหวัดแล้ว ส่งเป็น `host_link_proposals.csv` ให้ทีม research เมื่อ master เปลี่ยนเป็น “จับคู่ venue แล้ว” build ครั้งถัดไปจะรับเอง สำหรับสถานที่ที่ master จับคู่แล้ว การทบทวนของ app ครอบคลุม 74 จาก 106 แห่งและตรงกัน 73 (โลตัส สุราษฎร์ธานี: master ใช้ record Shopping Center ส่วนการทบทวนของ app ใช้ record Grocery)
- ลิงก์ “แผนที่ของร้าน” ในรายละเอียดสาขาเป็นลิงก์ที่ร้านเผยแพร่เอง แสดงเพื่อเปิดดู ไม่ได้ใช้เป็นพิกัด

ข้อมูล Shopping Center เป็นของ production: ชนิดสถานที่ (`supMallType`), GLA พร้อม `glaSource`/`glaConfidence` ไม่สรุปเป็นขนาดตลาดที่วัดยืนยันแล้ว

## ย่าน = Locale ของ CityMETER production

ย่านไม่ได้วาดขึ้นใหม่: ใช้ **Locale** ของ CityMETER production (Locale Insight) ที่มีสถานที่ของร้านกล้อง (ที่ master จับคู่แล้ว) อย่างน้อยหนึ่งแห่ง — 26 Locale ในกรุงเทพฯ (production ยังไม่มี Locale นอกกรุงเทพฯ) id ของ feature คือ uuid ของ Locale และ `productionUrl` คือหน้า `/v3/citymeter/BKK/L/{uuid}?d=shoppingCenter` รูปทรงถอดจาก vector tile `base/mvt/ML` ที่ z15 รวมชิ้นของ Locale เดียวกัน และลดจุดราว 0.5 ม. (เพื่อแสดงผล) การจับสาขาเข้าย่านใช้ point-in-polygon ของจุด host ไม่ใช้ชื่อ ไม่ใช้ย่านที่ใกล้ที่สุด และ build ตรวจว่าผลตรงกับ `base/locatePoint` ของ production ทุกจุดในกรุงเทพฯ (31/31) — ไม่ตรงคือหยุด build รอยต่อระหว่าง Locale ข้างเคียงอาจซ้อนกันเป็นแถบแคบกว่า 1 ม. จากการลดจุด ใช้ลำดับ id คงที่ตัดสิน รายละเอียดใน [docs/NEIGHBORHOOD_METHOD.md](docs/NEIGHBORHOOD_METHOD.md)

## อาคารของสถานที่

`data/venue-buildings.geojson` คือ building join ของ research master — แท็บ `13_BUILDINGS` และไฟล์ feature `CityMETER_Camera_Shops_Venue_Buildings_2026-10-22.geojson` ที่ README ของ master ระบุไว้สำหรับใช้งานต่อ: 103 features (footprint 69 + parts 34) ของ 69 host / 119 สาขา กฎของ master: การครอบจุด (point containment) กับตัวตนของ host (ชื่อ/ที่อยู่) ทดสอบแยกกัน อาคารที่ไม่ผ่านตัวตนถูกพักเป็น candidate; ไม่ใช้อาคารที่ใกล้ที่สุด ไม่สร้างรูปสี่เหลี่ยม/วงกลม ไม่กระจายความสูงของหอคอยสูงสุดไปทั้งอาคาร; parts รับเมื่อ polygon อยู่ใน parent ที่ผ่านเกณฑ์ทั้งชิ้นและคงฐาน/ยอดตามต้นทาง สถานะ building join ต่อสาขา: เชื่อมอาคารแล้ว 116, อาคารบริบทจากชื่อ venue 3 (มีตัวตน แต่จุดอยู่นอก polygon), ยังไม่มีอาคารที่ยืนยัน 94, รอตรวจตัวตนอาคาร 21

build ตรวจทุก feature กับแถวของ `13_BUILDINGS` (id, sha256 ของ geometry, ความสูง, จำนวนสาขาที่เชื่อม) และทุกสาขาที่เชื่อมต้องเป็นสาขาที่จับคู่กับ host ของอาคารนั้น แล้วแปลงโหมดแสดงผลของ master เป็นสองแบบของ app: `extrusion` → extrusion, `outline` → outline, `source_footprint` → extrusion (เป็น outline เมื่อ `height_status` = `unknown_parent_height_parts_owned` เพราะ parts เป็นตัวถือความสูง เช่น MBK CENTER), parts ที่ยังไม่ระบุโหมด (3 parts ใหม่ของ CityMETER) → extrusion ระหว่าง `base_m` กับ `top_m` ผลคือ extrusion 95 และ outline 8

host 37 จาก 106 แห่งยังไม่มีอาคาร (เช่น Fortune Town) กล้องจัดกรอบที่จุด host แทน และคำอธิบาย “อาคารของสถานที่” ในแผนที่ซ่อนเมื่อไม่มีอาคารแสดง ความสูงเป็นค่าจากแหล่งหรือแบบจำลองของ CityMETER ไม่ใช่ผลรังวัด; 3 ม. เป็นความสูงแสดงผลเมื่อไม่ทราบ (`unknown_display_fallback`) แหล่งรูปทรง: © OpenStreetMap contributors (ODbL 1.0) — footprint ต้นฉบับของ OSM และ building parts ของ CityMETER ที่มาจาก OSM

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
- ย่านครอบคลุมเฉพาะ Locale ในกรุงเทพฯ ที่มีสถานที่ของร้านกล้อง จุดนอกนั้นเป็น “นอกย่าน” ส่วนแถวที่ไม่มีจุดแสดง “—”
- จุดและอาคารตามสถานะของ research master ณ revision ที่ระบุ สาขาที่ master ยังไม่จับคู่จะไม่ขึ้นแผนที่จนกว่า master จะยืนยัน

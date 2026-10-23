# CityMETER Camera Shops — Product Brief

รุ่นส่งต่อ **0.5.2** · 23 ตุลาคม 2569 · schema **1.4.0** · Current machine contract: `product-brief.json`

## Current 0.5.2 contract — 23 October 2026

- 111 source features = 76 footprints + 35 parts across 76 of 147 named venues (+7 venues); 160 outlet-building contexts = 145 inside + 12 named contexts with outside points + 3 linked contexts with no selected point. All 253 outlet IDs, 236 points, 17 missing points and 107 accepted CityMETER host records are unchanged.
- A reviewed, independently identified named host can have an accepted building even without a CityMETER registry join. No outlet/venue point moved and no registry join was upgraded. Preserve point containment, outside named context and missing-point context as different outcomes. The original 103 geometries are preserved and 34 original part ownership links restored; eight acquired/reused features add Fortune Town, Lido Connect, Vanilla Moon, Central Phuket Floresta, Future Park Rangsit, Siam Square One and Central Chidlom. The new hotel part is host-complex context, never proof that each tenant occupies that part.
- Fortune Town has 17 outlets / 13 counted banners. Retail-parent display top17.5m and hotel-context display top105m are explicit level-count models with source height_m=null, not published metre heights or surveyed measurements. Do not spread hotel/tower height across the retail parent. Unknown source height remains null; 3m fallbacks are display values only.
- All77 source province frames remain (64 with observed rows,13 with no observed rows); the original64 feature records are unchanged. count-metric / ?metric=brands|pos switches unique banners / deduplicated outlet IDs across colours, legends, badges and rankings. Zero means ยังไม่พบสาขาในชุดข้อมูล, not verified absence. Brand share and exclusive/shared analysis retain explicit brand units.
- 44 approved banners; 40 represented overall / 39 default; 252 default retail rows. 43 store-logo files and 83 venue-logo files cover 139 of 147 venue labels. 1,411 private network candidates remain excluded. Branch-specific camera evidence, including undated Canon stockist/current Power Buy branch intersections, qualifies listings; it does not confirm current stock or field operation.
- Public units: แบรนด์ / สาขา / ศูนย์การค้า / ย่าน. Current adapter: `scripts/refresh-camera-master.py --master …`; identity, selected points and building decisions remain independent. Real browser/live verification is recorded separately in `VERIFICATION.md` and the release receipt.
- Qualified host solids render from zoom 13; only visible positive-height extrusions suppress background massing. Venue and selected-neighborhood hosts receive x-ray above all basemap labels, appended last in the map style. DOM outlet marks and logos remain above the canvas. No x-ray solid is created for an outline, invalid height or unaccepted geometry.

สัญญาปัจจุบันด้านบนและ machine JSON เป็น authority ของรุ่นนี้ ส่วนบันทึกด้านล่างคงไว้เพื่อสอบกลับ ไม่ใช้จำนวน หน่วยคำ หรือ host-only gate เดิมเป็นกฎปัจจุบัน

## Retained 0.5.0/0.5.1 implementation notes — historical where superseded

## สร้างบนสถาปัตยกรรม Luxury Brands 0.5

Camera Shops ใช้สถาปัตยกรรมและสัญญาหน้าจอชุดเดียวกับ [CityMETER · Luxury Brands 0.5](https://montri-th.github.io/luxurybrands/): เมือง 3 มิติเป็นข้อค้นพบแรก, focus + quiet context, breadcrumb ประเทศไทย › จังหวัด › ย่าน › สถานที่, อาคารของสถานที่มองเห็นและกดได้เสมอ (venue x-ray), กรอบจังหวัดพร้อมการเจาะลง, pictogram บน metric tiles และโลโก้สถานที่จากชีต research ส่วนที่ไม่เขียนว่า “ต่างจาก Luxury Brands” ในเอกสารนี้ให้ถือว่าทำงานเหมือนเดิมทุกประการ

สิ่งที่ต่างใน Camera Shops:

| เรื่อง | Camera Shops 0.5 | ที่อยู่ในโค้ด |
|---|---|---|
| หน่วยนับ | **ร้าน** = ชื่อร้าน (shop banner) ไม่ซ้ำ เช่น BIG CAMERA, Sony Store · **สาขา** = หนึ่งแถว (จุดขาย หรือที่อยู่ติดต่อที่ประกาศไว้) · หน้าร้านร่วมแบรนด์ยังเป็น 1 สาขาที่มีหลายร้าน (`brands[]`) — 7 สาขาในชุดนี้: BIG CAMERA + Power Mall 5 สาขา, DJI Experience Store + Hasselblad Bangkok Store, Insta360 Experience Store by BIG Camera + BIG CAMERA; ผู้ดำเนินการ (WORLD CAMERA ของ Canon Image Square) ไม่นับเป็นร้าน; คำว่า “แบรนด์” ไม่ใช้เป็นหน่วยบนจอเพราะจะอ่านเป็นแบรนด์กล้อง | `js/model.js` (`bannersOf`, `bannerSegmentsOf`, `brandSet`, `countBrands`) และทุกตัวนับ |
| ตัวกรองประเภทร้าน | สาขาอยู่ในผลกรองเมื่อมีร้านใดร้านหนึ่งในประเภทนั้น และนับเฉพาะร้านของประเภทนั้น (`projectSegment` คืนสำเนา ไม่แก้แถวต้นทาง ไม่ย้ายพิกัด) | `js/model.js#projectSegment`, `filterRows` |
| ย่าน |36productionBangkokLocales;uuidคงproduction;48/48selected-point membershipsตรงlocatePoint | `data/neighborhoods.geojson`, `scripts/refresh-camera-master.py` |
| พิกัดและhost |236selectedsourcepointsแยกจาก107acceptedhostrecords;businesspointอาจไม่มีhostjoinได้ ไม่อ่านviewportหรือเลือกhostใกล้ที่สุด | `geometryRole`, `coordinateSource`, `venueJoin`, refreshadapter |
| ระดับสถานที่ | แถวของสถานที่มาจาก `scopeRows` — สถานที่นอก 3 ย่าน auto focus ยังได้หมุดสี อาคารสีน้ำเงิน และ x-ray (เมื่อ master ยอมรับอาคารนั้น) | `js/app.js#detailRows` |
| กรอบภาพแรก | padding ของ fit แบบ 3D บนเดสก์ท็อปนับ legend ด้วย และภาพรวม 3D ไม่ต่ำกว่า zoom 13 (`CITY_MASSING_ZOOM`) เพื่อให้เห็นมวลอาคาร แม้ย่านโฟกัสอยู่ห่างกัน (รัชดา ↔ สยาม ~2 กม.); มือถือยัง fit เต็ม | `js/app.js#pitchedPadding`, `fitMap` |
| จังหวัดที่ไม่มี Locale | ข้อค้นพบแรกย้ายไประดับสถานที่: “{n}% ของร้านกล้องมีสาขาที่ {สถานที่อันดับแรกที่มีจุด host}”; สถานที่ที่ไม่มีจุดอยู่ในรายการสถานที่เท่านั้น; ไม่มีสถานที่ใดมีจุด → “{สาขา} สาขา · {ร้าน} ร้าน”; ไม่มีช่อง “0 ย่าน” | `js/panel.js#renderOverview` |
| กรอบจังหวัด | 64 จังหวัดที่มีสาขา; รายการในแผงแสดง 10 แถว ที่เหลือพับใน `<details>` | `data/provinces.geojson`, `js/panel.js` |
| ป้ายบนหมุด |43verifiedstoremarks/44approved;ขาดCameraExchangeใช้namefallback ไม่แทนด้วยmanufacturerlogo | `data/brand-logos.json`, existinglogo/pincomponents |
| Pictogram | บทบาท “ร้าน” ใช้ `photo_camera` (U+E412) แทน diamond; subset สร้างซ้ำได้ byte ต่อ byte | `assets/icons/material-pictogram-300.woff2`, `js/navigation.js`, `styles.css`, `scripts/build-pictogram-font.py` |
| รายละเอียดร้าน | ที่อยู่, รูปแบบร้าน (`FORMATS`), ร้านที่ร่วมหน้าร้าน, ลิงก์แผนที่ของร้าน, สถานะรอตรวจตัวตน/ที่ตั้ง; cohort `current` / `all` / `review` | `js/panel.js#renderStore`, `js/profile-model.js#describeStatus`, `js/model.js` |
| ความเป็นส่วนตัว | ไฟล์สาธารณะไม่มีเบอร์โทร (ล้างตอน build) และไม่มีลิงก์ Drive/Docs ส่วนตัว | `scripts/build-camera-data.py` (`no_phone`, `public_https`) |

## ผลิตภัณฑ์ช่วยตัดสินใจอะไร

**ถ้าจะเปิดร้านกล้องที่นี่ จะอยู่ข้างใคร — และย่านนี้ยังขาดร้านแบบไหน** ผู้ใช้ต้องได้ภาพที่มีความหมายทันทีที่เปิดหน้า ไม่ต้องตั้งค่าตัวกรองก่อน และทุกการเจาะต่อต้องเห็นได้ว่ากำลังดูส่วนไหนของเมือง (breadcrumb + focus/quiet)

| ผู้ใช้ (Hypothesis — ดู statement) | งานที่ต้องทำ | เส้นทางที่ผลิตภัณฑ์รองรับ |
|---|---|---|
| ทีมขยายสาขาของเครือร้านกล้องและร้านแบรนด์ผู้ผลิต | เลือกย่าน/สถานที่สำหรับสาขาใหม่หรือย้าย ดูว่าคู่แข่งอยู่ที่ไหน | 3D first Aha → โปรไฟล์ย่าน (ใครอยู่ข้างใคร) → สถานที่ → สาขาพร้อมหลักฐาน |
| ทีม leasing / asset ของศูนย์การค้าและศูนย์ไอที | หา gap และร้านเฉพาะของ tenant mix กลุ่มกล้อง/อุปกรณ์ภาพ | โปรไฟล์ย่าน → ประเภทร้าน → ร้านเฉพาะ/ร่วม → matrix |
| ทีมขายและช่องทางของแบรนด์ผู้ผลิตกล้อง/โดรน | เห็นว่าร้านแบรนด์ตัวเองกับร้านหลายแบรนด์กระจายตัวอย่างไร | ตัวกรองประเภทร้าน → กรอบจังหวัด → ตาราง |
| นักวิเคราะห์และที่ปรึกษา | หลักฐานที่ตรวจกลับได้สำหรับ proposal | กราฟเปรียบเทียบ → ตาราง → แหล่งข้อมูลรายรายการ → JSON |

การทำงานเร็วขึ้นหรือเลือกทำเลได้ดีขึ้นเป็นผลที่ต้องวัดกับผู้ใช้ ไม่ใช่ผลที่ผลิตภัณฑ์พิสูจน์แล้ว

## สิ่งที่อยู่ในขอบเขต

ข้อมูลrefresh23ต.ค.2569:44approvedชื่อ,40ที่มีแถว/39default;253outletsใน64จังหวัด(กรุงเทพฯ110),236selectedpointsใน63จังหวัด,147namedvenues. ก่อนเพิ่มcategory-killerต้องมีbranch-specificcamera evidence;1,411private network candidatesไม่อยู่ในpubliccounts

| ชั้นข้อมูล | ไฟล์ | บทบาท |
|---|---|---|
| ร้าน–สาขา | `data/camera.json` (`rows`, `centers`, `brands`, `meta`) | ตัวตน ร้านที่ร่วมหน้าร้าน สถานะ วันที่ แหล่งข้อมูล ที่อยู่ พิกัด host |
| ย่าน |36productionBangkokLocales;uuidคงproduction;48/48selected-point membershipsตรงlocatePoint | `data/neighborhoods.geojson`, `scripts/refresh-camera-master.py` |
| อาคารที่ตั้ง | `data/venue-buildings.geojson` | building join ของ research master: 103 รูปทรง (footprint 69 + ส่วนอาคาร 34) ของ 69 host (119 สาขา) พร้อมที่มาความสูงและ attribution |
| กรอบจังหวัด | `data/provinces.geojson` | 64 จังหวัดที่มีสาขา (OpenGISData-Thailand, CC BY 4.0) |
| มวลอาคารเมือง | OpenFreeMap tiles (`building` source-layer) | บริบท 3 มิติทั้งเมือง (quiet) และวัตถุดิบของอาคารมุมโค้งในย่านโฟกัส; ไม่ใช่ข้อมูลของชุดนี้ |
| อัตลักษณ์ร้าน | `data/brand-logos.json` | ทะเบียนว่าง (`meta.status = not_collected`) — หมุดแสดงป้ายชื่อแทน |
| อัตลักษณ์สถานที่ | `data/venue-logos.json`, `assets/venue-logos/` | 30 ไฟล์ · 31 ชื่อสถานที่ · 30 ลิงก์ host พร้อมบทบาท; ไม่เปลี่ยนตัวตนหรือข้อมูลร้าน |

Cohort `current`=252retailrows/39ร้าน; `all`=253rows/40ร้าน รวมWorldCamera contact1; `review`=17recordsตามmodel.17rowsไม่มีพิกัดแต่คงในตาราง/ตัวหาร. พิกัดของbusiness/hostอ้างอิงไม่ยืนยันหน้าร้าน/การเปิดจริง และไม่สร้างhostjoinอัตโนมัติ

## ขอบเขตข้อมูลสามชั้นที่ทุกมุมมองต้องใช้ร่วมกัน

| ชั้น | นิยาม | ใครใช้ |
|---|---|---|
| `scopeRows` | รายการหลังตัวกรอง search/cohort/segment/province/channel/venue **ก่อน** เลือกย่านหรือ focus | Aha (ตัวหาร), choropleth, กราฟเปรียบเทียบ, โปรไฟล์ย่าน (ฐานเทียบเฉพาะ/ร่วม), จุดบริบทบนแผนที่, แถวของสถานที่ที่เปิดอยู่ (Camera) |
| `baseRows` | `scopeRows` ที่แคบลงด้วยย่านที่เลือก | อันดับย่านในแผง, Aha เมื่อเลือกย่าน |
| `rows` | `baseRows` ที่แคบลงด้วย area focus | หมุดแบบละเอียด ตัวเลขรวม ตาราง อาคารที่ตั้ง มวลอาคารโฟกัส |

Area focus มีสามโหมด (`state.focusAreaIds`, `state.autoFocus`):

| โหมด | ความหมาย | URL |
|---|---|---|
| `auto` (ค่าเริ่มต้น) | 3 ย่านอันดับต้นของ scope ปัจจุบันเป็น focus โดยอัตโนมัติ — หน้าแรกจึงเป็น first Aha ที่โฟกัสแล้ว | ไม่มี `areas` |
| `explicit` | ผู้ใช้เลือกย่านเอง (≤ 3) | `?areas=1d671f78-108c-4bcb-9da8-a29a3117e931,8d8ed740-cd31-4b6a-859f-096f1f3d0b0e` |
| `none` | ทุกย่านแสดงเท่ากัน ไม่มี quiet | `?areas=all` |

การเลือกย่านหนึ่งย่านต้องไม่ทำให้ “ร้านที่พบเฉพาะย่าน” กลายเป็น 100% และกราฟต้องยังเทียบทุกย่านในตัวกรอง หน้าจอบอกด้วยคำอธิบายกราฟ `… สาขาในตัวกรอง · ทุกย่าน` และตัวเลขรวมในโหมด focus ระบุ “ในโฟกัส” **ต่างจาก Luxury Brands:** ที่ระดับสถานที่ (`venueLevel()`) แถวที่ได้รายละเอียดบนแผนที่คือแถวของสถานที่นั้นจาก `scopeRows` ไม่ใช่จาก `rows` เพราะสถานที่คือ focus ของตัวเอง

## Aha แรก: ย่านก่อนสถานที่ และเห็น 3D ก่อน

เมื่อข้อมูลพร้อม แผงแสดง **สัดส่วนร้าน (ชื่อร้านไม่ซ้ำ) ที่มีสาขาใน 3 ย่านอันดับต้น** พร้อมตัวเศษ/ตัวหาร สาขา และย่านที่มีร้านเฉพาะมากที่สุด แผนที่เปิดมาเป็นเมือง 3 มิติที่ **โฟกัส 3 ย่านนั้นแล้ว** ส่วนอื่นเป็นเส้นขอบ ป้ายจาง จุดเทา และมวลอาคารจาง ปุ่มหลักคือ “ดูทุกย่าน” (ยกเลิก quiet) และ “เปรียบเทียบย่าน” ห้ามใส่ชื่อย่านหรือเปอร์เซ็นต์ตายตัวใน markup

สูตรอยู่ใน `js/area-insight.js#summarizeAreaInsight`: เลือกสูงสุด 3 Locale เรียงตามร้านไม่ซ้ำ → สาขา → stable id; ตัวเศษคือ union ของร้านทุกร้านของสาขาในย่านเหล่านั้น (ร้านที่อยู่สองย่านนับครั้งเดียว สาขาร่วมแบรนด์นับทุกร้านของมัน) ตัวหารคือร้านไม่ซ้ำทั้งหมดใน `baseRows` รวมสาขานอก Locale และสาขาที่ไม่มีพิกัด ข้อค้นพบรองใช้ `js/profile-model.js#buildOverviewInsights`

Snapshot ค่าเริ่มต้น (fixture, `tests/area-insight.test.js`):

| | ค่า |
|---|---|
| ย่าน | รัชดา-ตะวันตก 13 ร้าน/17 สาขา · สยาม 10/12 · ราชประสงค์ 8/10 |
| ข้อค้นพบ |24/39ร้าน=61.5%(แสดง62%) ·39/252สาขา |
| ภายใน Locale |101สาขา;151อยู่นอกLocale (135มีพิกัด/16ไม่มีพิกัดในdefault) |
| ร้านที่พบเฉพาะย่านมากที่สุด | รัชดา-ตะวันตก 9/13 |

กล้องแรก: preset `city` กับ `fitPitched` ที่ตรวจว่าทุกจุดยอดของ polygon ย่านโฟกัสอยู่ในจอ **ต่างจาก Luxury Brands:** padding ด้านล่างบนเดสก์ท็อปนับ legend (ไม่เกิน 45% ของความสูงแผนที่) และถ้า fit ได้ต่ำกว่า zoom 13 จะวางที่ zoom 13 (`CITY_MASSING_ZOOM` — ระดับที่มวลอาคารเมืองและโฟกัสเริ่มแสดง) โดยใช้ศูนย์กลางเดิม; มือถือแนวตั้งใช้ fit เต็มเพื่อให้เห็นทั้งสามย่าน (harness 1280×800: fit 12.82 → วางที่ 13.0; 390×844: 12.73)

กรณีพิเศษ:

- ไม่มีรายการเลย: “ไม่พบสาขาตามตัวกรองนี้” พร้อมปุ่มล้างตัวกรอง
- ไม่มี Locale ใดมีสาขา (จังหวัดนอกกรุงเทพฯ — production มี Locale เฉพาะกรุงเทพฯ — หรือผลจากตัวกรอง): ข้อค้นพบย้ายไประดับสถานที่ “{n}% ของร้านกล้องมีสาขาที่ {สถานที่อันดับแรก}” = ร้านในสถานที่อันดับแรก **ที่มีจุด host** ของ `rankVenues` ÷ ร้านทั้งหมดของการเลือก พร้อมสองสถานที่ถัดไป และปุ่ม “ดูสถานที่นี้” / “ดูสาขา”; สถานที่ที่ไม่มีจุด (เช่นที่ master พักไว้) อยู่ในรายการสถานที่ แต่ไม่ถือข้อค้นพบบนแผนที่; ช่อง “ย่าน” ใน metric tiles ไม่แสดง (out_of_scope ไม่ใช่ศูนย์) ตัวอย่าง: `?province=CMI` → 80% ที่ Central Chiangmai (4/5 ร้าน, 4/7 สาขา); `?province=PKT` → 67% ที่ Central Phuket (2/3 ร้าน, 1/5 สาขา — Central Phuket Floresta มี 2 ร้านแต่ถูก master พักพิกัดไว้)
- ไม่มีสถานที่ใดมีจุด (มีแต่ร้านที่ไม่มีสถานที่ หรือสถานที่ที่ยังไม่มี host เช่น `?province=TAK`): หัวข้อ “{สาขา} สาขา · {ร้าน} ร้าน” พร้อม “ดูสาขา” / “ล้างตัวกรอง”

## แผนที่: focus + quiet context

หลักการจากเจ้าของผลิตภัณฑ์ (22 ตุลาคม 2569, ใช้ต่อจาก Luxury Brands): **แสดงรายละเอียดเฉพาะส่วนที่กำลัง focus ส่วนที่ไม่สำคัญให้เงียบ**

| สถานะ | ส่วนที่ focus | ส่วนบริบท (quiet) |
|---|---|---|
| หน้าแรก (auto focus) | 3 ย่านอันดับต้น: สี `count`, ป้าย + ตัวนับร้าน, หมุดสีประเภท, อาคารที่ตั้ง, มวลอาคารมุมโค้ง (zoom ≥ 13) | ย่านอื่นเส้นขอบบาง ป้ายจาง; สาขานอก focus เป็นจุดเทาเล็ก; มวลอาคารจางทั้งเมือง; ไม่มีป้ายชื่อต่ำกว่า zoom 14 |
| ดูทุกย่าน (`areas=all`) | ทุก Locale ระบายสี; สาขาอยู่ใน 64 จังหวัด จึง fit เป็นมุมมองประเทศแบบ plan ที่กรอบจังหวัดเป็นตัวอ่าน | หมุดเป็นจุดเล็กตาม zoom; มวลอาคารจาง; ไม่มีอาคารมุมโค้ง |
| เลือกย่านเดียว | ย่านนั้นคงสี (ต่ำกว่า zoom 14.5) เส้นขอบเลือก อาคารที่ตั้ง มวลอาคารมุมโค้ง หมุดสีประเภท ป้ายชื่อ | เหมือนหน้าแรก |
| เปิดสถานที่ (host ของ CityMETER) | เฉพาะแถวของสถานที่นั้น (จาก `scopeRows`): หมุดสีประเภท ป้ายชื่อ และอาคารที่ตั้งสีน้ำเงิน **มองเห็นเสมอ** (venue x-ray) และกดได้; กล้อง `eye` จัดกรอบทั้งอาคารรวมหลังคา หรือ `framePoint` zoom 16 ที่จุด host เมื่อ master ไม่มีอาคารที่ยอมรับ (37 จาก 106 host เช่น Fortune Town); สถานที่ที่ไม่มี host เปิดแผงรายการได้แต่กล้องไม่ย้าย | ร้านของสถานที่อื่นเป็นจุดเทา อาคารของสถานที่อื่นถอยเป็นมวลอาคารเงียบ; มวลอาคารโปร่งลง (SCENE.eye) และอาคารที่บังสถานที่โปร่งใส |
| เลือกร้าน | หมุดที่เลือกมีวงเน้น เส้นชี้พิกัดต้นทาง popup บนเดสก์ท็อป (ชื่อร้านทุกร้านของสาขา) | ตาม focus ปัจจุบัน (ร้านในสถานที่ = ระดับสถานที่) |

กติกาที่ต้องรักษา:

- Choropleth ใช้ค่า HEX ของ LDS `count` ชุดเดียวกันทั้งสองธีม fill opacity 1 วางใต้ชั้นเส้นแรกของ basemap (`waterway`) ตัดการแสดง fill ที่ zoom ≥ 14.5 แบบสวิตช์ (DATAVIZ-03)
- สีไล่ครบ 41 ระดับของ LDS `count` (กฎเจ้าของ 2026-10-22): ค่า v ได้สีลำดับ round(40 × (v − 1) / (max − 1)) จาก 1 ถึงค่าสูงสุดของ `scopeRows` (ค่าเริ่มต้น 1 … 13) คำอธิบายแผนที่เป็นแถบไล่สี 41 ช่องพร้อมค่า 1 · กลาง · สูงสุด ตัวเลขบนช่องสีที่ contrast ต่ำกว่า 4.5:1 (ลำดับ 27–29) วางบนชิปพื้นการ์ด Locale ที่ไม่พบร้านในตัวกรองเป็น `measured_zero` พื้นที่นอก Locale (ทุกจังหวัดยกเว้นกรุงเทพฯ) คือ `out_of_scope` (EVID-05)
- หนึ่งหมุดต่อหนึ่งสาขา ไม่มี cluster; ป้าย (โลโก้หรือป้ายชื่อ) สูงสุด 250 เฉพาะ zoom ≥ 14 และเฉพาะรายการใน focus; บรรทัดสถานะแผนที่ “{n} สาขา · ป้ายชื่อ {x}/250 · บริบท {n}”
- อาคารที่ตั้งใช้สี `map.activeLayer`; มวลอาคารใช้ basemap-only tokens ไม่ใช่สีข้อมูล
- ไม่ย้ายพิกัดร้านเพื่อให้ตรงอาคารหรือป้าย; สาขาที่อยู่จุด host เดียวกันได้ช่องบนจอของตัวเองใกล้จุดต้นทาง

## Basemap, มวลอาคาร และอาคารของสถานที่ (เหมือน Luxury Brands 0.5)

`js/map-style.js#buildMapStyle(theme)` สร้าง style v8 บน `https://tiles.openfreemap.org/planet` (OpenMapTiles schema) และ glyph ของ OpenFreeMap ลำดับชั้น: พื้นดิน → landcover/park/water → **data fill (แทรกก่อน `waterway`)** → footprint 2D → ถนน/ราง → **มวลอาคาร + อาคารที่ตั้ง (แทรกก่อน `water-name`)** → ป้ายชื่อ → เส้นขอบย่าน/เส้นเลือก หมุดและป้าย ค่าสีทั้งหมดเป็น `--basemap-*` ใน `assets/theme.css` ไม่มี POI เลขที่บ้าน หรือเขตปกครอง ป้ายใช้ `name:th` ก่อน `name`; sky/fog ทำให้ระยะไกลจาง; light แบบ viewport ให้เงาอ่อนบนมวลอาคาร

| ชั้น | แหล่ง | ลักษณะ | เมื่อไร |
|---|---|---|---|
| CITY (quiet) | `building` source-layer ของ tile (`render_height`, `render_min_height`, ข้าม `hide_3d`) | `--basemap-massing-quiet`, vertical gradient, opacity 0.22 และจางตามระยะจาก focus (500 → 2,200 ม., feature-state `fade`) | zoom ≥ 13, เฉพาะ 3D |
| FOCUS (detail) | tile เดียวกันถอดด้วย `js/mvt.js` เฉพาะ tile ที่แตะย่านโฟกัส (≤ 9 tiles, z14) → offset ออก d แล้วลบมุมโค้ง r → extrude ที่ `render_height + 0.35 m` | `--basemap-massing-focus`; r = 4 px ในหน่วยเมตร (3–12 ม.), d = r/2.5 (≥ 1 ม.) | zoom ≥ 13; plan แสดง footprint มุมโค้งแบบแบน |
| HOST (อาคารที่ตั้ง) | `data/venue-buildings.geojson` ผ่าน `js/buildings.js` (layer `camera-venue-buildings-3d` / `-outline`) | `map.activeLayer`, เส้น `map.selectedStroke`; attribution “© OpenStreetMap contributors · CityMETER” (ต่อรูปทรง: © OpenStreetMap contributors (ODbL 1.0)) | extrusion zoom ≥ 14, outline zoom ≥ 12; 2D/3D |

**ลำดับวาด = ลำดับความลึก**: ชั้นอาคารของสถานที่ติดตั้งก่อน แล้วมวลอาคารทุกชั้นถูกแทรก **ก่อนหน้า** มัน (`installMassing({beforeId: HOST_LAYERS.extrusion})`) เพราะ fill-extrusion ทุกชั้นใช้ depth buffer ร่วมกันและชั้นโปร่งใสยังเขียน depth ห้ามสลับลำดับชั้นเหล่านี้

**venue x-ray** (`js/venue-xray.js`): custom layer `venue-xray` (renderingMode `3d`, แทรกก่อน `water-name` หลังมวลอาคารทุกชั้น) วาดรูปทรงอาคารของสถานที่ (ผนัง หลังคา earcut เส้นขอบ) ทับทุกอย่าง โดยล้าง depth เฉพาะกรอบจอของสถานที่ (scissored clear) แล้ววาดด้วย depth test ของตัวเอง เห็นเสมอไม่ว่าจะ pan / tilt / zoom (zoom ≥ 13, เฉพาะ 3D) กดได้สองทาง: ชั้น fill-extrusion `camera-venue-buildings-3d` และ `hitTest` สามเหลี่ยมของ x-ray เอง (จับผนังตึกสูงที่ MapLibre หาไม่เจอ) host ที่ไม่มีรูปทรงอาคารที่ผ่านเกณฑ์ไม่มี x-ray

**ฉากระดับสถานที่ (`SCENE.eye`)**: มวลอาคารเมือง 0.16 ชั้นโฟกัส 0.62 อาคารที่ยืนระหว่างกล้องกับอาคารของสถานที่ย้ายไปชั้น `focus-massing-occluding` ที่ 0.14 (ทดสอบกล่องบนจอทุก `moveend`) อาคารของสถานที่ทึบเสมอ

## กล้อง (`js/camera.js`)

| preset | ใช้เมื่อ | ค่า |
|---|---|---|
| `plan` | ปิด 3D (ปุ่ม “3D”, `?view3d=0`) หรือกรอบกว้างกว่า 0.3° | pitch 0 |
| `city` | ภาพรวม/first Aha ในโหมด 3D | pitch 56, bearing 28, FOV 36.87 |
| `model` | ย่าน (และระดับสถานที่เมื่อปิดมุมสถาปนิก) | pitch 60, bearing 28, **FOV 14** → ใกล้ axonometric เส้นตั้งตั้งตรง |
| `eye` (“มุมสถาปนิก”) | ระดับสถานที่เป็นค่าเริ่มต้น (`?cam=model` ปิด); ปิดใช้ในระดับอื่นและใน 2D; บนมือถือรอจน sheet ปิด | pitch 75, FOV 24 (ขอบฟ้านอกจอ — MapLibre 5.6.2 วาด fill-extrusion ผิดเมื่อขอบฟ้าเข้าจอ); `frameVenue` fit จุดยอดพื้น + หลังคาของอาคาร ซูมออกไม่เกิน 1 ระดับจาก fit ของ footprint |

`fitPitched` เริ่มจาก `cameraForBounds` แล้วปรับ zoom ทีละ 0.1 จนทุกจุดยอดอยู่ใน viewport ที่มี padding **ต่างจาก Luxury Brands:** padding ของมุมมอง 3D บนเดสก์ท็อปนับ legend (`pitchedPadding`) และ `fitMap` ไม่วางภาพรวม `city` ต่ำกว่า zoom 13 บนจอกว้าง bearing 28° คงค่าตระกูลเดียวกับ Luxury Brands (ย่านโฟกัสของ Camera Shops เรียงแนวตะวันออกเฉียงเหนือ สยาม/ราชประสงค์ → รัชดา-ตะวันตก) MapLibre ไม่มีกล้อง orthographic — FOV แคบคือวิธีมาตรฐาน

## Breadcrumb และความเข้ากันได้กับ production

แถวบนของแผง: **ประเทศไทย › จังหวัด › ย่าน › สถานที่** (`js/breadcrumb.js`) รหัสจังหวัดคือ `abbrEn` ของ production (`base/info/lv0`, 77 จังหวัดใน `js/model.js#PROVINCES` เช่น BKK, CMI, NST, UTT) **ต่างจาก Luxury Brands:** ระดับย่านคือ **Locale ของ production จริง** — `?neighborhood={uuid}` ตรงกับ `/v3/citymeter/BKK/L/{uuid}` (เส้นทางที่ production ใช้ได้ ตรวจ 22 ต.ค. 2569) และโปรไฟล์ย่านมีลิงก์ “ย่านนี้ใน CityMETER” ไปที่นั่น ระดับที่สี่คือสถานที่: id ของ host (Shopping Center id; Grocery record id รองรับเมื่อ master จับคู่) หรือชื่อสถานที่ล้วน; ข้อเสนอ `/v3/citymeter/{CODE}/L/{uuid}/V/{host id}?d=cameraShops` ยังเป็น Inference ไม่มีใน production demo (static) ใช้ `?province=BKK&neighborhood=<locale uuid>&place=<host id>` และรับชื่อจังหวัดไทย/อังกฤษจากลิงก์เก่า

กติกา: ระดับย่านของสถานที่มาจาก point-in-polygon ของจุดตัวแทนสถานที่ (ไม่ใช่ชื่อ); สถานที่นอก Locale หรือไม่มีจุด host ข้ามระดับย่าน (ประเทศไทย › ภูเก็ต › Central Phuket; ประเทศไทย › กรุงเทพมหานคร › Siam Square One); นอกกรุงเทพฯ ไม่มีระดับย่านเพราะ production ไม่มี Locale — ห้ามสร้าง id ขึ้นเอง; ร้านเป็นหัวเรื่องของแผง ไม่ใช่ crumb; บนจอแคบเมื่อมี 4 ระดับ ระดับบนพับไว้หลัง “…” โดยสองระดับสุดท้ายเห็นเสมอ; `document.title` = breadcrumb · Camera Shops · CityMETER

## กรอบจังหวัด (country view)

`data/provinces.geojson` คือกรอบของ **64 จังหวัดที่มีสาขา** (OpenGISData-Thailand, CC BY 4.0, อ้างอิงกรมการปกครอง; id = รหัสจังหวัดของ production, `dopaCode` = รหัส 2 หลักของ DOPA ซึ่งตรงกับรหัสของ production) สกัดด้วย `scripts/extract-provinces.mjs` จากแถวใน `data/camera.json` ปัดพิกัด 5 ตำแหน่ง ไม่ simplify; วงที่เหลือน้อยกว่า 4 จุดหลังปัดถูกตัด (รูเล็กหนึ่งรูในร้อยเอ็ด) `js/provinces.js` ระบายสีตาม `count` (ร้านไม่ซ้ำต่อจังหวัด จากแถวที่ผ่านตัวกรองทุกตัว **ยกเว้น** ตัวกรองจังหวัด) ต่ำกว่า zoom 9; ระดับค่าเริ่มต้น 1–7 · 8–14 · 15–21 · 22–28 · 29–36 (กรุงเทพฯ 36 ร้าน) เหลือเส้นกรอบถึง zoom 12 กรอบที่เลือกเป็นเส้นทึบถึง zoom 13 ป้ายชิปจังหวัด (glyph location_city) แสดงต่ำกว่า zoom 9.5 แบบหลบกันชน คำอธิบายแผนที่สลับเป็น “จังหวัด · จำนวนร้าน” แผงภาพรวมมีรายการ “จังหวัดที่มีร้านกล้อง” 10 แถวแรก ที่เหลือพับใน `<details>` “อีก n จังหวัด” การกดกรอบ ป้าย หรือรายการ = `selectProvince(code)` → ตัวกรองจังหวัด + breadcrumb + กล้องไปที่ข้อมูลของจังหวัด (`?province=CODE`) กรอบเป็นบริบทและทางเดิน ไม่ใช่ขอบเขตการปกครองที่ยืนยัน EVID-05: จังหวัดในชุดกรอบที่ไม่มีร้านในตัวกรอง = measured_zero, จังหวัดที่ไม่มีสาขา = out_of_scope (ไม่วาด)

## ร้าน สาขา และการนับ (เฉพาะ Camera Shops)

- **ร้านของสาขา**: `brand` = ร้านหลักจาก `02_STORES`; `brands[]` = ทุกร้านที่นับได้จาก `11_STORE_BRANDS` (retail_banner และ host_counter_banner ไม่รวม operator) ร้านหลักก่อน; `bannerSegments[]` = ประเภทของแต่ละร้านจาก `01_BRANDS` เรียงตรงกัน รวม 260ความสัมพันธ์บน253สาขา (native261รวมoperator1ซึ่งไม่นับร้าน)
- **การนับ**: ร้าน = ขนาดของเซตชื่อร้าน (`brandSet`) ในทุกตัวนับ (สรุป, Aha, ย่าน, จังหวัด, กราฟ, โปรไฟล์); สาขา = จำนวนแถว; สัดส่วนประเภทร้านนับคู่ (สาขา × ร้าน) ตามประเภทของแต่ละร้าน (`segmentMixOf`, matrix) จึงรวมกันได้มากกว่าจำนวนสาขา; ร้านเฉพาะ/ร่วมคิดจากชื่อร้าน; “สาขาอื่นของร้านนี้” หาร้านจากทุกสาขาที่มีร้านนั้น (ร้าน Insta360 นับเป็นสาขาของ BIG CAMERA ด้วย); การค้นหาตรงกับทุกร้านของสาขา ชื่อสาขา สถานที่ และจังหวัด
- **ตัวกรองประเภทร้าน** (snapshot): กล้องหลายแบรนด์ 183 สาขา / 14 ร้าน · มือสองและฟิล์ม 8 / 6 · ร้านแบรนด์ผู้ผลิต 29 / 7 · โดรนและอุปกรณ์ภาพ 12 / 8 · ช่องทางขายเสริม 7 / 3 (Power Buy, King Power และเคาน์เตอร์ Power Mall 5 แห่งในชื่อ Power Mall)
- **ป้ายบนหมุด:** ใช้43verifiedretailermarksตามregistry;ชื่อร้านเป็นidentity/fallbackเมื่อไม่มีlogo ไม่ใช้manufacturer/operator markแทน และคงoriginalbytes/proportions/neutralbacking
- **ป้ายแสดงผลไม่เปลี่ยนข้อมูล**: `BANNER_LABELS`, `FORMATS`, `hostTypeLabel`, `SEGMENT_SHORT` เปลี่ยนเฉพาะข้อความบนจอ ไม่เปลี่ยนแถว คีย์ค้นหา หรือจำนวน

## Host และอาคารที่ตั้ง (เฉพาะ Camera Shops)

147persistent named venuesแยกจาก107acceptedCityMETERhosts(192rows);61rowsไม่มีacceptedhost แต่44ในกลุ่มนี้มีsourcepointที่ผ่านเกณฑ์ของตัวเอง อีก17ไม่มีพิกัด. `geometryRole`/`coordinateSource` บอกที่มาของจุด ส่วน`mallId`/`hostKind`/`venueJoin`บอกhostidentity. Refreshadapterไม่บังคับจุดธุรกิจให้เท่าvenuepoint และไม่copyไปvenueโดยไม่มีexplicithostrole.

Buildingcontexts129rows=125inside+4named-host outside;source103features(69footprints+34parts)เดิม ไม่มีgeometryใหม่. ทดสอบactualselectedpointกับqualifiednamedhostเท่านั้น;LeicaSiamParagonpointใหม่อยู่นอกfootprintจึงคงcontextและไม่เข้าcontainment. ไม่อ้างshopunitหรือnewfull-part-coverageQA.

PowerBuyCanonstockistเป็นmanufacturerlistingที่ไม่ระบุวันเผยแพร่ จับชื่อสาขา/เลขที่นำหน้า/province-districtกับcurrentretailerlist;ไม่ใช่currentstock. FutureParkCentralbasementและRobinson3FคงสองoutletIDs. AVVALUEqualifyเฉพาะVanillaMoon4F;HQ65แยกจากที่อยู่showroom. Lidoeventreferencepointเป็นhostไม่ใช่UNIT2Funit/entrance. Chidlompointretained21Oct/API23Oct403 ไม่อ้างfreshrevalidation.

Currentlogoassets:43storemarks,83venuefiles/139labelsจาก147venues;identityrolesและรายการขาดอยู่ในregistry. Historicalhost-onlypipeline/proposalsและcountsของ0.5.0อ่านในVERIFICATIONเท่านั้น.

## แผงอ่านข้อมูล

สี่โหมด (overview / neighborhood / venue / store) และปุ่มย้อนกลับ ทุกปุ่มส่ง `data-action` (`js/panel.js`): `select-area`, `select-store`, `select-venue`, `select-province`, `search-brand`, `back`, `explore-top`, `clear-focus`, `open-charts`, `open-table`, `clear-filter`, `crumb-country`, `crumb-province`, `crumb-area`, `crumb-venue`, `crumb-expand`, `toggle-3d` ตัวกรองยุบอยู่ใน disclosure พร้อมตัวนับและชิป ช่องค้นหาอยู่บนสุดเสมอ

| ส่วน | Camera Shops |
|---|---|
| metric tiles | ร้าน (photo_camera) · สาขา (storefront) · สถานที่ (local_mall, สถานที่ไม่ซ้ำ) · ย่าน (map; ไม่แสดงเมื่อไม่มี Locale ใดมีสาขา) |
| โปรไฟล์ย่าน | อันดับ, ร้าน/สาขา/สถานที่/เฉพาะย่าน, ประเภทร้าน (ร้าน/สาขา), สถานที่ในย่าน, ร้านที่พบเฉพาะย่าน/พบในย่านอื่นด้วย, ขอบเขตย่าน “Locale ของ CityMETER” + ลิงก์ “ย่านนี้ใน CityMETER” |
| สถานที่ | โลโก้สถานที่ (ถ้ามี), ประเภท host เป็นไทย, ย่าน, ร้าน/สาขา/GLA, ลิงก์ศูนย์การค้า (เฉพาะศูนย์การค้า), ประเภทร้าน, รายการสาขา (ร้านทุกร้านของสาขา + ชั้น/ห้อง) |
| ร้าน | หัวเรื่อง = ร้านหลัก; “ร่วมกับ …” = ร้านที่ร่วมหน้าร้าน (กดเพื่อค้นหา); ป้ายสถานะ; สถานที่ (หรือรูปแบบช่องทางสำหรับร้านริมถนน) · ย่าน (“นอกย่าน” เมื่อมีจุดแต่อยู่นอก Locale; “—” เมื่อไม่มีจุด) · รูปแบบ (ช่องทาง + `FORMATS` เมื่อให้ข้อมูลเพิ่ม) · ที่อยู่ · พิกัด (+ “ร่วมพิกัดกับอีก n สาขา”) · ตรวจเมื่อ; ลิงก์ หลักฐาน · สถานะ (เมื่อต่างจากหลักฐาน) · พิกัด · แผนที่ของร้าน (ลิงก์ของร้านเอง ไม่ถอดเป็นพิกัด) |
| สถานะ (`describeStatus`) | พบในแหล่งข้อมูล · ตัวตนหน้าร้านรอตรวจ (6) · รวมรายการรอตรวจ (1) · ที่ตั้งขัดกัน (1) · ที่อยู่ติดต่อ (1) · ปิดถาวร (ข้อเท็จจริง; ไม่มีในชุดนี้) |
| ความแม่นพิกัด (`describeGeometry`) | Officialbusinesspoint,sourcepublishedbranchpoint,hostreference,datedretainedcross-datasetreferenceหรือmissing;ไม่ยืนยันunit/entrance/currentstock และvenueholdไม่ลบindependentvalidbusinesspoint |

## กราฟเปรียบเทียบย่าน

| key | ชื่อแท็บ | คำถาม | การเข้ารหัส | สี |
|---|---|---|---|---|
| `centers` (อันดับ) | ย่านที่มีร้าน | ย่านใดมีร้านกล้องหลากหลาย | แท่งแนวนอน ร้านไม่ซ้ำ + สาขากำกับ | ระดับ `count` เดียวกับแผนที่ |
| `mix` | บุคลิกของย่าน | ย่านใดเด่นร้านประเภทไหน | ตารางตัวเลข ย่าน × ประเภท **ทุกช่องขนาดเท่ากัน** (`table-layout: fixed`, `<colgroup>`); นับคู่ (สาขา × ร้าน) ตามประเภทของแต่ละร้าน | ระดับ `count` ของช่อง 0 = measured zero มีเส้นขอบศูนย์ |
| `compare` | ร้านเฉพาะ / ร่วม | ร้านของย่านต่างหรือซ้ำกับย่านอื่นเพียงใด | แท่งซ้อน เฉพาะย่าน / พบในย่านอื่นด้วย | series.07 (hexagon) / series.09 (dash) |

กราฟใช้ `scopeRows` และไฮไลต์ย่านที่เลือก กรณี compare มีน้อยกว่า 2 ย่านแสดงปุ่ม “ดูทุกย่าน” “เฉพาะ/ร่วม” หมายถึงภายในข้อมูลที่เลือกเท่านั้น

## สัญญาหน้าจอ

| ส่วน | พฤติกรรมที่ต้องรักษา |
|---|---|
| โครงหลัก | Map first; header 48 px; แผงขวา `min(max(300px,28%),440px)` มี breadcrumb บนสุด; ถาดกราฟย่อ 52 px |
| แถบเครื่องมือ | ดูทั้งหมด · กรุงเทพฯ · ย่าน (toggle) · 3D (toggle) · มุมสถาปนิก (toggle; กดอยู่เป็นค่าเริ่มต้นที่ระดับสถานที่ ปิดใช้ในระดับอื่นและใน 2D) · วิธีใช้ · ข้อมูล (มือถือ) |
| มือถือแนวตั้ง | แผนที่เต็มจอ; bottom sheet ≤ 64dvh; Aha ย่อบนแผนที่ (มี breadcrumb) เมื่อแผงปิด; เลือกย่านขณะ sheet เปิดใช้กรอบ 2D แล้วปรับ 3D เมื่อปิด sheet; breadcrumb 4 ระดับพับเป็น “…”; ไม่มี horizontal overflow ที่ 390 px |
| หมุด | หนึ่งหมุดต่อสาขา; ขนาด 3 ระดับตาม zoom (<12, 12–14, ≥14); context dots สีเทา นอกลำดับ Tab; หมุดใน focus มี roving tab stop และลูกศรเลื่อน |
| ป้ายบนหมุด |43verifiedstoremarks/44approved;ขาดCameraExchangeใช้namefallback ไม่แทนด้วยmanufacturerlogo | `data/brand-logos.json`, existinglogo/pincomponents |
| ป้ายย่าน | ชิปหมึกเข้ม (`--area-label-*`) + ตัวนับร้าน กดได้; quiet = โปร่ง 72% นอก focus; ซ่อน < zoom 11.5 |
| ป้ายจังหวัด | ชิปแบบเดียวกัน glyph location_city + ตัวนับร้าน; แสดง < zoom 9.5; กด = เจาะลงจังหวัด |
| คำอธิบายแผนที่ | < zoom 9 “จังหวัด · จำนวนร้าน” · ≥ 9 “ย่าน · จำนวนร้าน”; หมุด, อาคารที่ตั้ง (ซ่อนเมื่อไม่มีอาคารของสถานที่บนแผนที่ — `.map-panel.no-host-buildings`), อาคารโฟกัส/บริบท, “สีประเภทร้าน”; ซ่อนช่วงค่าเมื่อ zoom ≥ 14.5 |
| Pictogram | metric tiles, หัวข้อส่วน และป้ายจังหวัด; ตกแต่ง (aria-hidden) ข้อความคือความหมาย; ซ่อนจนกว่าฟอนต์โหลด (`pictograms-ready`) |
| โลโก้สถานที่ | กล่องพื้นรองจากทะเบียนที่หัวแผงสถานที่ (56 px), แถวสถานที่ (28 px), ช่องสถานที่ของร้าน (36 px); บทบาทเป็นข้อความเมื่อไม่ใช่โลโก้เฉพาะสถานที่; ไม่มีโลโก้ = ไม่มีกล่อง |
| ตาราง | overlay เหนือถาดกราฟ: ร้าน/สาขา (ทุกร้านของสาขา), สถานที่ (หรือช่องทางเมื่อไม่มีสถานที่), ย่าน (“—” เมื่อไม่มีพิกัด), สถานะ, พิกัด, ลิงก์หลักฐาน (สถานะเฉพาะเมื่อต่างจากหลักฐาน); ไม่มี CSV |
| ข้อความ | ร้าน/สาขา/สถานที่/ย่าน; ไม่มี caveat banner, research badge, workflow residue; คงสถานะจริง วันที่ แหล่งข้อมูล หน่วยนับ |
| Dev hook | `window.__citymeter` (state, map, update, fitMap, fitPitched, applyPreset, buildMapStyle) สำหรับจูนใน console; ไม่ใช่ API |

## ภาษาภาพและ LDS

LDS **0.9.7 / v0.9.7-owner.1**, `standalone-0.9.7-r1`, normative SHA-256 `d3085cbc0a50195f1cbf0c77b1d77c0d19b84364daf2948eb367348d65432d96` ค่าที่ใช้จริงอยู่ใน `assets/theme.css` (ไม่เปลี่ยนจาก Luxury Brands 0.5) และ `js/scales.js` (LUT 41 ค่าของ `count`, หน่วย “ร้านไม่ซ้ำ”) ประเภทร้านใช้ series.01–.05 ตามลำดับ `SEGMENTS`

หัวเรื่อง Arvo / IBM Plex Sans Thai Looped 700, เนื้อหา Bai Jamjuree 400/600, ตัวเลข JetBrains Mono tabular, ไอคอน Material Symbols Rounded nav-7 FILL 0 / wght 300 (ปุ่ม 3D/มุมสถาปนิกใช้ข้อความ) **ข้อยกเว้นทดลอง (เจ้าของ 22 ต.ค. 2569)**: pictogram 8 glyph จากตระกูลเดียวกัน (`assets/icons/material-pictogram-300.woff2`, 1,724 bytes, sha256 `259de66e057385539f2352657951597b1cad7206c1ca03205373e7f39d8edcb4`) — ร้าน photo_camera · สาขา storefront · สถานที่ local_mall · ย่าน map · จังหวัด location_city · เฉพาะย่าน star · GLA square_foot · ประเภทร้าน category; nav-7 bytes ไม่เปลี่ยน ไม่มี decorative bracket หรือ colored left rail คง focus ring ธีม auto/light/dark ไม่เปลี่ยนความหมายข้อมูล Location-Intelligence-Profile ไม่นำมาใช้ (ไม่มีเมตริกธุรกิจในชุดนี้)

## ที่มาของเจตนาผลิตภัณฑ์

[Product Statement](../PRODUCT_STATEMENT.md) ตามโครง Who → What → Which → How ของ Landometer Master Brand Brief v0.5.3 §7.2 และ CityMETER Product Brief v6 §1.6 รายละเอียดข้อมูลอ่าน [DATA_METHOD.md](../DATA_METHOD.md) และ [วิธีนิยามย่าน](../docs/NEIGHBORHOOD_METHOD.md) เอกสาร handoff ไม่เผยแพร่ brief ภายในฉบับเต็ม ลิงก์ Drive/Sheet ภายใน หรือสิทธิ์ใช้งานเพิ่มเติม

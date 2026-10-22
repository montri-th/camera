# ย่าน = Locale ของ CityMETER production

**Release:** 0.5.0 · **Checked:** 2026-10-22 · **File:** `data/neighborhoods.geojson` (metadata `version` 2026-10-22-r2)

Camera Shops ไม่ได้วาดขอบเขตย่านขึ้นเอง (ต่างจาก Luxury Brands ที่นิยาม “แกนย่าน” 10 แห่ง): ย่านคือ **Locale** ของ CityMETER production (Locale Insight) — หน่วยเดียวกับหน้า `https://landometer.com/v3/citymeter/BKK/L/{uuid}` ทำให้ระดับ ย่าน ใน breadcrumb และในลิงก์ “ย่านนี้ใน CityMETER” เป็นตัวตนเดียวกับ production

## เลือก Locale ใด

- ทุก Locale ของกรุงเทพฯ ที่ **ครอบจุด host ของสถานที่ร้านกล้องอย่างน้อยหนึ่งแห่ง** (สถานที่ที่ research master จับคู่แล้ว) — 26 จาก 847 Locale ของกรุงเทพฯ (production `base/info/lv1`); ตลาดคลองเตยหลุดออกใน revision 13:13 UTC เพราะมีเพียง BigC พระราม 4 ซึ่ง master ยังไม่จับคู่
- production ยังไม่มี Locale นอกกรุงเทพฯ จังหวัดอื่นจึงไม่มีระดับ ย่าน (สถานที่ในจังหวัดอื่นข้ามจาก จังหวัด › สถานที่) และไม่มีการสร้าง Locale หรือเทศบาลขึ้นเอง

## รูปทรง

- ถอดจาก vector tile `GET /api/v2/citymeter-v3/base/mvt/ML/{z}/{x}/{y}` (layer `base-ML`, props id/code/nameTh/nameEn) ที่ z15 รอบจุด host แต่ละจุด
- ชิ้นของ Locale เดียวกันจากหลาย tile ถูก union เป็นรูปเดียว ลดจุดด้วย tolerance 0.000005° (ราว 0.5 ม.) และปัด 6 ตำแหน่ง — เพื่อแสดงผล ไม่ใช่ขอบเขตรังวัด
- id ของ feature = uuid ของ Locale; `name` = `nameTh` ของ production; `nameEn`; `provinceCode` BKK; `productionUrl` = `/v3/citymeter/BKK/L/{uuid}?d=shoppingCenter`; `status` `production_locale`; `boundaryAuthority` = CityMETER production Locale (หน่วยวิเคราะห์ ไม่ใช่เขตปกครอง)

## การจับสาขาเข้าย่าน

- point-in-polygon ของจุด host (ไม่ใช้ชื่อสถานที่ ไม่ใช้ย่านที่ใกล้ที่สุด ไม่ขึ้นกับตัวกรอง) — `js/neighborhoods.js#assignNeighborhood`
- **ตรวจกับ production ทุกครั้งที่ build:** สำหรับทุกจุด host ในกรุงเทพฯ ผล point-in-polygon บนรูปทรงที่แสดง ต้องเท่ากับ Locale ที่ `GET /base/locatePoint?lat=&lng=` ของ production คืนมา — 2026-10-22: **31/31** (`metadata.membershipCheck`) ถ้าไม่ตรง `scripts/build-camera-data.py` หยุดทันที
- จากการลดจุด รอยต่อของ Locale ข้างเคียงสามคู่ซ้อนกันเป็นแถบแคบ (พร้อมพงษ์-เหนือ/ใต้ เฉลี่ยกว้างราว 0.5 ม. ตลอด 1.4 กม.; ราชประสงค์/สยาม และวิทยุ/ศาลาแดง ต่ำกว่า 0.1 ม.) จุดที่ตกในแถบใช้ `priority` แล้ว id ตัดสิน คงที่ทุกครั้ง ไม่มีจุด host ของชุดนี้ตกในแถบ
- สาขาที่อยู่นอกทุก Locale (ต่างจังหวัด) แสดงเป็น “นอกย่าน” สาขาที่ไม่มีพิกัด (55) แสดง “—” ทั้งสองแบบยังอยู่ในตัวหาร

## ย่านในชุดนี้ (สาขาค่าเริ่มต้น)

อันดับตามจำนวนร้านไม่ซ้ำ (snapshot 2026-10-22, ค่าบนจอคำนวณใหม่ตามตัวกรอง): รัชดา-ตะวันตก (Fortune Town) 13 ร้าน · 17 สาขา, ราชประสงค์ 8 · 10, สยาม 8 · 10, แฟชั่น 4 · 5, บางกะปิ 4 · 4, รัชดา-ตะวันออก 3 · 3, พร้อมพงษ์-ใต้ 3 · 2, หลักสอง 3 · 2, คลองสาน 2 · 3, ซีคอน 2 · 3 … รวม 26 ย่าน 82 สาขา; อีก 151 สาขาอยู่นอกย่านหรือยังไม่มีพิกัด

## ข้อจำกัด

- Locale เป็นหน่วยวิเคราะห์ของ CityMETER ไม่ใช่เขต/แขวง และชื่ออาจไม่ใช่ชื่อที่คนทั่วไปใช้เรียก
- รูปทรงเป็นสำเนาเพื่อแสดงผล ณ วันที่ดึง; production อาจปรับ Locale ภายหลัง — build ใหม่จะตรวจ membership อีกครั้ง

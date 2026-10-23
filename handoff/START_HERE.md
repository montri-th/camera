# CityMETER Camera Shops — Developer Handoff

รุ่นข้อมูล 0.5.1 · 23 ต.ค. 2569 · ข้อมูลตรวจถึง 23 ต.ค. 2569 · สถาปัตยกรรมเดียวกับ CityMETER Luxury Brands 0.5

เริ่มอ่าน `source/handoff/README.md` จากนั้น Product Statement (`source/PRODUCT_STATEMENT.md` + `source/handoff/product-statement.json`), Product Brief และ Implementation Plan ในโฟลเดอร์ `source/handoff` ทั้ง `.md` และ `.json` ใช้คู่กัน

เข้าโฟลเดอร์ `source` แล้วรัน `npm test` และ `npm start` เปิด http://127.0.0.1:4173/

ชุดนี้มี source code (ES modules), datasets, verified assets, unit tests, JSON Schema และ acceptance criteria สคริปต์ refresh ปัจจุบันคือ `scripts/refresh-camera-master.py`; host-only scripts ของ 0.5.0 เก็บไว้สอบกลับ มีสคริปต์ province frames, pictograms, manifest/bundle และ live-byte verification อ่าน `source/AGENTS.md` ก่อนแก้ไข

หน่วยบนจอ: **ร้าน** = ชื่อร้านไม่ซ้ำ (BIG CAMERA, Sony Store …) · **สาขา** = หนึ่งแถว/หนึ่งจุดขาย · **สถานที่** = named venue ที่ master ระบุตัวตน; CityMETER host และอาคารต้องมีการยืนยันแยก · **ย่าน** = Locale ของ CityMETER production

ข้อมูลปัจจุบัน: 253 แถว (252 ในค่าเริ่มต้น), อนุมัติ 44 ชื่อ มีแถว 40 ชื่อและ 39 ชื่อในค่าเริ่มต้น, 147 venues, 236 points, 129 building contexts (125 inside + 4 named contexts) และ 103 source features เดิม คิวเครือข่าย 1,411 รายการไม่นับใน public camera totals

อ่าน `source/DATA_METHOD.md` ฉบับ 0.5.1 ก่อน ใช้ inputs/cache ภายในนอก repository กับ refresh adapter โลโก้อ่าน coverage จากทะเบียนไฟล์ล่าสุด ผล verification ของ 0.5.0 เป็นประวัติ; refresh QA และ live attestation ต้องอ่านตามวันที่ใน `source/handoff/VERIFICATION.md` และ release receipt

เว็บจริง: https://montri-th.github.io/camera/
Repository: https://github.com/montri-th/camera

`RELEASE_RECEIPT.json` ผูกชุดส่งต่อกับ commit, ผล GitHub Pages และ live attestation ส่วน `evidence/` เป็นหลักฐานหน้าจอ (harness) และผลเทียบ hash ของไฟล์บนเว็บ แยกจาก source ที่ commit แล้ว

# CityMETER Camera Shops — Developer Handoff

รุ่นเผยแพร่ 0.5.0 · 22 ต.ค. 2569 · ข้อมูลตรวจถึง 22 ต.ค. 2569 · สถาปัตยกรรมเดียวกับ CityMETER Luxury Brands 0.5

เริ่มอ่าน `source/handoff/README.md` จากนั้น Product Statement (`source/PRODUCT_STATEMENT.md` + `source/handoff/product-statement.json`), Product Brief และ Implementation Plan ในโฟลเดอร์ `source/handoff` ทั้ง `.md` และ `.json` ใช้คู่กัน

เข้าโฟลเดอร์ `source` แล้วรัน `npm test` และ `npm start` เปิด http://127.0.0.1:4173/

ชุดนี้มี source code (ES modules มีคอมเมนต์สัญญาทุกโมดูล), datasets, verified assets, 106 unit tests, JSON Schema 1.4.0, acceptance criteria, สคริปต์สร้างข้อมูล (`scripts/host-links/`, `scripts/build-camera-data.py`, `scripts/extract-provinces.mjs`, `scripts/build-pictogram-font.py`), สร้าง manifest/bundle และตรวจ live bytes อ่าน `source/AGENTS.md` ก่อนแก้ไข

หน่วยบนจอ: **ร้าน** = ชื่อร้านไม่ซ้ำ (BIG CAMERA, Sony Store …) · **สาขา** = หนึ่งแถว/หนึ่งจุดขาย · **สถานที่** = host ของ CityMETER ที่ research master จับคู่ (Shopping Center) · **ย่าน** = Locale ของ CityMETER production

เว็บจริง: https://montri-th.github.io/camera/
Repository: https://github.com/montri-th/camera

`RELEASE_RECEIPT.json` ผูกชุดส่งต่อกับ commit, ผล GitHub Pages และ live attestation ส่วน `evidence/` เป็นหลักฐานหน้าจอ (harness) และผลเทียบ hash ของไฟล์บนเว็บ แยกจาก source ที่ commit แล้ว

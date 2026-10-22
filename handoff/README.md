# เริ่มงานต่อ — CityMETER Camera Shops

รุ่นส่งต่อ 0.5.0 · ปรับล่าสุด 22 ตุลาคม 2569 · ข้อมูลตรวจถึง 22 ตุลาคม 2569

ชุดนี้ส่งต่อให้ developer หรือ coding agent พัฒนาต่อจาก repository ที่ใช้งานจริง Camera Shops ใช้สถาปัตยกรรมและสัญญาเดียวกับ Luxury Brands 0.5 — **เห็นเมือง 3 มิติที่โฟกัส 3 ย่านอันดับต้นก่อน แสดงรายละเอียดเฉพาะส่วนที่ focus ส่วนอื่นให้เงียบ** — กับชุดข้อมูลร้านกล้อง: ร้าน (shop banner) แยกจากสาขา หน้าร้านร่วมแบรนด์เป็นสาขาเดียว ย่านเป็น Locale ของ CityMETER production และจุด/อาคารของสถานที่ตาม venue join และ building join ของ research master (revision 2026-10-22 13:13 UTC) ที่ตรวจกับ CityMETER Shopping Center ของ production

Live: [Camera Shops](https://montri-th.github.io/camera/) · Source: [GitHub](https://github.com/montri-th/camera) · ผลิตภัณฑ์คู่กัน: [Luxury Brands](https://montri-th.github.io/luxurybrands/)

## อ่านตามลำดับนี้

| คนอ่าน | เครื่องอ่าน | ใช้ทำอะไร |
|---|---|---|
| [../PRODUCT_STATEMENT.md](../PRODUCT_STATEMENT.md) | [product-statement.json](product-statement.json) | Winning strategy: Who / What / Which / How, quality bar, ป้ายหลักฐาน, hypotheses — อ่านก่อนเปลี่ยนสิ่งที่หน้าแรกบอก |
| [PRODUCT_BRIEF.md](PRODUCT_BRIEF.md) | [product-brief.json](product-brief.json) | ขอบเขตข้อมูลสามชั้น + focus modes, 3D first Aha (และ Aha ระดับสถานที่นอกกรุงเทพฯ), focus/quiet, basemap, massing, camera, breadcrumb (ย่าน = Locale), venue x-ray, กรอบจังหวัด, pictogram, โลโก้สถานที่, การนับร้าน (bannerContract), host (hostContract), แผงสี่โหมด, กราฟ, invariants |
| [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) | [implementation-plan.json](implementation-plan.json) | โมดูลและข้อต่อ งานที่ทำในรุ่นนี้ backlog ของ Camera Shops acceptance criteria วิธีทดสอบและ release |
| [VERIFICATION.md](VERIFICATION.md) | `handoff-manifest.json` (สร้างตอนออกรุ่น) | ผลตรวจแยกระดับ (unit / rendered harness / live) และ hash ของทุกไฟล์ |
| README นี้ | [handoff.schema.json](handoff.schema.json) | สัญญาโครงสร้างของ JSON ทั้งสี่ (schema 1.4.0 — รับทั้ง Luxury Brands และ Camera Shops) |

`product-statement.json`, `product-brief.json` และ `implementation-plan.json` เขียนด้วยมือและต้องแก้คู่กับ Markdown ส่วน `handoff-manifest.json` สร้างด้วย `npm run handoff:manifest` เท่านั้นและไม่ถูก track ใน git (อยู่ใน bundle ที่ `source/handoff/handoff-manifest.json`) ห้ามแก้ hash ด้วยมือ

ใช้ [DATA_METHOD.md](../DATA_METHOD.md), [NEIGHBORHOOD_METHOD.md](../docs/NEIGHBORHOOD_METHOD.md) (ย่าน = Locale), [BUILD_CARD.md](../docs/BUILD_CARD.md) และ [CHART_SELECTION.md](../docs/CHART_SELECTION.md) เป็นบริบทผลิตภัณฑ์และข้อมูล

## เปิดในเครื่อง

```sh
npm start      # http://127.0.0.1:4173/
npm test       # 106 unit tests บนข้อมูลจริงและ fixture tile
```

เป็น static site ไม่มี build step ไม่ต้อง `npm install` ต้องมี Node ≥ 20 และ Python 3 แผนที่ต้องเข้าถึง unpkg.com (MapLibre 5.6.2) และ tiles.openfreemap.org (tiles + glyphs) ถ้าเครื่องทดสอบถูกบล็อก ใช้ harness แบบ stub tiles ตาม VERIFICATION

สร้างข้อมูลใหม่ต้องมีไฟล์ทำงานภายใน (CSV ของแต่ละแท็บใน research master และไฟล์อาคารของ master — ไม่อยู่ใน repository) รัน `scripts/host-links/01…04` ([README](../scripts/host-links/README.md)) แล้ว `npm run data:build -- --research … --build … --buildings … --lux-logos …` และ `npm run data:provinces -- <provinces.geojson> --commit … --sha256 … --retrieved …` build หยุดเองเมื่อ venue join ของ master ไม่ตรงกับ production (host, จุด, จังหวัด), เมื่ออาคารไม่ตรงกับแท็บ `13_BUILDINGS` หรือเมื่อการจับย่านไม่ตรงกับ production `locatePoint`

## สิ่งที่ห้ามทำหล่น

- ขอบเขตข้อมูลสามชั้น: `rows` ขับหมุด ตัวเลข ตาราง; `scopeRows` ขับ Aha, choropleth, กราฟ, ฐานเทียบเฉพาะ/ร่วม และ (ระดับสถานที่) สาขาของสถานที่ที่เปิดอยู่
- หน่วย: ร้าน = ชื่อร้านไม่ซ้ำ (`bannersOf`), สาขา = แถว; หน้าร้านร่วมแบรนด์เป็นสาขาเดียว; ตัวกรองประเภทร้านเป็น projection (สำเนา) ไม่แก้แถว; ไม่ใช้ “แบรนด์” เป็นหน่วยบนจอ
- ย่าน = Locale ของ production เท่านั้น (id = uuid, membership ตรง `locatePoint`); นอกกรุงเทพฯ ไม่มีย่าน ไม่สร้างเอง
- พิกัดและอาคารตาม venue join / building join ของ research master เท่านั้น (pipeline ตรวจและแปลง ไม่เพิ่ม ไม่ย้าย ไม่ยกระดับ) เป็นจุดตัวแทนสถานที่ ไม่ใช่ประตูร้าน; สถานที่ที่ master พักไว้ไม่มีจุดและแสดง “พิกัดรอตรวจ”; ข้อเสนอ host link ของ app ส่งให้ทีม research ไม่เผยแพร่; missing คง missing (ไม่ geocode ไม่อ่านพิกัดจากลิงก์แผนที่ที่ยังไม่ตรวจ ไม่ใช้ nearest)
- 3D first Aha: preset `city` โฟกัส 3 ย่านอัตโนมัติ (`auto`); จอกว้างไม่ต่ำกว่าซูม 13; ตัวเลขคำนวณใหม่ตามตัวกรอง
- focus + quiet, basemap/massing เป็นบริบท, กล้องไม่ขยับข้อมูล, venue x-ray และลำดับเลเยอร์ (host extrusion ก่อน massing, x-ray ท้ายสุด) — ตาม Luxury Brands 0.5
- หนึ่งสาขาต่อหนึ่งหมุด; ป้ายชื่อร้าน (ไม่มีโลโก้ร้าน) ≤ 250 เฉพาะ zoom ≥ 14 และส่วนที่ focus
- ไม่มีเบอร์โทร ลิงก์ Drive/Docs หรือ credentials ในไฟล์สาธารณะ
- LDS 0.9.7 tokens เท่านั้น; nav-7 ไม่แตะ; pictogram ร้าน = `photo_camera`

## เริ่มด้วยงานหนึ่งชิ้น

```text
อ่าน AGENTS.md, PRODUCT_STATEMENT.md, handoff/PRODUCT_BRIEF.md และ handoff/product-brief.json
ทำเฉพาะงาน Nxx ใน handoff/IMPLEMENTATION_PLAN.md
ตรวจ source และสถานะจริงก่อนแก้ อย่าถือว่าทำเสร็จแล้ว
คงขอบเขตข้อมูลสามชั้น หน่วย ร้าน/สาขา, Locale เป็นย่าน, venue/building join ของ research master, หลัก 3D first + focus + quiet, camera presets, breadcrumb, source data, identities, coordinates และ LDS tokens
เพิ่มหรือปรับ tests ใน tests/ สำหรับพฤติกรรมที่เปลี่ยน แล้วตรวจ browser ที่ 390 และ 1280 ทั้งสองธีม
ส่งรายการไฟล์ที่แก้ ผลตรวจที่ทำจริง และประเด็นที่ยังไม่ยืนยัน
อย่าเปลี่ยนสูตร metric, taxonomy หรือสีข้อมูลเงียบ ๆ และอย่ารายงานว่าเผยแพร่แล้วจากผลในเครื่อง (ใช้ npm run verify:live)
```

## ตรวจความครบก่อนรับช่วง

1. `RELEASE_RECEIPT.json` ใน bundle ระบุ commit ที่เผยแพร่ ให้ `git checkout <commit>` แล้วเทียบ `handoff/handoff-manifest.json` กับไฟล์จริง (`npm run handoff:manifest` บน working tree ที่สะอาดต้องให้ hash เดิม)
2. `npm test` ต้องผ่าน 106/106
3. `npm run verify:live` ต้องผ่านทุกไฟล์ที่เผยแพร่
4. เปิด 390 px และ desktop ทั้งสองธีม ไล่ flow: 3D first Aha → ดูทุกย่าน (กรอบจังหวัด) → ย่านรัชดา-ตะวันตก (มุมโมเดล, ลิงก์ Locale) → Fortune Town (มุมสถาปนิก, จัดกรอบที่จุดสถานที่ — master ยังไม่มีอาคาร) → MBK CENTER (อาคารสีน้ำเงินจาก parts ของ master) → ร้าน → หน้าร้านร่วมแบรนด์ (BIG CAMERA + Power Mall) → FUJIFILM House ที่ Siam Square One (พิกัดรอตรวจ) → จังหวัดเชียงใหม่และภูเก็ต (Aha ระดับสถานที่) → กราฟ → ตาราง → help

ชุดส่งต่อเผยแพร่เฉพาะ source/data/assets ที่อยู่ใน repository และบทสรุปประยุกต์ ไม่แนบ research master, private Drive/Sheet URLs, credentials, brief ภายในฉบับเต็ม หรือ LDS/token library ทั้งชุด

# CityMETER Camera Shops — first useful value

This Build Card records the first-use contract for this research demo. It uses LDS 0.9.7, release `v0.9.7-owner.1`, standalone document `lds-0.9.7-landometer-standalone-r1`, SHA-256 `d3085cbc0a50195f1cbf0c77b1d77c0d19b84364daf2948eb367348d65432d96`. It is not a blanket conformance or browser-pass certificate. The contract is the Luxury Brands 0.5 one, re-based on shop banners (ร้าน) and CityMETER production Locales (ย่าน).

## First Aha — AHA-01

**First useful understanding:** ร้านกล้องในข้อมูลที่เลือกกระจุกตัวอยู่ในย่านใด และย่านเหล่านั้นมีร้านใดร่วมกัน — ผู้ใช้เริ่มจากระดับย่านได้โดยไม่ต้องเรียนรู้ตัวกรองก่อน

Default copy (release 0.5.0, snapshot 2026-10-22): **“61% ของร้านกล้องมีสาขาใน 3 ย่านนี้”** — รัชดา-ตะวันตก สยาม และราชประสงค์ รวมกันมี **23 จาก 38 ร้านไม่ซ้ำ** (39 จาก 233 สาขา) พร้อมข้อค้นพบรอง “ร้านที่พบเฉพาะย่านมากที่สุด: รัชดา-ตะวันตก 9/13” ซึ่งคำนวณจากทุกย่านในตัวกรอง ตัวเลขทั้งหมดคำนวณจากข้อมูล ไม่ใช่ค่าคงที่ใน markup; แผนที่เปิดเป็นเมือง 3 มิติ (preset `city`) ที่โฟกัส 3 ย่านนั้นโดยอัตโนมัติ บนจอกว้างไม่ต่ำกว่าซูม 13 เพื่อให้มวลอาคารเมืองปรากฏ และเว้นคำอธิบายแผนที่ไม่ให้บังย่านใกล้กล้อง

**One useful action:** the default state already focuses the returned `areaIds` (focus mode `auto`) using fixed point-in-polygon membership; map, counters and table use the focused set while the Aha, choropleth and charts keep the whole filtered scope. Visible actions: “ดูทุกย่าน” (lifts the automatic focus, `areas=all`) and “เปรียบเทียบย่าน”; with focus off the action becomes “โฟกัส 3 ย่านนี้”. When a filter changes, the insight, denominator and automatic focus are recomputed. The default share URL carries no `areas` parameter.

**Where no Locale holds a row** (every province outside Bangkok — production has no Locale there — or a filter without Bangkok rows): the finding moves to the venue level, “{share}% ของร้านกล้องมีสาขาที่ {สถานที่}” with numerator/denominator (e.g. เชียงใหม่ 80% at Central Chiangmai, 4 of 5 ร้าน; ภูเก็ต 100% at Central Phuket) and the action “ดูสถานที่นี้”; the ย่าน tile is dropped instead of showing a misleading 0.

## Evidence cue and calculation

Sources: [data/camera.json](../data/camera.json) and the 27 production Locales in [data/neighborhoods.geojson](../data/neighborhoods.geojson), checked 2026-10-22. Calculation: [summarizeAreaInsight](../js/area-insight.js) on rows selected by `filterRows`. Rank Locales by distinct banners, then outlet count, then stable id; take at most three. Count the union of banners across their rows (a co-branded outlet contributes each counted banner); do not add per-area counts. The share denominator is all distinct banners in the selected rows, including rows outside every Locale and rows without a point. `assignedPos` counts selected rows assigned to any Locale.

| Default area (Locale) | Production Locale uuid | Outlets | Distinct banners |
|---|---|---:|---:|
| รัชดา-ตะวันตก (Fortune Town) | `1d671f78-108c-4bcb-9da8-a29a3117e931` | 17 | 13 |
| สยาม | `8d8ed740-cd31-4b6a-859f-096f1f3d0b0e` | 12 | 9 |
| ราชประสงค์ | `228edb69-6e1a-42f7-8001-f3eed7ee016d` | 10 | 8 |

The three area counts sum to 30 banner appearances, their union is **23 banners** of 38. Default scope is 233 retail outlet listings (the World Camera contact location is not a point of sale); 85 of them fall in a Locale, 148 are outside or without coordinates. Descriptive shares within this research dataset — not a market census, sales, stock or demand measure.

If no area has a selected point, keep the selected totals and use the venue-level finding (or a plain count when no venue exists); never translate a zero numerator into “no camera shops here”. An empty selection gets a clear empty state and a reset route.

## Prerequisites and safe paths — AHA-01-A / AHA-01-B

- **Essential for the area insight:** the public core dataset and the Locale polygons load and parse on an HTTP(S) origin.
- **Not prerequisites:** account, personal information, location or device permissions, sharing, chart libraries, WebGL, map tiles, building geometry, a logo image.
- Core counts, filters, source links and table remain usable if optional geometry fails (the area insight is then hidden rather than fabricated); a map failure leaves the insight, charts and table usable; a missing core dataset gets an actionable error/retry route.

## Icon contract — ICON-01

UI icons use the approved Material Symbols Rounded nav-7 subset (`assets/icons/material-nav-300.woff2`, SHA-256 `d7e283106ed2898726b24504c4e0f5ad524292984a90a4d29553c7dcf53b9657`, unchanged). Metric tiles, section headings and province chips use the 8-glyph pictogram subset (owner test exception 2026-10-22) rebuilt for Camera Shops with ร้าน = `photo_camera` U+E412 instead of Luxury's diamond: `assets/icons/material-pictogram-300.woff2`, 1,724 bytes, SHA-256 `259de66e057385539f2352657951597b1cad7206c1ca03205373e7f39d8edcb4`, byte-reproducible from the same source font (sha256 `32e40117…202e7`) by `scripts/build-pictogram-font.py`, which also checks that each codepoint carries the named icon. The text label stays the meaning; `menu` is for the mobile data sheet only; `open_in_new` marks only links that open a new browsing context.

## Verification scope

`npm test` (102 tests) covers the default snapshot and exact Locale ids, banner ranking and union, co-branded outlets, shared-edge assignment, filtered denominators, missing geometry, empty cases, segment projection and the province-level venue finding. Actual first paint, map actions, responsive Thai layout, keyboard operation and theme behaviour are recorded separately in [handoff/VERIFICATION.md](../handoff/VERIFICATION.md).

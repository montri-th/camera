# Reviewed crosswalk: research venue label -> CityMETER production Grocery record (hypermarket host).
# Proposals only since the research master revision 2026-10-22 13:13 UTC (see crosswalk_sc.py): the master
# marks these venues 'มีชื่อ venue รอตรวจทะเบียน' and its join covers Shopping Center records.
# Used only where the Shopping Center layer has no record of the host (Big C hypermarkets and three
# Lotus's hypermarkets). Basis "address": the production grocery address (house number, หมู่, ตำบล)
# equals the store address in 02_STORES. Coordinates are decoded from the production grocery overlay
# tiles at z13 (quantisation about 1 m) and stay host-complex points, not shopfronts.

GROCERY = {
    'บิ๊กซี พระราม 4': ('50612a8f-b5a9-4374-8efa-271e4b44fd0b', 'address', 'BigC พระราม 4 — 2929 ถ.พระราม 4 แขวงคลองตัน'),
    'บิ๊กซี กาฬสินธุ์': ('839d4dca-1787-48ea-b76a-949c0a238d61', 'address', 'BigC กาฬสินธุ์ — 101/2-3 ถ.ถีนานนท์'),
    'บิ๊กซี สัตหีบ': ('ec92c35e-3240-4a6d-aae2-5c36d0e65944', 'address', 'BigC สัตหีบ ชลบุรี — 88/18 หมู่ 3'),
    'โลตัส อมตะนคร': ('04eff8bd-a16c-4c43-bdd7-c2adfd212364', 'address', 'โลตัส อมตะ — 700/75 ม.5 ต.คลองตำหรุ'),
    'บิ๊กซี ตาก': ('f57581a9-0762-4a8a-bfd2-e94c2463549a', 'address', 'BigC ตาก — 18/3 ถ.พหลโยธิน ต.ระแหง'),
    'บิ๊กซี นครพนม': ('512f56d1-eb56-42b1-9fb7-47697fa529de', 'address', 'BigC นครพนม — 9/2 ซ.ร่วมมิตร ถ.นิตโย'),
    'โลตัส ปากช่อง': ('c766ed31-7faf-468a-82dc-acab1e2b5dfc', 'address', 'โลตัส ปากช่อง — 289 ม.18'),
    'บิ๊กซี นครสวรรค์': ('c0186d41-acf2-437d-873a-3291504e5f26', 'address', 'BigC นครสวรรค์1 — 320/10 ถ.สวรรค์วิถี'),
    'บิ๊กซี ศรีมหาโพธิ': ('3c7a2a3e-cc79-4e08-bc6f-6c48da275163', 'address', 'BigC ศรีมหาโพธิ — 618 หมู่ 7 ต.ท่าตูม'),
    'บิ๊กซี ลพบุรี': ('d930cf07-c881-43bc-96ac-872c3c435bb0', 'address', 'BigC ลพบุรีบิ๊กซีใหญ่ — 2 หมู่ 1 ต.ท่าศาลา'),
    'บิ๊กซี ศรีสะเกษ': ('080ffee6-b6dc-46b9-91fd-6768daf05e70', 'sole', 'BigC ศรีสะเกษ — the only Big C hypermarket in the province, ต.หญ้าปล้อง as in the store address'),
    'บิ๊กซี สตูล': ('9d8c2a8b-bb6b-4ac2-a7d8-4413fdd543cf', 'address', 'BigC สตูล — 959 หมู่ 7 ต.คลองขุด'),
    'บิ๊กซี สมุทรสงคราม': ('a7ffc9d8-93f9-4ba0-85e6-b1f78f7ccaab', 'address', 'BigC สมุทรสงคราม — 2/19 หมู่ 1 ต.บางแก้ว'),
    'บิ๊กซี สระแก้ว': ('0e9a3b9c-5fca-482e-9857-1d8054fde9c8', 'address', 'BigC สระแก้ว — 352 ถ.สุวรรณศร'),
    'โลตัส สุราษฎร์ธานี': ('beb5e81e-f541-479b-bc4e-39944f580f27', 'address', 'โลตัส สุราษฏร์ธานี — 9/1 ม.3 ถ.เลี่ยงเมือง'),
    'บิ๊กซี สุโขทัย': ('9af7003d-f264-4460-a40b-e11dc6efce4e', 'address', 'BigC สุโขทัย — 68 หมู่ 2 ต.บ้านกล้วย'),
    'บิ๊กซี อำนาจเจริญ': ('ff2e7685-b602-441d-994e-e13b198717a0', 'address', 'BigC อำนาจเจริญ — 477 หมู่ 7 ต.บุ่ง'),
    'บิ๊กซี อ่างทอง': ('37efbcb4-cacf-42ea-857e-bbf74d048cdb', 'address', 'BigC อ่างทอง — 24 ถ.โพธิ์พระยา-ท่าเรือ'),
    'บิ๊กซี เชียงราย 2': ('22a2948f-1e5e-4ad5-9186-30fa1a0f9628', 'address', 'BigC เชียงรายสนามบิน — 58 หมู่ 17 ต.บ้านดู่'),
    'บิ๊กซี เลย': ('2c92f4e5-398e-4564-a926-c6f84fc06426', 'address', 'BigC เลย — 114 หมู่ 9 ต.นาอาน'),
}

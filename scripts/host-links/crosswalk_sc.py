# Reviewed crosswalk: research venue label (07_VENUES.venue_name) -> CityMETER production record.
#
# Basis codes
#   name  same centre, Thai/English spelling of the same name after normalisation
#   alias documented alternate name of the same complex (e.g. CDC = Crystal Design Center)
#   dup   CityMETER holds duplicate records at one point; the record whose name matches is used
#   sole  the only centre of that operator in the province (e.g. "ROBINSON" in Chachoengsao)
#
# Role since the research master revision 2026-10-22 13:13 UTC: the master's own venue join (07_VENUES,
# 02_STORES, 12_SPATIAL_JOIN) is the source of record and 03_verify_master_join.py publishes only that join.
# This crosswalk is the app's independent review: for venues the master has not joined it becomes a proposal
# (host_link_proposals.csv, checked against the production polygon of the research province, never published);
# for venues the master has joined it is a cross-check (73 of the 74 it covers agree; โลตัส สุราษฎร์ธานี is joined
# by the master to a Shopping Center record where this review had a Grocery record). No nearest-centre matching.

SC = {
    # Bangkok
    'Center One': ('ef95c55a-8f20-4423-93e6-961677e3dc8c', 'name', 'Center One Shopping Plaza'),
    'Crystal Design Center': ('067b6b0c-6df8-45b5-a151-843b230b4b33', 'alias', 'CDC'),
    'Fortune Town': ('99d5a136-45be-4f8e-93df-86ef1a970f2f', 'name', 'Fortune Town'),
    'MBK Center': ('c5663239-f88d-452e-ba37-33ed869c420a', 'name', 'MBK CENTER'),
    'Seacon Bangkae': ('6c99fa9c-dcd5-4653-9818-94862e66fb03', 'name', 'Seacon Bangkae'),
    'Seacon Square Srinakarin': ('ce22c5d8-36fa-491a-af34-43aec1df3e8f', 'name', 'Seacon Square Srinagarindra'),
    'Siam Square One': ('f887ec38-d819-4b59-9bb1-42e3d0ccaee2', 'name', 'Siam Square One'),
    'The Mall Lifestore Thapra': ('f16ce8f9-a541-44e4-bd4d-c23340e75455', 'name', 'The Mall Lifestore Tha Phra'),
    'พาราไดซ์ พาร์ค': ('bdb23ad3-8c5c-4fcb-adbb-6dbadef1ab7c', 'name', 'Paradise Park'),
    'เซ็นทรัล รามอินทรา': ('ab3a7d64-39a2-4731-9f67-65d4a1c025eb', 'name', 'Central Ramindra'),
    'เทอร์มินอล21 พระราม 3': ('fb6ea0f0-821e-40d0-ae77-77cdb67399b3', 'name', 'เทอร์มินอล 21 พระราม 3'),
    'โรบินสัน ลาดกระบัง': ('29db1844-0e8c-4fdb-9c26-5076818d9860', 'name', 'Robinson Lifestyle Latkrabang'),
    # Provinces
    'เซ็นทรัล กระบี่': ('53b99719-6017-4fbf-8b1c-f4812bc50a65', 'name', 'Central Krabi'),
    'โลตัส กระบี่': ('48099444-ac7c-4177-9243-742d1f21f56a', 'name', 'โลตัส กระบี่'),
    'โรบินสัน กาญจนบุรี': ('8dd3fd43-3935-4c09-9be2-3b907df55cf2', 'name', 'ห้างโรบินสันกาญจนบุรี'),
    'โรบินสัน กำแพงเพชร': ('feb2cdb2-0787-4a23-994d-f6fc64fc5df2', 'name', 'โรบินสัน ไลฟ์สไตล์ กำแพงเพชร'),
    'Central Khon Kaen': ('e2a69fb7-ab4d-49bb-bf5e-2c4a54a20584', 'dup', 'Central Khon Kaen; CityMETER also holds "เซ็นทรัล พลาซ่า" c14dcdd6 at the same point'),
    'Central Khon Kaen Campus': ('a9d5e68e-e757-4f23-9a29-866d1187c40c', 'name', 'Central Khonkaen Campus'),
    'เซ็นทรัล จันทบุรี': ('985f6758-38d0-4fb0-a63e-e5a38a4e008b', 'name', 'Central Chanthaburi'),
    'โรบินสัน จันทบุรี': ('2012593f-d5de-4e8f-85a6-c4796ea33dc2', 'name', 'โรบินสัน ไลฟ์สไตล์ จันทบุรี'),
    'โรบินสัน ฉะเชิงเทรา': ('d8ac0461-7260-410c-bb25-010d773911b9', 'sole', 'ROBINSON — the only Robinson centre in ฉะเชิงเทรา'),
    'Terminal 21 Pattaya': ('102e81d3-6f9c-41b6-977d-69a963f21c50', 'name', 'Terminal 21 Pattaya'),
    'เซ็นทรัล ชลบุรี': ('923c7714-eed6-4e27-97cc-d492b1c56160', 'name', 'Central Chonburi'),
    'เซ็นทรัล ศรีราชา': ('1dfa57a2-d5f1-4e92-8cb6-cc6278c06d08', 'name', 'Central Si Racha'),
    'โรบินสัน ชลบุรี': ('7d5afe89-7263-491a-ad11-8c2186dbdf30', 'name', 'Robinson Lifestyle Chonburi'),
    'โรบินสัน บ่อวิน': ('13a87a0f-de4d-4679-b1c8-c54df76b45d7', 'name', 'Robinson Lifestyle Bowin'),
    'โรบินสัน ชัยภูมิ': ('4b5ff6fc-3318-4af4-b7f1-ebba9a979a0c', 'name', 'Robinson Lifestyle Chaiyaphum'),
    'โลตัส ชุมพร': ('05802777-2c34-42c5-9067-a9800a986a6c', 'name', 'โลตัส ชุมพร'),
    'โรบินสัน ตรัง': ('60ccebce-313b-4cd8-94d5-52522fe43840', 'name', 'โรบินสัน สาขาตรัง'),
    'โรบินสัน แม่สอด': ('b3c4ae6b-0556-4309-85d7-68165233ecbb', 'sole', 'Robinson Lifestyle Center — the only Robinson centre in ตาก (แม่สอด)'),
    'โลตัส นครนายก': ('0e3e9b85-5ba5-47ab-82e3-15fffcbdc086', 'name', 'โลตัส นครนายก'),
    'เซ็นทรัล นครปฐม': ('391ae671-aa13-41e7-b0dd-79fb28491185', 'name', 'Central Nakhonpathom'),
    'เซ็นทรัล ศาลายา': ('c6c29ecb-d53b-4a1e-bf11-d683004d887f', 'name', 'Central Salaya'),
    'The Mall Korat': ('8d60ae29-5e23-44e6-8682-79cebd9293fe', 'name', 'The Mall Korat'),
    'เซ็นทรัล นครศรีธรรมราช': ('09ec1ff1-6dab-4485-b69c-f219ea350957', 'name', 'Central Nakhon Si'),
    'เซ็นทรัล นครสวรรค์': ('dcf47496-020e-401d-b72d-700d91ac06f4', 'name', 'Central Nakhonsawan'),
    'เซ็นทรัล นอร์ทวิลล์': ('c547f550-ed30-4329-9cfb-3756d41c1e35', 'name', 'Central Northville'),
    'โรบินสัน ราชพฤกษ์': ('3e662c6d-5611-4cc7-abf2-7c3c46d577ff', 'name', 'Robinson Lifestyle Ratchaphruek'),
    'โรบินสัน ศรีสมาน': ('adb987d0-183b-4967-b8ac-72f91ee9fe79', 'name', 'Robinson Sri Samarn'),
    'โรบินสัน บุรีรัมย์': ('332ef569-d102-4e1a-9226-24ddabf116a9', 'sole', 'Robinson — the only Robinson centre in บุรีรัมย์'),
    'Future Park Rangsit': ('488ab587-e675-4a2b-983e-f47687507dc2', 'alias', 'Future Park & Zpell (one complex)'),
    'เซียร์ รังสิต': ('7f6cd6f4-09fa-4f18-a803-079398af620d', 'name', 'Zeer Rangsit'),
    'โลตัส ปทุมธานี': ('928b3b60-5de4-4ab0-a331-4ddc6c474dfe', 'name', 'โลตัส ปทุมธานี'),
    'มาร์เก็ตวิลเลจ หัวหิน': ('6d59eb45-0138-4bad-8552-43d74fcc2fbb', 'name', 'Hua Hin Market Village'),
    'โลตัส ประจวบคีรีขันธ์': ('92cee3b0-558b-4aa1-aefb-ac82229c8d32', 'name', 'โลตัส ประจวบคีรีขันธ์'),
    'โรบินสัน ปราจีนบุรี': ('85c79028-47f0-49d4-942d-5311d2a5c902', 'name', 'โรบินสันปราจีนบุรี'),
    'เซ็นทรัล อยุธยา': ('cdee5528-17b0-4d59-b4fe-3b18b95ee288', 'name', 'Central Ayutthaya'),
    'แฮปปี้พลาซ่า พิจิตร': ('9a19360a-5985-458a-bd75-102a148a5c23', 'address', 'ห้างแฮปปี้พลาซ่าพิจิตร — CityMETER address 39 ถ.สระหลวง equals the store address; duplicate "Happy Plaza" 98aa0f7d sits at the same point'),
    'เซ็นทรัล พิษณุโลก': ('5aae1dde-36fe-4f05-8d14-136026b2ce80', 'name', 'Central Phitsanulok'),
    'โรบินสัน ฉลอง': ('9e72e0be-f6e0-44cf-aab7-63217ed265a9', 'name', 'Robinson Lifestyle Chalong'),
    'โรบินสัน ถลาง': ('d1227887-6ec5-44e5-b55e-73bd4ed49fc2', 'name', 'Robinson Lifestyle Thalang'),
    'เสริมไทยคอมเพล็กซ์ มหาสารคาม': ('e2014687-0dc8-4a7a-a375-e684c099f249', 'name', 'Sermthai Complex'),
    'โรบินสัน มุกดาหาร': ('891b0203-157d-406a-88f7-077ea6ab8527', 'sole', 'Robinson — the only Robinson centre in มุกดาหาร'),
    'ซ็นทรัลพลาซา ระยอง': ('c9e60abf-a12c-493f-9b53-c3ded9b362ef', 'name', 'Central Rayong'),
    'โรบินสัน บ้านฉาง': ('ecbf6978-7f3d-4cc1-b84b-7d73eea45a1e', 'name', 'Robinson Lifestyle Ban Chang'),
    'โรบินสัน ราชบุรี': ('114e32e3-8556-4a92-94f9-ec1677ca0237', 'name', 'โรบินสัน ราชบุรี Robinson'),
    'โลตัส บ้านโป่ง': ('4d0cc085-e5a7-4045-86d2-2fb21be88b2d', 'name', 'โลตัส บ้านโป่ง'),
    'โรบินสัน ร้อยเอ็ด': ('2a052907-1da1-424a-9cea-5ab9b578ffd4', 'name', 'Robinson Roi-Et'),
    'โรบินสัน ลพบุรี': ('6578e31a-5573-4fb8-a0a4-804fcf2a8ec7', 'name', 'Robinson Lifestyle Lopburi'),
    'เซ็นทรัล ลำปาง': ('121ab74b-9c35-444c-b35e-e6999847e60b', 'name', 'Central Lampang'),
    'โรบินสัน สกลนคร': ('d0d794ea-9128-4115-859a-d3dc40f58a5f', 'name', 'Robinson Sakon Nakhon'),
    'Central Hat Yai': ('d349b1da-fb0c-49b1-970b-9b3a96ee313e', 'name', 'Central Hatyai'),
    'โลตัส สงขลา': ('f08ca0bc-4528-470a-a5e7-eb4d7d361299', 'name', 'โลตัส สงขลา'),
    'มาร์เก็ตวิลเลจ สุวรรณภูมิ': ('3fbb3ecf-6e34-4822-858d-4a5296047813', 'name', 'Market Village Suvarnabhumi'),
    'โรบินสัน สมุทรปราการ': ('fad1000d-455c-451b-8ca9-401081321dd9', 'name', 'โรบินสัน ไลฟ์สไตล์ สมุทรปราการ'),
    'เซ็นทรัล มหาชัย': ('fa046f19-c779-4f66-9196-bc35e44afc7f', 'name', 'Central Mahachai'),
    'โรบินสัน สระบุรี': ('fe128b2e-cec5-4be8-bea4-1cc27be44123', 'name', 'Robinson Saraburi'),
    'โรบินสัน สุพรรณบุรี': ('6bfba7eb-ef01-49c9-8f62-614393724479', 'sole', 'Robinson — the only Robinson centre in สุพรรณบุรี'),
    'เซ็นทรัล สุราษฎร์ธานี': ('a34bbbe8-7e1d-403e-831b-584f22f426df', 'name', 'Central Surat Thani'),
    'เซ็นทรัลเฟสติวัล สมุย': ('bf38b191-2416-43e4-b9f3-08d364b3362e', 'name', 'Central Samui'),
    'โรบินสัน สุรินทร์': ('b89a6b95-9d26-4ae1-aaf9-5902f020ec73', 'sole', 'Robinson — the only Robinson centre in สุรินทร์'),
    'โลตัส หนองบัวลำภู': ('60f82416-9581-4288-bcd4-738c4a30f1ed', 'name', 'โลตัส หนองบัวลำภู'),
    'โลตัส อุดรธานี': ('d54c06d1-4868-4d5b-80b8-9d3ac7710d49', 'name', 'โลตัส อุดรธานี (not อุดรธานี 2)'),
    'โลตัส อุตรดิตถ์': ('1a40f599-bbcc-40f9-b49f-8bfafd83af79', 'name', 'โลตัส อุตรดิตถ์'),
    'เซ็นทรัล อุบลราชธานี': ('c2535636-fee0-44ef-9aa7-22af6db62e85', 'name', 'Central Ubon'),
    'เซ็นทรัล เชียงราย': ('2d0af19c-d147-408d-9814-f24e04539252', 'name', 'Central Chiangrai'),
    'เซ็นทรัล เชียงใหม่ (AIR PORT)': ('39e885a0-1c1e-4653-9b14-218c827c6034', 'name', 'Central Chiangmai Airport'),
    'โรบินสัน เพชรบุรี': ('e38b2920-bdff-4c1e-955e-e59f78363665', 'name', 'Robinson Lifestyle Phetchaburi'),
    'โลตัส เพชรบูรณ์': ('4a0387bd-d85b-4c6d-84b4-61d60374f9bc', 'name', 'โลตัส เพชรบูรณ์'),
    'มาร์คโฟร์ แพร่': ('916405d9-09ad-4d8d-a544-637a8c13be6b', 'address', 'Mark Four Plaza — CityMETER address 416 หมู่ 9 ถ.ภูเก็ต equals the store address; the duplicate "มาร์คโฟร์ พลาซ่า" 08cd68dd has no address'),
    'ท็อปส์ ซูเปอร์สโตร์ พะเยา': ('b7b3fa3f-5264-43ee-8f35-0b9f391427de', 'address', 'ท็อปส์ พลาซ่า พะเยา — CityMETER address 500 หมู่ 12 ท่าวังทอง equals the store address'),
    'เทอร์มินอล21 โคราช': ('dca79d47-f819-48ba-ba71-afaa3e12596b', 'name', 'เทอมินอล 21 โคราช (spelling used in the store address)'),
}

# Labels this review left unmatched (no CityMETER record found that identifies the same place). The master later
# joined two labels this review had missed — Ayutthaya Park → Ayutthaya City Park (477fed7e) and
# แจ่มฟ้าช้อปปิ้งมอลล์ → Jampha Shopping Mall Lamphun (b125fd95) — so they are no longer listed here.
UNMATCHED = {
    'Lit Bangkok Hotel': 'hotel, not a CityMETER shopping centre',
    'Maneeya Center North': 'office building, not a CityMETER shopping centre',
    'Panasiri Resident': 'residential building, not a CityMETER shopping centre',
    'The Rich Biz Home': 'building, not a CityMETER shopping centre (เดอะริช พลาซ่า is a different place)',
    'แพชชั่น ระยอง': 'no Passione / แหลมทอง record in ระยอง',
    'ไอที พลาซ่า สำโรง': 'no IT Plaza record; Imperial World Samrong (4ac671fa) has no address to confirm the same building',
    'เม-ญ่า ไลฟ์สไตล์ เชียงใหม่': 'only a tenant record (Tops Wine Cellar Maya) exists; tenant points are not used as the venue',
    'เจียง-ฟิวเจอร์ หนองคาย': 'no matching record in หนองคาย',
    'ไชยแสง สิงห์บุรี': 'CS Park ไชยแสง sits in ต.ต้นโพธิ์; the store address is ต.บางพุทรา — not confirmed',
}

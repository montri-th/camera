import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {filterRows,summarize,summarizeFirstInsight,pointFeatures,countBrands} from '../js/model.js';

const data=JSON.parse(readFileSync(new URL('../data/camera.json',import.meta.url)));
const current=filterRows(data.rows,{cohort:'current'});
// CityMETER Shopping Center ids: Fortune Town, centralwOrld, Siam Paragon.
const topIds=[
 '99d5a136-45be-4f8e-93df-86ef1a970f2f',
 'cda925e0-2b45-4611-acdc-fa9cc13e2b89',
 '49b5afdc-2436-48bc-8a89-007ac5541d98',
];

// Snapshot fixture (research 2026-10-22): a regression check, never a UI constant.
test('retained host Aha counts 22 unique banners in 32 of 233 selected outlets',()=>{
 const first=summarizeFirstInsight(current,data.centers);
 assert.deepEqual(first.centerIds,topIds);
 assert.deepEqual(first.centers.map(c=>[c.name,c.brands,c.pos]),[
  ['Fortune Town',13,17],['centralwOrld',7,9],['Siam Paragon',7,6],
 ]);
 assert.equal(first.brands,22);
 assert.equal(first.totalBrands,38);
 assert.equal(first.share,22/38*100);
 assert.equal(first.pos,32);
 assert.equal(first.totalPos,233);
});

test('multi-host action selects the same rows, banners and mapped feature identities',()=>{
 const first=summarizeFirstInsight(current,data.centers);
 const selected=filterRows(data.rows,{cohort:'current',mallIds:new Set(first.centerIds)});
 assert.equal(selected.length,first.pos);
 assert.equal(countBrands(selected),first.brands);
 assert.deepEqual(pointFeatures(selected).features.map(f=>f.id),selected.map(r=>r.id));
 assert(selected.every(r=>topIds.includes(r.mallId)));
 assert.equal(summarizeFirstInsight(selected,data.centers).share,100);
});

test('a real banner listed at three hosts contributes once, not three banners',()=>{
 const big=current.filter(r=>r.brand==='BIG CAMERA'&&r.brands.length===1&&topIds.includes(r.mallId));
 assert.equal(new Set(big.map(r=>r.mallId)).size,3);
 const first=summarizeFirstInsight(big,data.centers);
 assert.equal(first.centers.length,3);
 assert.equal(first.centers.reduce((n,c)=>n+c.brands,0),3);
 assert.equal(first.brands,1);
 assert.equal(first.totalBrands,1);
 assert.equal(first.share,100);
 assert.equal(first.pos,big.length);
});

test('host Set intersects cohort, search, segment and individual-host filters',()=>{
 const ids=new Set(topIds);
 const selected=filterRows(data.rows,{cohort:'current',mallIds:ids,search:'Sony',segment:'manufacturer_brand_store'});
 assert.equal(selected.length,2);
 assert(selected.every(r=>ids.has(r.mallId)&&r.brand==='Sony Store'&&r.segment==='manufacturer_brand_store'));
 assert.equal(summarizeFirstInsight(selected,data.centers).brands,1);
 const one=filterRows(data.rows,{cohort:'current',mallIds:ids,mallId:topIds[0]});
 assert.equal(one.length,17);
 assert.deepEqual(filterRows(data.rows,{mallIds:new Set()}),[]);
 const excludedCenter=data.centers.find(c=>!ids.has(c.id));
 assert.deepEqual(filterRows(data.rows,{mallIds:ids,mallId:excludedCenter.id}),[]);
});

test('filtered insight uses its own selected denominator and summarize ordering without mutation',()=>{
 const selected=filterRows(data.rows,{cohort:'current',province:'กรุงเทพมหานคร',segment:'imaging_equipment_specialist'});
 assert(selected.length>0&&selected.length<current.length);
 const before=JSON.stringify({selected,centers:data.centers});
 const first=summarizeFirstInsight(Object.freeze([...selected]),Object.freeze([...data.centers]));
 assert.equal(first.totalPos,selected.length);
 assert.equal(first.totalBrands,countBrands(selected));
 assert.deepEqual(first.centerIds,summarize(selected,data.centers).centers.slice(0,3).map(c=>c.id));
 const chosen=selected.filter(r=>first.centerIds.includes(r.mallId));
 assert.equal(first.pos,chosen.length);
 assert.equal(first.brands,countBrands(chosen));
 assert.equal(JSON.stringify({selected,centers:data.centers}),before);
});

test('no verified host keeps selected denominators instead of implying no shop presence',()=>{
 const withoutHost=current.filter(r=>!r.mallId);
 assert(withoutHost.length>0);
 const first=summarizeFirstInsight(withoutHost,data.centers);
 assert.deepEqual(first.centerIds,[]);
 assert.equal(first.brands,0);
 assert.equal(first.pos,0);
 assert.equal(first.share,0);
 assert.equal(first.totalBrands,countBrands(withoutHost));
 assert.equal(first.totalPos,withoutHost.length);
 const missingRegistry=summarizeFirstInsight(current,[]);
 assert.equal(missingRegistry.totalPos,233);
 assert.equal(missingRegistry.centers.length,0);
});

test('empty and absent inputs produce finite zero counts',()=>{
 const empty={centers:[],centerIds:[],brands:0,totalBrands:0,share:0,pos:0,totalPos:0};
 assert.deepEqual(summarizeFirstInsight([],data.centers),empty);
 assert.deepEqual(summarizeFirstInsight(),empty);
 assert.deepEqual(summarizeFirstInsight(null,null),empty);
});

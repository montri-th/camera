import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {filterRows, SEGMENTS, bannersOf, bannerSegmentsOf} from '../js/model.js';
import {assignNeighborhood, summarizeNeighborhoods} from '../js/neighborhoods.js';
import {buildNeighborhoodChartModel, neighborhoodMatrix, bubbleRadius} from '../js/chart-model.js';
import {buildAreaModel} from '../js/map-layers.js';
import {summarizeAreaInsight} from '../js/area-insight.js';
const source=JSON.parse(fs.readFileSync(new URL('../data/camera.json',import.meta.url)));
const geo=JSON.parse(fs.readFileSync(new URL('../data/neighborhoods.geojson',import.meta.url)));
const rows=filterRows(source.rows),segments=Object.entries(SEGMENTS).map(([id,name])=>({id,name}));
const RATCHADA_WEST='1d671f78-108c-4bcb-9da8-a29a3117e931',SIAM='8d8ed740-cd31-4b6a-859f-096f1f3d0b0e',RATCHAPRASONG='228edb69-6e1a-42f7-8001-f3eed7ee016d';

// Snapshot fixture (research 2026-10-23): regression values, never UI constants.
test('neighborhood ranking uses distinct banners and conserves selected outlet scope',()=>{
 const m=buildNeighborhoodChartModel(rows,geo,segments);
 assert.equal(m.totalPos,252);assert.equal(m.totalBrands,39);assert.equal(m.areaCount,36);
 assert.deepEqual(m.areas.slice(0,3).map(a=>[a.id,a.brands,a.pos]),[[RATCHADA_WEST,13,17],[SIAM,10,12],[RATCHAPRASONG,8,10]]);
 assert.equal(m.assignedPos,101);assert.equal(m.outsidePos,151);assert.equal(m.assignedPos+m.outsidePos,m.totalPos);
 for(const a of m.areas)assert.equal(a.exclusiveBrands+a.sharedBrands,a.brands);
});

test('outlet metric keeps map values, ranking and automatic top-area focus consistent',()=>{
 const duplicated=[...rows,rows[0]], m=buildNeighborhoodChartModel(duplicated,geo,segments,{metric:'pos'});
 const map=buildAreaModel(duplicated,geo,{metric:'pos'}), insight=summarizeAreaInsight(duplicated,geo,{metric:'pos'});
 assert.equal(m.totalPos,252,'duplicated canonical outlet ID does not inflate the metric');
 assert.equal(map.scale.max,Math.max(...m.areas.map(a=>a.pos)));
 assert.equal(map.scale.unit,'สาขา');
 assert.deepEqual(insight.areaIds,m.areas.slice(0,3).map(a=>a.id));
 assert.ok(m.areas.every((a,i)=>i===0||m.areas[i-1].pos>=a.pos));
 for(const a of map.areas)assert.equal(a.value,a.pos);
});

test('duplicated real outlet raises the outlet count without inflating area, cell or shared banner counts',()=>{
 const m=buildNeighborhoodChartModel(rows,geo,segments),row=rows.find(r=>r.brand==='BIG CAMERA'&&bannersOf(r).length===1&&assignNeighborhood(r,geo)?.id===RATCHADA_WEST);
 assert.ok(row);const duplicated=buildNeighborhoodChartModel([...rows,{...row,id:'test-copy-of-real-outlet'}],geo,segments);
 const a=m.areas.find(a=>a.id===RATCHADA_WEST),b=duplicated.areas.find(a=>a.id===RATCHADA_WEST);
 assert.equal(b.pos,a.pos+1);assert.equal(b.brands,a.brands);assert.equal(b.exclusiveBrands,a.exclusiveBrands);assert.equal(b.sharedBrands,a.sharedBrands);
 assert.equal(b.segments.find(s=>s.id===row.segment).brands,a.segments.find(s=>s.id===row.segment).brands);
 assert.equal(duplicated.totalBrands,m.totalBrands);assert.equal(duplicated.assignedPos,m.assignedPos+1);
});

test('a co-branded outlet counts once in the area and once in each of its banners’ segments',()=>{
 const m=buildNeighborhoodChartModel(rows,geo,segments),siam=m.areas.find(a=>a.id===SIAM);
 const members=rows.filter(r=>assignNeighborhood(r,geo)?.id===SIAM);
 assert.equal(siam.pos,members.length);
 const pairs=members.reduce((n,r)=>n+new Set(bannerSegmentsOf(r)).size,0);
 assert.equal(siam.segments.reduce((n,s)=>n+s.pos,0),pairs,'segment cells add (outlet × segment) pairs');
 assert.ok(pairs>siam.pos,'Siam holds co-branded storefronts (BIG CAMERA + Power Mall, DJI + Hasselblad)');
 assert.ok(siam.brandNames.includes('Power Mall')&&siam.brandNames.includes('Hasselblad Bangkok Store'));
});

test('exclusive/shared means all assigned selected neighborhoods, including those outside displayed topN',()=>{
 const m=buildNeighborhoodChartModel(rows,geo,segments),display=neighborhoodMatrix(m,{areaLimit:1,segmentLimit:2});
 const top=m.areas[0];assert.equal(display.areas[0].exclusiveBrands,9);assert.equal(display.areas[0].sharedBrands,4);
 const others=m.areas.slice(1),expectedShared=top.brandNames.filter(b=>others.some(a=>a.brandNames.includes(b))).length;
 assert.equal(top.sharedBrands,expectedShared);assert.equal(top.exclusiveBrands,top.brandNames.length-expectedShared);
 assert.ok(others.some(a=>a.brandNames.includes('BIG CAMERA')));assert.equal(top.exclusiveBrands+top.sharedBrands,13);
});

test('matrix cells are complete for shown dimensions; zero means no selected observations in that cell',()=>{
 const m=buildNeighborhoodChartModel(rows,geo,segments),matrix=neighborhoodMatrix(m,{areaLimit:10,segmentLimit:8});
 assert.equal(matrix.cells.length,matrix.areas.length*matrix.segments.length);assert.equal(matrix.maxBrands,10);
 assert.ok(matrix.cells.some(c=>c.brands===0&&c.pos===0));
 for(const cell of matrix.cells){
  const members=rows.filter(r=>assignNeighborhood(r,geo)?.properties.id===cell.areaId&&bannerSegmentsOf(r).includes(cell.segmentId));
  const banners=new Set(members.flatMap(r=>bannersOf(r).filter((b,i)=>bannerSegmentsOf(r)[i]===cell.segmentId)));
  assert.equal(cell.pos,members.length);assert.equal(cell.brands,banners.size);
 }
});

test('filtering recomputes scope and overlap while geographic membership stays fixed',()=>{
 const selected=rows.filter(r=>r.brand==='Sony Store'),m=buildNeighborhoodChartModel(selected,geo,segments);
 assert.equal(m.totalBrands,1);assert.ok(m.areaCount>1);
 for(const a of m.areas){assert.equal(a.brands,1);assert.equal(a.sharedBrands,1);assert.equal(a.exclusiveBrands,0);}
 const siamOnly=selected.filter(r=>assignNeighborhood(r,geo)?.properties.id===SIAM);
 const one=buildNeighborhoodChartModel(siamOnly,geo,segments);assert.equal(one.areaCount,1);assert.equal(one.areas[0].exclusiveBrands,1);
});

test('text labels never assign outside points; source data and geometry remain untouched',()=>{
 const before=JSON.stringify([rows,geo]);const outside=rows.filter(r=>!assignNeighborhood(r,geo));assert.ok(outside.length);
 const m=buildNeighborhoodChartModel(outside.map(r=>({...r,neighborhood:'สยาม'})),geo,segments);
 assert.equal(m.areaCount,0);assert.equal(m.outsidePos,outside.length);assert.equal(m.totalPos,outside.length);
 assert.equal(JSON.stringify([rows,geo]),before);
});

test('stable sort and frozen edge assignment agree with geographic summaries',()=>{
 const m=buildNeighborhoodChartModel(rows,geo,segments),reverse=buildNeighborhoodChartModel([...rows].reverse(),geo,segments);
 assert.deepEqual(m.areas.map(a=>[a.id,a.brands,a.pos,a.exclusiveBrands,a.sharedBrands]),reverse.areas.map(a=>[a.id,a.brands,a.pos,a.exclusiveBrands,a.sharedBrands]));
 const spatial=summarizeNeighborhoods(rows,geo);for(const a of m.areas){const reference=spatial.find(s=>s.id===a.id);assert.equal(a.pos,reference.pos);assert.equal(a.brands,reference.brands);}
});

test('bubble circle area, rather than radius, is proportional to distinct banner count',()=>{
 assert.equal(bubbleRadius(0,100,10),0);assert.equal(bubbleRadius(100,100,10),10);
 const small=bubbleRadius(25,100,10),large=bubbleRadius(100,100,10);assert.equal(small,5);assert.equal(small**2/large**2,0.25);
 assert.equal(bubbleRadius(1,0,10),0);assert.equal(bubbleRadius(1,10,0),0);
});

test('missing/empty geometry and rows produce explicit finite empty models',()=>{
 const m=buildNeighborhoodChartModel(null,null,null);assert.equal(m.totalPos,0);assert.equal(m.areaCount,0);assert.equal(m.outsidePos,0);
 assert.deepEqual(neighborhoodMatrix(m).cells,[]);assert.equal(neighborhoodMatrix(m).maxBrands,0);
 const noGeometry=buildNeighborhoodChartModel(rows,undefined,segments);assert.equal(noGeometry.areaCount,0);assert.equal(noGeometry.outsidePos,252);
 assert.deepEqual(neighborhoodMatrix(buildNeighborhoodChartModel(rows,geo,segments),{areaLimit:0,segmentLimit:0}).cells,[]);
});

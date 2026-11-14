import test from 'node:test';
import assert from 'node:assert/strict';
import { dailyKnowledgePills, dateKey, filterPills, readState, writeState, readingMinutes } from '../site/core.js';
const pills = Array.from({length: 36}, (_, i) => ({id: `p${i}`, bookId: `b${Math.floor(i/3)}`, genre: i >= 30 ? 'fiction' : 'nonfiction', concept: `Concept ${i}`, quote: 'A short original quote.', refresher: 'A useful reminder.', book: `Book ${Math.floor(i/3)}`, author: 'An Author', topic: i % 2 ? 'Mind' : 'Work'}));
test('a date always gives five distinct books regardless of input order', () => {
 const a = dailyKnowledgePills(pills, '2026-09-05');
 assert.equal(a.length, 5); assert.equal(new Set(a.map(p=>p.bookId)).size, 5);
 assert.deepEqual(dailyKnowledgePills([...pills].reverse(), '2026-09-05'), a);
});
test('adjacent days do not repeat pills and nonfiction dominates', () => {
 let previous = []; let fiction=0;
 for(let day=1;day<=28;day++) {
  const result=dailyKnowledgePills(pills, `2026-02-${String(day).padStart(2,'0')}`);
  assert.equal(result.length,5);
  assert.ok(result.every(p=>!previous.includes(p.id)));
  assert.ok(result.filter(p=>p.genre==='nonfiction').length>=4);
  fiction += result.filter(p=>p.genre==='fiction').length;
  previous=result.map(p=>p.id);
 }
 assert.ok(fiction>0 && fiction<=9);
});
test('empty and undersized libraries return only available distinct books', () => {
 assert.deepEqual(dailyKnowledgePills([], '2026-09-05'), []);
 assert.equal(dailyKnowledgePills(pills.slice(0,3),'2026-09-05').length,1);
 assert.throws(()=>dailyKnowledgePills(pills,'bad-date'));
});
test('date key uses the local calendar, including midnight', () => {
 assert.equal(dateKey(new Date(2026,8,5,23,59)), '2026-09-05');
 assert.equal(dateKey(new Date(2026,8,6,0,0)), '2026-09-06');
});
test('search combines text, topic and saved filters', () => {
 assert.equal(filterPills(pills,{query:'BOOK 1',topic:'Work'}).length, 4);
 assert.deepEqual(filterPills(pills,{query:'original', saved:['p0']}),[pills[0]]);
 assert.equal(filterPills(pills,{query:'not present'}).length,0);
});
test('storage survives corrupt data, invalid shape and disabled storage', () => {
 for(const value of ['{','null','[]','{"saved":"oops","read":null}']) {
  assert.deepEqual(readState({getItem:()=>value}),{saved:[],read:{}});
 }
 const blocked={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};
 assert.deepEqual(readState(blocked),{saved:[],read:{}});
 assert.equal(writeState(blocked,{saved:['p1'],read:{}}),false);
 let persisted='';const storage={setItem(k,v){persisted=v},getItem(){return persisted}};
 assert.equal(writeState(storage,{saved:['p1'],read:{'2026-09-05':['p1']}}),true);
 assert.deepEqual(readState(storage),{saved:['p1'],read:{'2026-09-05':['p1']}});
});
test('read time includes concept, excerpt and refresher', () => {
 assert.equal(readingMinutes([{concept:'hello',quote:'word '.repeat(180),refresher:'word '.repeat(80)}]),2);
});

function selectionDays(collection, count, start='2026-01-01') {
 return Array.from({length:count},(_,i)=>dailyKnowledgePills(collection,new Date(Date.parse(start)+i*86400000).toISOString().slice(0,10)));
}
test('each book serves all its pills before repeating, including four-pill fiction', () => {
 const collection = Array.from({length:48},(_,i)=>({id:`rotation-${i}`,bookId:`book-${Math.floor(i/4)}`,genre:i>=40?'fiction':'nonfiction'}));
 const seen=new Map();
 for(const daily of selectionDays(collection,240)) for(const p of daily) {
  if(!seen.has(p.bookId)) seen.set(p.bookId,new Set());
  const cycle=seen.get(p.bookId);
  assert.ok(!cycle.has(p.id),`${p.bookId} repeated ${p.id} before completing its rotation`);
  cycle.add(p.id);
  if(cycle.size===4) cycle.clear();
 }
});
test('the real library spaces book appearances and eventually serves every pill', async () => {
 const {readFile}=await import('node:fs/promises');
 const {pills:collection}=JSON.parse(await readFile(new URL('../site/data/library.json',import.meta.url)));
 const lastBook=new Map(),seen=new Set();
 for(const [day,daily] of selectionDays(collection,1200).entries()) {
  assert.equal(daily.length,5);
  assert.equal(new Set(daily.map(p=>p.bookId)).size,5);
  for(const p of daily) {
   if(lastBook.has(p.bookId)) assert.ok(day-lastBook.get(p.bookId)>=17,`${p.bookId} returned too soon`);
   lastBook.set(p.bookId,day);seen.add(p.id);
  }
 }
 assert.equal(seen.size,collection.length);
});
test('small and single-genre libraries fill available slots without duplicate books', () => {
 for(const collection of [pills.filter(p=>p.genre==='fiction'),pills.filter(p=>p.genre!=='fiction'),pills.slice(24)]) {
  for(const daily of selectionDays(collection,20,'1969-12-25')) {
   assert.equal(daily.length,Math.min(5,new Set(collection.map(p=>p.bookId)).size));
   assert.equal(new Set(daily.map(p=>p.bookId)).size,daily.length);
  }
 }
});

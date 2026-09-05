import test from 'node:test';
import assert from 'node:assert/strict';
import { dailyKnowledgePills, dateKey, filterPills, readState, writeState, readingMinutes } from '../site/core.js';
const pills = Array.from({length: 36}, (_, i) => ({id: `p${i}`, bookId: `b${Math.floor(i/3)}`, genre: i >= 30 ? 'fiction' : 'nonfiction', concept: `Concept ${i}`, quote: 'A short original quote.', refresher: 'A useful reminder.', book: `Book ${Math.floor(i/3)}`, author: 'An Author', topic: i % 2 ? 'Mind' : 'Work'}));
test('a date always gives three distinct books regardless of input order', () => {
 const a = dailyKnowledgePills(pills, '2026-09-05');
 assert.equal(a.length, 3); assert.equal(new Set(a.map(p=>p.bookId)).size, 3);
 assert.deepEqual(dailyKnowledgePills([...pills].reverse(), '2026-09-05'), a);
});
test('adjacent days do not repeat pills and nonfiction dominates', () => {
 let previous = []; let fiction=0;
 for(let day=1;day<=28;day++) {
  const result=dailyKnowledgePills(pills, `2026-02-${String(day).padStart(2,'0')}`);
  assert.equal(result.length,3);
  assert.ok(result.every(p=>!previous.includes(p.id)));
  assert.ok(result.filter(p=>p.genre==='nonfiction').length>=2);
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

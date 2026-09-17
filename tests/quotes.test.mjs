import test from 'node:test';
import assert from 'node:assert/strict';
import * as quotes from '../site/core.js';

test('quotes cycle through every entry before repeating across calendar boundaries',()=>{
 assert.equal(typeof quotes.dailyQuote,'function');
 const entries=['First','Second','Third'];
 for(const dates of [
  ['2026-12-30','2026-12-31','2027-01-01','2027-01-02'],
  ['2026-03-28','2026-03-29','2026-03-30','2026-03-31'],
 ]){
  const selected=dates.map(day=>quotes.dailyQuote(entries,day));
  assert.equal(new Set(selected.slice(0,3)).size,3);
  assert.equal(selected[0],selected[3]);
 }
});

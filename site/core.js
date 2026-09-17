export function dateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
function hash(text) {
  let value = 2166136261;
  for (const char of text) value = Math.imul(value ^ char.charCodeAt(0), 16777619);
  return value >>> 0;
}
export function dailyKnowledgePills(pills, key) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key) || !Number.isFinite(Date.parse(`${key}T00:00:00Z`))) throw new Error('Invalid date');
  const day = Math.floor(Date.parse(`${key}T00:00:00Z`) / 86400000);
  const groups = new Map();
  for (const pill of pills) {
    if (!groups.has(pill.bookId)) groups.set(pill.bookId, []);
    groups.get(pill.bookId).push(pill);
  }
  const ranked = [...groups.entries()].sort((a,b)=>hash(`${key}:${a[0]}`)-hash(`${key}:${b[0]}`) || a[0].localeCompare(b[0]));
  const nonfiction = ranked.filter(([,ps])=>ps[0].genre !== 'fiction');
  const fiction = ranked.filter(([,ps])=>ps[0].genre === 'fiction');
  const selected = nonfiction.slice(0,5);
  if (day % 4 === 0 && fiction.length) selected.splice(4,1,fiction[0]);
  for (const group of ranked) {
    if (selected.length >= 5) break;
    if (!selected.includes(group)) selected.push(group);
  }
  return selected.map(([id,ps])=> {
    const ordered = [...ps].sort((a,b)=>a.id.localeCompare(b.id));
    return ordered[((day + hash(id)) % ordered.length + ordered.length) % ordered.length];
  });
}
export function filterPills(pills, {query='', topic='', saved=null}={}) {
  const needle = query.trim().toLocaleLowerCase();
  return pills.filter(p => (!topic || p.topic===topic) && (saved===null || saved.includes(p.id)) &&
    [p.concept,p.quote,p.refresher,p.book,p.author,p.topic].join(' ').toLocaleLowerCase().includes(needle));
}
const STORAGE_KEY='daily-knowledge-pills-v1';
export function readState(storage) {
  try {
    const value=JSON.parse(storage.getItem(STORAGE_KEY));
    if (!value || !Array.isArray(value.saved) || !value.read || typeof value.read !== 'object' || Array.isArray(value.read)) return {saved:[],read:{}};
    return {saved:[...new Set(value.saved.filter(id=>typeof id==='string'))],read:Object.fromEntries(Object.entries(value.read).filter(([day,ids])=>/^\d{4}-\d{2}-\d{2}$/.test(day) && Array.isArray(ids)).map(([day,ids])=>[day,ids.filter(id=>typeof id==='string')]))};
  } catch { return {saved:[],read:{}}; }
}
export function writeState(storage,state) {
  try { storage.setItem(STORAGE_KEY,JSON.stringify(state)); return true; } catch { return false; }
}
export function readingMinutes(pills) {
  const words = pills.map(p=>[p.concept,p.quote,p.refresher,p.book,p.author].filter(Boolean).join(' ')).join(' ').trim().split(/\s+/).length;
  return Math.max(1,Math.ceil(words/180));
}

// The key is a local calendar date; UTC arithmetic avoids daylight-saving shifts.
export function dailyQuote(quotes, key) {
  const day = Math.floor(Date.parse(`${key}T00:00:00Z`) / 86400000);
  return quotes[((day % quotes.length) + quotes.length) % quotes.length];
}

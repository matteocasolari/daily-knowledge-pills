import {dailyKnowledgePills,dateKey,filterPills,readState,writeState,readingMinutes,dailyQuote} from './core.js';

const $ = id => document.getElementById(id);
const escape = text => String(text).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
let storage;try{storage=window.localStorage;}catch{storage=null;}
let state=readState(storage), library, quotes, today=dateKey(), view='today';
const bookmark='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h12v17l-6-4-6 4V4Z" stroke-linejoin="round"/></svg>';
const announce = message => { $('announcement').textContent=message; };
function persist(){if(!writeState(storage,state))$('storage-warning').hidden=false;}
function updateProgress(){
  $('saved-count').textContent=state.saved.length;
  if(!library)return;
  const daily=dailyKnowledgePills(library.pills,today);
  const done=daily.filter(p=>(state.read[today]||[]).includes(p.id)).length;
  $('progress-label').textContent=`${done} of ${daily.length} read`;
  $('progress-dots').innerHTML=daily.map(p=>`<i class="${(state.read[today]||[]).includes(p.id)?'done':''}"></i>`).join('');
  $('completion').hidden=view!=='today'||done!==daily.length;
}
function card(p,index){
 const saved=state.saved.includes(p.id),read=(state.read[today]||[]).includes(p.id);
 return `<article class="pill-card" data-tone="${index%3}" aria-labelledby="title-${escape(p.id)}">
  <div class="card-top"><span class="pill-number">${String(index+1).padStart(2,'0')}</span><span class="topic-tag">${escape(p.topic)}</span><button class="icon-button" data-action="save" data-id="${escape(p.id)}" aria-pressed="${saved}" aria-label="${saved?'Unsave':'Save'} ${escape(p.concept)}" title="${saved?'Remove from saved':'Save this idea'}">${bookmark}</button></div>
  <h3 id="title-${escape(p.id)}">${escape(p.concept)}</h3>
  <p class="refresher">${escape(p.refresher)}</p>
  <div class="quote-section"><p class="quote-label">FROM MY NOTES</p><blockquote>${escape(p.quote)}</blockquote>
  <div class="attribution"><span class="book-spine" aria-hidden="true"></span><div><p class="book-title">${escape(p.book)}${p.genre==='fiction'?'<span class="fiction-label">Fiction</span>':''}</p><p class="author">${escape(p.author)}</p></div></div></div>
  <div class="card-bottom"><details class="further"><summary>Explore further</summary>${p.links.map(l=>`<a href="${escape(l.url)}" target="_blank" rel="noopener noreferrer">${escape(l.title)} <span aria-hidden="true">↗</span><span class="sr-only"> (opens in a new tab)</span></a>`).join('')}<p class="source-note">My source note: ${escape(p.source.file)} · paragraph ${p.source.paragraph+1}. Excerpt wording preserved; refresher is editorial.</p></details>
  ${view==='today'?`<button class="read-button" data-action="read" data-id="${escape(p.id)}" aria-pressed="${read}" aria-label="${read?'Mark unread':'Mark as read'}: ${escape(p.concept)}"><span>${read?'Read · a little remembered':'Mark as read'}</span><span class="read-icon" aria-hidden="true">${read?'✓':''}</span></button>`:''}</div></article>`;
}
function renderCards(){
 const pills=view==='today'?dailyKnowledgePills(library.pills,today):filterPills(library.pills,{query:$('search').value,topic:$('topic').value,saved:view==='saved'?state.saved:null});
 $('cards').innerHTML=pills.map(card).join('');
 $('result-count').textContent=`${pills.length} ${pills.length===1?'concept':'concepts'} · ${new Set(pills.map(p=>p.bookId)).size} books`;
 if(!pills.length){
   const emptySaved=view==='saved'&&!state.saved.length;
   $('cards').innerHTML=`<div class="empty-state"><span class="empty-mark" aria-hidden="true">${emptySaved?'❧':'⌕'}</span><h3>${emptySaved?'Nothing saved yet.':'No matching notes.'}</h3><p>${emptySaved?'A place for the ideas I want to revisit. Use the bookmark on any pill to keep it here.':'Try another word or clear the filters to return to all my notes.'}</p>${emptySaved?'<a class="primary-button" href="#today">Read today’s pills</a>':'<button class="primary-button" data-action="clear">Clear filters</button>'}</div>`;
 }
 $('read-time').textContent=`${readingMinutes(pills)} min read`;
 updateProgress();
}
function renderView(){
 if(!library)return;
 view=['today','saved','library'].includes(location.hash.slice(1))?location.hash.slice(1):'today';
 document.querySelectorAll('[data-view]').forEach(a=>{if(a.dataset.view===view)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 document.title=`${view==='today'?'Today':view==='saved'?'Saved':'My library'} · Daily Knowledge Pills`;
 const isToday=view==='today';
 $('daily-quote-section').hidden=!isToday;
 $('daily-quote').textContent=dailyQuote(quotes,today);
 $('today-hero').hidden=!isToday;$('collection-hero').hidden=isToday;
 $('daily-meta').hidden=!isToday;$('date-label').hidden=!isToday;
 $('filters').hidden=isToday;$('result-count').hidden=isToday;$('daily-footnote').hidden=!isToday;
 $('date-label').textContent=new Intl.DateTimeFormat('en',{weekday:'long',month:'long',day:'numeric',year:'numeric'}).format(new Date(`${today}T12:00:00`)).toUpperCase();
 $('section-title').textContent=isToday?'Today’s reminders':view==='saved'?'My saved ideas':'All my reminders';
 $('collection-title').textContent=view==='saved'?'Worth coming back to.':'My reading notes.';
 $('collection-eyebrow').textContent=view==='saved'?'MY SAVED NOTES':'FROM MY BOOKSHELF';
 $('collection-description').textContent=view==='saved'?'The ideas I saved for another day.':`${library.stats.pills} concepts from ${library.stats.books} books I’ve read. A few things worth keeping close.`;
 $('search').value='';$('topic').value='';
 renderCards();
}
$('cards').addEventListener('click',event=>{
 const button=event.target.closest('button[data-action]');if(!button||!library)return;
 if(button.dataset.action==='clear'){$('search').value='';$('topic').value='';renderCards();$('search').focus();return;}
 const pill=library.pills.find(p=>p.id===button.dataset.id);if(!pill)return;
 if(button.dataset.action==='save'){
  const removing=state.saved.includes(pill.id);
  state.saved=removing?state.saved.filter(id=>id!==pill.id):[...state.saved,pill.id];
  persist();
  if(view==='saved'&&removing){renderCards();$('search').focus();}
  else{button.setAttribute('aria-pressed',String(!removing));button.setAttribute('aria-label',`${removing?'Save':'Unsave'} ${pill.concept}`);button.title=removing?'Save this idea':'Remove from saved';updateProgress();}
  announce(`${pill.concept} ${removing?'removed from saved':'saved'}.`);
 }else if(button.dataset.action==='read'){
  const ids=state.read[today]||[],wasRead=ids.includes(pill.id);
  state.read[today]=wasRead?ids.filter(id=>id!==pill.id):[...ids,pill.id];
  // Keep the most recent 90 calendar entries; saved pills are retained indefinitely.
  state.read=Object.fromEntries(Object.entries(state.read).sort(([a],[b])=>b.localeCompare(a)).slice(0,90));
  persist();button.setAttribute('aria-pressed',String(!wasRead));
  button.setAttribute('aria-label',`${wasRead?'Mark as read':'Mark unread'}: ${pill.concept}`);
  button.querySelector('span').textContent=wasRead?'Mark as read':'Read · a little remembered';
  button.querySelector('.read-icon').textContent=wasRead?'':'✓';updateProgress();
  announce($('completion').hidden?`${pill.concept} marked ${wasRead?'unread':'read'}.`:'All five read. Done for today.');
 }
});
document.querySelector('.skip-link').addEventListener('click',event=>{event.preventDefault();$('main').focus();$('main').scrollIntoView();});
$('search').addEventListener('input',renderCards);$('topic').addEventListener('change',renderCards);
window.addEventListener('hashchange',()=>{renderView();$('main').focus();window.scrollTo(0,0);});
$('about-button').addEventListener('click',()=>$('about-dialog').showModal());
$('close-about').addEventListener('click',()=>$('about-dialog').close());
$('about-done').addEventListener('click',()=>$('about-dialog').close());
function checkDay(){const next=dateKey();if(next!==today){today=next;if(library){renderView();announce('Five more notes for today.');}}}
setInterval(checkDay,30000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkDay();});window.addEventListener('focus',checkDay);
window.addEventListener('storage',()=>{state=readState(storage);if(library)renderCards();});
async function load(){
 try{
  const [libraryData,quoteData]=await Promise.all(['library','quotes'].map(async name=>{
   const response=await fetch(new URL(`./data/${name}.json`,import.meta.url));
   if(!response.ok)throw Error(`Unable to load ${name}`);
   return response.json();
  }));
  if(!Array.isArray(quoteData)||!quoteData.length||quoteData.some(quote=>typeof quote!=='string'||!quote.trim()))throw Error('Invalid quotes');
  library=libraryData;quotes=quoteData;
  if(!Array.isArray(library.pills)||library.pills.length<3||!library.stats)throw Error('Invalid library');
  const validIds=new Set(library.pills.map(p=>p.id));state.saved=state.saved.filter(id=>validIds.has(id));
  $('topic').innerHTML='<option value="">All topics</option>'+[...new Set(library.pills.map(p=>p.topic))].sort().map(topic=>`<option>${escape(topic)}</option>`).join('');
  $('library-stats').textContent=`${library.stats.books} books · ${library.stats.pills} ideas`;
  $('coverage-note').textContent=`My notebook currently holds ${library.stats.pills} concepts from ${library.stats.books} books. The original ${library.stats.sourceFiles} note files are kept too, with more passages still to revisit.`;
  if(!storage)$('storage-warning').hidden=false;
  renderView();
 }catch(error){
  library=null;$('daily-meta').hidden=true;
  $('cards').innerHTML='<div class="empty-state"><h3>The books didn’t open.</h3><p>The notebook couldn’t load. Check the connection and try again.</p><button class="primary-button" id="retry">Try again</button></div>';
  $('retry').addEventListener('click',load);
 }
}
load();

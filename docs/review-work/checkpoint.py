import json,collections,re
from pathlib import Path
from scripts.build import validate_pill
root=Path.cwd();d=root/'docs/review-work';notes={n['file']:n['paragraphs'] for n in json.loads((root/'content/notes.json').read_text())}
path=root/'content/pills.json';pills=json.loads(path.read_text());byid={p['id']:p for p in pills};new=[]
# Only parent-reviewed snapshots are merged, never unreviewed in-flight artifacts.
for f in sorted(d.glob('approved-*.json')):
 for p in json.loads(f.read_text()):
  validate_pill(p,notes)
  if p['id'] in byid:
   assert byid[p['id']]==p, p['id']
  else:byid[p['id']]=p;new.append(p)
pills+=new;path.write_text(json.dumps(pills,ensure_ascii=False,indent=2)+'\n')
# Current counts and coverage remain publishable at every checkpoint.
p=root/'README.md';text=p.read_text();text=re.sub(r'The collection includes \*\*\d+ curated pills from 99 books\*\*\.',f'The collection includes **{len(pills)} curated pills from 99 books**.',text)
if 'full-library review is in progress' not in text:text=text.replace('## Run locally','The [full-library review is in progress](docs/review-work/PROGRESS.md). Validated additions are saved to the website data in batches; historical review totals below describe earlier snapshots.\n\n## Run locally')
p.write_text(text)
p=root/'docs/book-coverage.md';text=p.read_text();text=re.sub(r'The collection contains \*\*\d+ pills from all 99 identified books\*\*\.',f'The collection contains **{len(pills)} pills from all 99 identified books**.',text)
text=text.replace('Nine other books remain at 12.','The ongoing full-library review now adds important missing concepts without a numerical cap.')
header=text.split('## Represented books')[0];groups=collections.defaultdict(list)
for pill in pills:groups[pill['bookId']].append(pill)
rows=['| Book | Author / editor | Pills |','| --- | --- | ---: |']
for g in sorted(groups.values(),key=lambda g:g[0]['book'].casefold()):rows.append(f"| {g[0]['book']} | {g[0]['author']} | {len(g)} |")
p.write_text(header+'## Represented books\n\n'+'\n'.join(rows)+'\n')
print(f'Checkpoint: {len(new)} newly merged; {len(pills)} pills total')

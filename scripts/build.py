"""Validate curated content and publish only the static library."""
from pathlib import Path
from urllib.parse import urlparse
import json

if __package__:
    from .import_notes import extract_docx
else:
    from import_notes import extract_docx

ROOT = Path(__file__).resolve().parents[1]
MAX_WORDS = 110

def load_quotes(path):
    paragraphs = extract_docx(path)
    if not paragraphs or paragraphs[0] != path.stem:
        raise ValueError(f'Expected quote document title: {path.stem}')
    if len(paragraphs) < 2:
        raise ValueError('Quote document contains no quotes')
    return paragraphs[1:]

def validate_pill(pill, notes):
    for field in ('id', 'bookId', 'book', 'author', 'topic', 'concept', 'quote', 'refresher'):
        if not isinstance(pill.get(field), str) or not pill[field].strip():
            raise ValueError(f'Missing {field}: {pill.get("id")}')
    if pill.get('genre') not in ('fiction', 'nonfiction'): raise ValueError('Unknown genre')
    source = pill['source']
    paragraph = notes[source['file']][source['paragraph']]
    if pill['quote'] not in paragraph: raise ValueError(f'Quote does not match source: {pill["id"]}')
    words = ' '.join(pill[k] for k in ('concept','quote','refresher','book','author')).split()
    if len(words) > MAX_WORDS: raise ValueError(f'Pill exceeds {MAX_WORDS} words: {pill["id"]} ({len(words)})')
    if not pill.get('links'): raise ValueError('Each pill needs further reading')
    for link in pill['links']:
        parsed = urlparse(link['url'])
        if parsed.scheme != 'https' or not parsed.netloc or not link.get('title'): raise ValueError('Invalid reading link')

def main():
    quotes = load_quotes(ROOT / 'sources/quotes' / "Paper note's good quotes.docx")
    source_notes = json.loads((ROOT/'content/notes.json').read_text())
    notes = {n['file']:n['paragraphs'] for n in source_notes}
    pills = json.loads((ROOT/'content/pills.json').read_text())
    ids = set()
    for pill in pills:
        validate_pill(pill, notes)
        if pill['id'] in ids: raise ValueError('Duplicate pill ID')
        ids.add(pill['id'])
    books = {p['bookId'] for p in pills}
    if len(books) < 3: raise ValueError('Need at least three books')
    stats = {'sourceFiles':len(notes),'sourceParagraphs':sum(map(len,notes.values())),'books':len(books),'pills':len(pills),'maxWordsPerPill':MAX_WORDS}
    (ROOT/'site/data/library.json').write_text(json.dumps({'version':1,'stats':stats,'pills':pills},ensure_ascii=False,indent=2)+'\n')
    (ROOT/'site/data/quotes.json').write_text(json.dumps(quotes,ensure_ascii=False,indent=2)+'\n')
    covered = {p['source']['file'] for p in pills}
    (ROOT/'content/curation-report.json').write_text(json.dumps({**stats,'curatedSources':sorted(covered),'awaitingCuration':sorted(set(notes)-covered)},ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(stats))

if __name__ == '__main__': main()

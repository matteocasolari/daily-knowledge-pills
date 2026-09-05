"""Extract text only; never execute scripts or fetch resources from note exports."""
from html.parser import HTMLParser
from pathlib import Path
import hashlib
import json
import re
import zipfile
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]

def normalize(text):
    return re.sub(r'\s+', ' ', text).strip()

class NoteParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.active = False
        self.parts = []
        self.rows = []
        self.skip = 0
    def flush(self):
        text = normalize(''.join(self.parts))
        if text:
            self.rows.append(text)
        self.parts = []
    def handle_starttag(self, tag, attrs):
        if tag == 'en-note':
            self.active = True
        if not self.active:
            return
        if tag in ('script', 'style'):
            self.skip += 1
        if tag in ('div', 'p', 'li', 'h1', 'h2', 'h3', 'br', 'tr'):
            self.flush()
    def handle_endtag(self, tag):
        if tag in ('script', 'style') and self.skip:
            self.skip -= 1
        if self.active and tag in ('div', 'p', 'li', 'h1', 'h2', 'h3', 'en-note', 'tr'):
            self.flush()
        if tag == 'en-note':
            self.active = False
    def handle_data(self, text):
        if self.active and not self.skip:
            self.parts.append(text)

def extract_html(text):
    parser = NoteParser()
    parser.feed(text)
    parser.flush()
    return parser.rows

def extract_docx(path):
    with zipfile.ZipFile(path) as archive:
        root = ET.fromstring(archive.read('word/document.xml'))
    rows = []
    for paragraph in root.findall('.//{*}p'):
        parts = []
        for item in paragraph.iter():
            tag = item.tag.rsplit('}', 1)[-1]
            if tag == 't': parts.append(item.text or '')
            elif tag in ('tab', 'br'): parts.append(' ')
        text = normalize(''.join(parts))
        if text: rows.append(text)
    return rows

def main():
    notes = []
    for path in sorted((ROOT / 'sources').iterdir()):
        if path.suffix.lower() not in ('.html', '.docx'): continue
        paragraphs = extract_html(path.read_text()) if path.suffix == '.html' else extract_docx(path)
        notes.append({'file': path.name, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'paragraphs': paragraphs})
    target = ROOT / 'content' / 'notes.json'
    target.write_text(json.dumps(notes, ensure_ascii=False, indent=2) + '\n')
    report = {'files': len(notes), 'paragraphs': sum(len(n['paragraphs']) for n in notes), 'empty': [n['file'] for n in notes if not n['paragraphs']]}
    (ROOT / 'content' / 'import-report.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(report))

if __name__ == '__main__': main()

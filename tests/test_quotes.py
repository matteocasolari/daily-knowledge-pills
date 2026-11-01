import json
from pathlib import Path
import tempfile
import unittest
import zipfile

from scripts import build


class QuoteImportTests(unittest.TestCase):
    def test_build_extracts_quotes_from_separate_source(self):
        root = Path(__file__).resolve().parents[1]
        build.main()
        quotes = json.loads((root / 'site/data/quotes.json').read_text())
        self.assertEqual(len(quotes), 66)
        self.assertNotIn("Paper note's good quotes", quotes)
        self.assertIn('mind. If, when', quotes[0])
        self.assertEqual(quotes[-1], "You can have anything, but you can't get everything")
        notes = json.loads((root / 'content/notes.json').read_text())
        self.assertFalse(any('good quotes' in note['file'] for note in notes))

    def test_extracts_runs_and_breaks_without_changing_wording(self):
        self.assertTrue(callable(getattr(build, 'load_quotes', None)))
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'Quotes.docx'
            with zipfile.ZipFile(path, 'w') as archive:
                archive.writestr('word/document.xml', '''
                    <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
                    <w:body><w:p><w:r><w:t>Quotes</w:t></w:r></w:p>
                    <w:p/><w:p><w:r><w:t>Keep this.</w:t><w:br/>
                    <w:t>And </w:t></w:r><w:r><w:t>this.</w:t></w:r></w:p>
                    </w:body></w:document>''')
            self.assertEqual(build.load_quotes(path), ['Keep this. And this.'])

    def test_rejects_missing_heading_or_empty_collection(self):
        self.assertTrue(callable(getattr(build, 'load_quotes', None)))
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'Quotes.docx'
            for text in ('Quotes', 'Unexpected heading'):
                with zipfile.ZipFile(path, 'w') as archive:
                    archive.writestr('word/document.xml', f'''
                        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
                        <w:body><w:p><w:r><w:t>{text}</w:t></w:r></w:p></w:body></w:document>''')
                with self.assertRaises(ValueError):
                    build.load_quotes(path)

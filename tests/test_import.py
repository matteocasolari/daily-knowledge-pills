import unittest
from scripts.import_notes import extract_html, extract_docx
from pathlib import Path
import tempfile, zipfile

class ImportTests(unittest.TestCase):
    def test_only_note_body_and_preserves_inline_text(self):
        html = '<style>noise</style><h1>outside</h1><en-note><div>Hello <b>world</b> &amp; friends.</div><ul><li><div>Another idea.</div></li></ul></en-note>'
        self.assertEqual(extract_html(html), ['Hello world & friends.', 'Another idea.'])
    def test_nested_lists_do_not_duplicate(self):
        self.assertEqual(extract_html('<en-note><div>Parent<div>Child</div></div></en-note>'), ['Parent', 'Child'])
    def test_docx_keeps_runs_in_one_paragraph(self):
        with tempfile.TemporaryDirectory() as d:
            p=Path(d)/'test.docx'
            with zipfile.ZipFile(p, 'w') as z:
                z.writestr('word/document.xml', '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Hello </w:t></w:r><w:r><w:t>world.</w:t></w:r></w:p></w:body></w:document>')
            self.assertEqual(extract_docx(p), ['Hello world.'])

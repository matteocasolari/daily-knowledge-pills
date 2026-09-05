import unittest
from scripts.build import validate_pill

class BuildTests(unittest.TestCase):
    def setUp(self):
        self.notes={'book.html': ['A faithful original excerpt.']}
        self.pill={'id':'test','bookId':'book','book':'A Book','author':'An Author','genre':'nonfiction','topic':'Mind','concept':'A concept','quote':'A faithful original excerpt.','refresher':'A concise reminder.','source':{'file':'book.html','paragraph':0},'links':[{'title':'Read further','url':'https://example.com/article'}]}
    def test_rejects_rewritten_quotes(self):
        self.pill['quote']='An invented quote.'
        with self.assertRaises(ValueError): validate_pill(self.pill,self.notes)
    def test_enforces_short_pills(self):
        self.pill['refresher']='word '*111
        with self.assertRaises(ValueError): validate_pill(self.pill,self.notes)
    def test_rejects_missing_author_and_unsafe_links(self):
        self.pill['author']=''
        with self.assertRaises(ValueError): validate_pill(self.pill,self.notes)
        self.pill['author']='An Author';self.pill['links'][0]['url']='javascript:alert(1)'
        with self.assertRaises(ValueError): validate_pill(self.pill,self.notes)
    def test_accepts_exact_source(self):
        validate_pill(self.pill,self.notes)

import unittest
from publication_scope import classify

class PublicationScopeTests(unittest.TestCase):
    def test_review_only_does_not_publish(self):
        self.assertEqual(classify(['research/reviews/review.md'], '1.23.0', '1.23.0'), {'edition_changed': False, 'public_changed': False})
    def test_docs_are_public(self):
        self.assertTrue(classify(['docs/method/phased-pilot.md'], '1.23.0', '1.23.0')['public_changed'])
    def test_new_edition(self):
        self.assertTrue(classify(['_data/release.yml'], '1.23.0', '1.24.0')['edition_changed'])
    def test_rerender_dependencies_require_explicit_edition(self):
        self.assertFalse(classify(['tools/export_decks.cjs'], '1.23.0', '1.23.0')['edition_changed'])

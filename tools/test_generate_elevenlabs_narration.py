"""Protect credit preflight, bounded previews and charged-request recovery."""
import contextlib
import io
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import generate_elevenlabs_narration as generator
from captions_from_alignment import aligned_words


class GenerationTests(unittest.TestCase):
    def setUp(self):
        self.scripts = json.loads((generator.ROOT / 'assets/data/narration-scripts.json').read_text())
        self.profile = json.loads((generator.ROOT / 'assets/data/narration-voice.json').read_text())

    def test_all_slide_scripts_restore_to_the_display_text(self):
        plan = generator.build_plan(self.scripts, self.profile, generator.DECKS)
        self.assertEqual({(job['audience'], job['slide']) for job in plan['jobs']}, {(audience, slide) for audience, slides in self.scripts['decks'].items() for slide in slides})
        for job in plan['jobs']:
            text = job['speakText']
            fixture = {'characters': list(text),
                       'character_start_times_seconds': [i / 30 for i in range(len(text))],
                       'character_end_times_seconds': [(i + 1) / 30 for i in range(len(text))]}
            with self.subTest(slide=(job['audience'], job['slide'])):
                words = aligned_words(fixture, job['text'])
                self.assertTrue(words)
                self.assertNotIn('A I', text)
                self.assertNotIn('Q E', text)

    def test_private_preview_cannot_expand_to_a_full_batch(self):
        with self.assertRaisesRegex(ValueError, 'four slides'):
            generator.build_plan(self.scripts, self.profile, generator.DECKS, private=True)
        with self.assertRaisesRegex(ValueError, 'exactly one audience'):
            generator.build_plan(self.scripts, self.profile, generator.DECKS, ['slide-1'])
        plan = generator.build_plan(self.scripts, self.profile, ['evp'], ['slide-18', 'slide-19'], private=True)
        self.assertEqual(plan['purpose'], 'private-preview')
        self.assertEqual(len(plan['jobs']), 2)

    def test_account_preflight_checks_license_and_full_remaining_cost(self):
        free = {'tier': 'free', 'character_count': 3144, 'character_limit': 10000}
        with self.assertRaisesRegex(ValueError, 'paid subscription'):
            generator.check_allowance(free, 1000)
        self.assertEqual(generator.check_allowance(free, 1000, private=True), 6856)
        with self.assertRaisesRegex(ValueError, 'only 6,856'):
            generator.check_allowance({**free, 'tier': 'creator'}, 53000)
        with self.assertRaisesRegex(ValueError, 'unavailable'):
            generator.check_allowance({'tier': 'creator'}, 53000)
        self.assertEqual(generator.check_allowance({'tier': 'creator', 'character_count': 5000,
            'character_limit': 100000}, 53000), 95000)

    def test_uncertain_request_is_not_charged_again_on_resume(self):
        with tempfile.TemporaryDirectory() as temporary:
            output = Path(temporary)
            argv = ['generate', '--output', str(output), '--audience', 'evp', '--slide', 'slide-18',
                    '--private-preview']
            with patch('sys.argv', argv), contextlib.redirect_stdout(io.StringIO()):
                generator.main()
            folder = output / 'evp/slide-18'
            folder.mkdir(parents=True)
            (folder / 'request.json').write_text('{}')
            with patch('sys.argv', argv + ['--generate']), patch.object(generator.Client, 'request') as request:
                with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
                    with self.assertRaises(SystemExit):
                        generator.main()
                request.assert_not_called()


if __name__ == '__main__':
    unittest.main()

"""Verify input limits, complete scripts and preservation of existing output."""
import json
import tempfile
import unittest
from pathlib import Path

from prepare_jianying_narration import ROOT, prepare, split_text


class JianyingPreparationTests(unittest.TestCase):
    def test_long_sentence_preserves_words_and_limit(self):
        text = 'A short opening. ' + ' '.join(['repeatable'] * 95) + '. Final sentence.'
        parts = split_text(text, 100)
        self.assertEqual(' '.join(parts), text)
        self.assertTrue(all(0 < len(p) <= 100 for p in parts))
        with self.assertRaises(ValueError):
            split_text('x' * 101, 100)

    def test_all_audience_scripts_keep_slide_mapping(self):
        source = ROOT / 'assets/data/narration-scripts.json'
        data = json.loads(source.read_text())
        with tempfile.TemporaryDirectory() as tmp:
            for audience in ('audition', 'evp', 'technical', 'industry-evp', 'industry-technical'):
                output = Path(tmp) / audience
                result = prepare(source, output, audience)
                scripts = {'audition': data['audition']} if audience == 'audition' else data['decks'][audience]
                for slide, script in scripts.items():
                    parts = [s for s in result['segments'] if s['slide'] == slide]
                    self.assertEqual(' '.join(s['text'] for s in parts), ' '.join(script['speakText'].split()))
                    self.assertTrue(all(s['characters'] <= 450 and s['words'] < 500 for s in parts))
                self.assertIn('STAGING TIMES ONLY', (output / 'README.txt').read_text())
                marker = output / 'keep-my-audio.wav'
                marker.write_bytes(b'untouched')
                with self.assertRaises(FileExistsError):
                    prepare(source, output, audience)
                self.assertEqual(marker.read_bytes(), b'untouched')


if __name__ == '__main__':
    unittest.main()

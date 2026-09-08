"""Check pronunciation restoration and preservation of measured caption times."""
import importlib.util
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

SOURCE = Path(__file__).with_name('captions_from_alignment.py')
spec = importlib.util.spec_from_file_location('captions_from_alignment', SOURCE)
converter = importlib.util.module_from_spec(spec)
spec.loader.exec_module(converter)


def alignment(text):
    # Uneven, explicit fixture times expose word-count interpolation.
    starts, ends, clock = [], [], .123
    for index, _ in enumerate(text):
        starts.append(round(clock, 3))
        clock += (.021, .083, .037)[index % 3]
        ends.append(round(clock, 3))
    return {'characters': list(text), 'character_start_times_seconds': starts,
            'character_end_times_seconds': ends}


class AlignmentCaptionTests(unittest.TestCase):
    def test_restores_terms_without_changing_measured_group_times(self):
        spoken = 'Q A, Q E, A I, A P I, C I, Wire Mock, Postgres Q L, J Unit, Rest Assured.'
        display = 'QA, QE, AI, API, CI, WireMock, PostgreSQL, JUnit, REST Assured.'
        source = alignment(spoken)
        words = converter.aligned_words({'alignment': source}, display)
        self.assertEqual([word.text for word in words],
                         ['QA,', 'QE,', 'AI,', 'API,', 'CI,', 'WireMock,', 'PostgreSQL,', 'JUnit,', 'REST Assured.'])
        expected_source = ['Q A,', 'Q E,', 'A I,', 'A P I,', 'C I,', 'Wire Mock,', 'Postgres Q L,', 'J Unit,', 'Rest Assured.']
        offset = 0
        for word, original in zip(words, expected_source):
            start = spoken.index(original, offset)
            end = start + len(original)
            self.assertEqual(word.start, source['character_start_times_seconds'][start])
            self.assertEqual(word.end, source['character_end_times_seconds'][end - 1])
            offset = end

    def test_rejects_mismatch_and_invalid_times(self):
        valid = alignment('A I checks one debit.')
        with self.assertRaisesRegex(ValueError, 'canonical display'):
            converter.aligned_words(valid, 'AI checks two debits.')
        mutations = [
            lambda x: x['characters'].pop(),
            lambda x: x['character_start_times_seconds'].__setitem__(0, -1),
            lambda x: x['character_end_times_seconds'].__setitem__(1, float('nan')),
            lambda x: x['character_start_times_seconds'].__setitem__(2, 0),
            lambda x: x['characters'].__setitem__(0, 'AB'),
        ]
        for mutate in mutations:
            source = json.loads(json.dumps(valid))
            mutate(source)
            with self.subTest(source=source):
                with self.assertRaises(ValueError):
                    converter.aligned_words(source, 'AI checks one debit.')

    def test_cues_fit_lines_and_end_at_actual_word_boundaries(self):
        text = ('Our Banking Client has limited test environments. '
                'AI assists test preparation and interpretation. '
                'Real provider checks remain a separate gate.')
        words = converter.aligned_words(alignment(text), text)
        cues = converter.caption_cues(words)
        self.assertEqual(converter.normalized(' '.join(cue.text for cue in cues)), text)
        self.assertEqual(cues[0].start, words[0].start)
        self.assertEqual(cues[-1].end, words[-1].end)
        starts, ends = {word.start for word in words}, {word.end for word in words}
        for cue in cues:
            self.assertIn(cue.start, starts)
            self.assertIn(cue.end, ends)
            self.assertLessEqual(cue.end - cue.start, 7)
            self.assertLessEqual(len(cue.text.splitlines()), 2)
            self.assertTrue(all(len(line) <= 42 for line in cue.text.splitlines()))
        with self.assertRaisesRegex(ValueError, 'seven-second'):
            converter.caption_cues([converter.TimedText(.123, 9.321, 'Unsplit')])

    def test_cli_writes_exact_vtt_and_srt_times_and_refuses_mismatch(self):
        with tempfile.TemporaryDirectory() as temporary:
            folder = Path(temporary)
            source = alignment('A I checks.')
            (folder / 'alignment.json').write_text(json.dumps(source))
            (folder / 'display.txt').write_text('AI checks.')
            cmd = [sys.executable, str(SOURCE), '--alignment', str(folder / 'alignment.json'),
                   '--display-text', str(folder / 'display.txt'), '--output', str(folder / 'captions')]
            result = subprocess.run(cmd, capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stderr)
            end = converter.timestamp(source['character_end_times_seconds'][-1])
            self.assertIn(f'00:00:00.123 --> {end}', (folder / 'captions.vtt').read_text())
            self.assertIn(f'00:00:00,123 --> {end.replace(".", ",")}', (folder / 'captions.srt').read_text())
            repeated = subprocess.run(cmd, capture_output=True, text=True)
            self.assertNotEqual(repeated.returncode, 0)
            self.assertIn('already exists', repeated.stderr)
            (folder / 'display.txt').write_text('An unspoken replacement.')
            cmd[-1] = str(folder / 'mismatch')
            mismatch = subprocess.run(cmd, capture_output=True, text=True)
            self.assertNotEqual(mismatch.returncode, 0)
            self.assertFalse((folder / 'mismatch.vtt').exists())
            self.assertFalse((folder / 'mismatch.srt').exists())


if __name__ == '__main__':
    unittest.main()

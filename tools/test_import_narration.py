"""Exercise narration import with temporary recordings, never public assets."""
import importlib.util
import json
import subprocess
import sys
import tempfile
import unittest
import wave
from pathlib import Path

SOURCE = Path(__file__).with_name('import_narration.py')
spec = importlib.util.spec_from_file_location('import_narration', SOURCE)
importer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(importer)


class NarrationImportTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.caption = self.root / 'recording.srt'

    def test_srt_preserves_actual_times_and_lines(self):
        self.caption.write_text('1\n00:00:00,250 --> 00:00:01,100\nOur Banking Client\nchecks one debit.\n\n2\n00:00:01,300 --> 00:00:02,000\nReal provider checks remain.\n')
        self.assertEqual(importer.captions(self.caption, 2), [
            (.25, 1.1, 'Our Banking Client\nchecks one debit.'),
            (1.3, 2, 'Real provider checks remain.')])

    def test_rejects_unusable_or_misleading_cues(self):
        for body in (
            '00:00:01.000 --> 00:00:00.500\nReversed',
            '00:00:00.000 --> 00:00:02.500\nBeyond recording',
            '00:00:00.000 --> 00:00:01.000\nOne\n\n00:00:00.500 --> 00:00:02.000\nOverlap',
            '00:00:00.000 --> 00:00:01.000\nOne\nTwo\nThree',
            '00:00:00.000 --> 00:00:01.000\n' + 'x' * 57,
            '00:00:00.000 --> 00:00:01.000\n<b>Markup</b>',
            '00:00:00.000 --> 00:00:60.000\nInvalid clock',
            'Untimed transcript',
        ):
            with self.subTest(body=body):
                self.caption.write_text('WEBVTT\n\n' + body)
                with self.assertRaises(ValueError):
                    importer.captions(self.caption, 2)

    def test_cli_uses_measured_audio_and_refuses_overwrite(self):
        for folder in ('tools', '_data', 'assets/data'):
            (self.root / folder).mkdir(parents=True)
        script = self.root / 'tools/import_narration.py'
        script.write_text(SOURCE.read_text())
        (self.root / '_data/fintech_decks.json').write_text(json.dumps({'evp': [{}], 'technical': [{}]}))
        manifest_path = self.root / 'assets/data/narration.json'
        manifest_path.write_text(json.dumps({'edition': 'draft', 'decks': {'evp': {'slides': {}}}}))
        recording = self.root / 'recording.wav'
        with wave.open(str(recording), 'wb') as wav:
            wav.setnchannels(1)
            wav.setsampwidth(2)
            wav.setframerate(8000)
            wav.writeframes(b'\0\0' * 16000)
        self.caption.write_text('1\n00:00:00,200 --> 00:00:01,800\nTest fixture only.\n')
        cmd = [sys.executable, str(script), '--audience', 'evp', '--slide', 'slide-1',
               '--audio', str(recording), '--captions', str(self.caption), '--voice',
               'Test fixture', '--recording-edition', 'test-1']
        result = subprocess.run(cmd, capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        clip = json.loads(manifest_path.read_text())['decks']['evp']['slides']['slide-1']
        self.assertEqual(clip['duration'], 2)
        self.assertEqual(clip['transcript'], 'Test fixture only.')
        self.assertEqual(len(clip['sha256']), 64)
        self.assertIn('00:00:00.200 --> 00:00:01.800', (self.root / clip['captions'].lstrip('/')).read_text())
        before = manifest_path.read_bytes()
        repeated = subprocess.run(cmd, capture_output=True, text=True)
        self.assertNotEqual(repeated.returncode, 0)
        self.assertIn('Recording already exists', repeated.stderr)
        self.assertEqual(before, manifest_path.read_bytes())


if __name__ == '__main__':
    unittest.main()

"""Check complete script, recording and caption coverage for the four decks."""
import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path

from import_narration import captions

ROOT = Path(__file__).resolve().parents[1]
ROUTES = {'evp': 'fintech-evp', 'technical': 'fintech-technical',
          'industry-evp': 'evp', 'industry-technical': 'technical'}


def words(text):
    return re.findall(r"[a-z0-9]+", text.lower())


def validate(scripts_only=False, require_complete=False):
    scripts = json.loads((ROOT / 'assets/data/narration-scripts.json').read_text())['decks']
    manifest = json.loads((ROOT / 'assets/data/narration.json').read_text())
    expected_total = recorded = 0
    for key, route in ROUTES.items():
        page = (ROOT / 'briefings' / (route + '.html')).read_text()
        count = int(re.search(r'^slide_count: (\d+)$', page, re.M)[1])
        expected = {f'slide-{i}' for i in range(1, count + 1)}
        assert set(scripts[key]) == expected, f'{route}: script coverage mismatch'
        assert f'narration_deck: {key}' in page, f'{route}: incorrect recording key'
        for slide, script in scripts[key].items():
            assert all(script.get(k, '').strip() for k in ('title', 'text', 'speakText')), f'{key}/{slide}: empty script'
        expected_total += count
        if scripts_only:
            continue
        entries = manifest['decks'].get(key, {}).get('slides', {})
        assert set(entries) <= expected, f'{route}: recording for a nonexistent slide'
        if require_complete or manifest.get('complete'):
            assert set(entries) == expected, f'{route}: missing recordings {sorted(expected - set(entries))}'
        for slide, entry in entries.items():
            paths = []
            for field in ('audio', 'captions'):
                name = entry[field]
                assert name.startswith('/assets/audio/'), f'{key}/{slide}: unexpected asset path'
                path = (ROOT / name.lstrip('/')).resolve()
                assert path.is_relative_to(ROOT / 'assets/audio') and path.is_file(), f'Missing recording asset: {name}'
                paths.append(path)
            audio, subtitle = paths
            duration = float(json.loads(subprocess.check_output(
                ['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'json', str(audio)]))['format']['duration'])
            assert 0 < duration < 600 and abs(duration - entry['duration']) < .2, f'{key}/{slide}: duration mismatch'
            assert hashlib.sha256(audio.read_bytes()).hexdigest() == entry['sha256'], f'{key}/{slide}: audio hash mismatch'
            cues = captions(subtitle, duration)
            assert words(' '.join(c[2] for c in cues)) == words(entry['transcript']), f'{key}/{slide}: captions differ from transcript'
            assert words(entry['transcript']) == words(scripts[key][slide]['text']), f'{key}/{slide}: recording transcript differs from approved script'
            assert entry.get('voice') and entry.get('caption_method'), f'{key}/{slide}: missing recording provenance'
            recorded += 1
    print(f'Narration verified: {expected_total} slide scripts' + ('' if scripts_only else f', {recorded} recordings with timed captions'))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--scripts-only', action='store_true')
    parser.add_argument('--require-complete', action='store_true')
    args = parser.parse_args()
    validate(args.scripts_only, args.require_complete)

"""Import a reviewed audio recording and its timed captions into a presentation.

Does not generate speech, estimate timings, or contact a provider. ffprobe is
required to check that every caption fits the actual recording duration.
"""
import argparse
import hashlib
import json
import re
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STAMP = r"(?:\d{2}:)?\d{2}:\d{2}[.,]\d{3}"


def seconds(value):
    fields = value.replace(',', '.').split(':')
    if float(fields[-1]) >= 60 or float(fields[-2]) >= 60:
        raise ValueError('Caption minutes and seconds must be less than 60')
    return sum(float(part) * 60 ** i for i, part in enumerate(reversed(fields)))


def timestamp(value):
    total = round(value * 1000)
    hours, total = divmod(total, 3600000)
    minutes, total = divmod(total, 60000)
    secs, millis = divmod(total, 1000)
    return f'{hours:02}:{minutes:02}:{secs:02}.{millis:03}'


def captions(source, duration):
    text = source.read_text(encoding='utf-8-sig').replace('\r\n', '\n').strip()
    cues = []
    previous_end = 0
    for block in re.split(r'\n\s*\n', text):
        lines = block.splitlines()
        if not lines or lines[0].startswith(('WEBVTT', 'NOTE', 'STYLE', 'REGION')):
            continue
        timing = next((i for i, line in enumerate(lines) if '-->' in line), None)
        if timing is None:
            raise ValueError('Caption block is missing a timing line')
        match = re.fullmatch(rf'({STAMP})\s+-->\s+({STAMP})(?:\s+.*)?', lines[timing])
        if not match:
            raise ValueError(f'Invalid caption timing: {lines[timing]}')
        start, end = map(seconds, match.groups())
        body = [line.strip() for line in lines[timing + 1:]]
        if start < previous_end or end <= start or end > duration + .15:
            raise ValueError('Captions overlap, are reversed, or exceed the audio duration')
        if not body or not all(body) or len(body) > 2 or any(len(line) > 56 for line in body):
            raise ValueError('Use one or two caption lines, each at most 56 characters')
        if any('<' in line or '>' in line for line in body):
            raise ValueError('Use plain-text captions without inline tags')
        cues.append((start, end, '\n'.join(body)))
        previous_end = end
    if not cues:
        raise ValueError('No timed captions found')
    return cues


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--audience', choices=('evp', 'technical', 'industry-evp', 'industry-technical'), required=True)
    parser.add_argument('--slide', required=True, help='Existing stable slide ID, such as slide-18')
    parser.add_argument('--audio', type=Path, required=True)
    parser.add_argument('--captions', type=Path, required=True, help='Reviewed English .srt or .vtt')
    parser.add_argument('--voice', required=True, help='Provider and voice name for provenance')
    parser.add_argument('--caption-method', default='Reviewed audio-timed captions',
                        help='How the supplied caption timestamps were obtained')
    parser.add_argument('--recording-edition', required=True, help='Immutable asset folder, such as audition-1')
    args = parser.parse_args()
    if not re.fullmatch(r'slide-[1-9]\d*', args.slide):
        parser.error('Use an existing slide-N ID')
    if not re.fullmatch(r'[a-z0-9][a-z0-9.-]*', args.recording_edition):
        parser.error('Recording edition may contain lowercase letters, digits, dots and hyphens')
    if args.audience.startswith('industry-'):
        name = args.audience.removeprefix('industry-')
        html = (ROOT / 'briefings' / (name + '.html')).read_text()
        valid = args.slide in re.findall(r'id="(slide-\d+)"', html)
    else:
        deck = json.loads((ROOT / '_data/fintech_decks.json').read_text())[args.audience]
        valid = int(args.slide[6:]) <= len(deck)
    if not valid:
        parser.error('Slide does not exist in this audience deck')
    if args.audio.suffix.lower() not in ('.mp3', '.wav', '.m4a', '.ogg'):
        parser.error('Unsupported audio extension')
    if args.captions.suffix.lower() not in ('.srt', '.vtt'):
        parser.error('Use an SRT or WebVTT caption file')
    result = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
                             '-of', 'json', str(args.audio)], check=True, capture_output=True, text=True)
    duration = float(json.loads(result.stdout)['format']['duration'])
    if not 0 < duration < 600:
        parser.error('Expected one slide recording shorter than ten minutes')
    try:
        cues = captions(args.captions, duration)
    except ValueError as error:
        parser.error(str(error))
    folder = ROOT / 'assets/audio' / args.recording_edition / args.audience
    audio_path = folder / (args.slide + args.audio.suffix.lower())
    caption_path = folder / (args.slide + '.vtt')
    if audio_path.exists() or caption_path.exists():
        parser.error('Recording already exists; use a new recording edition')
    manifest_path = ROOT / 'assets/data/narration.json'
    manifest = json.loads(manifest_path.read_text())
    folder.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(args.audio, audio_path)
    caption_path.write_text('WEBVTT\n\n' + '\n\n'.join(
        f'{timestamp(start)} --> {timestamp(end)}\n{body}' for start, end, body in cues) + '\n')
    manifest['edition'] = args.recording_edition
    manifest['decks'].setdefault(args.audience, {'label': args.audience, 'slides': {}})
    manifest['decks'][args.audience]['slides'][args.slide] = {
        'audio': '/' + audio_path.relative_to(ROOT).as_posix(),
        'captions': '/' + caption_path.relative_to(ROOT).as_posix(),
        'transcript': ' '.join(body.replace('\n', ' ') for _, _, body in cues),
        'voice': args.voice,
        'caption_method': args.caption_method,
        'duration': round(duration, 3),
        'sha256': hashlib.sha256(audio_path.read_bytes()).hexdigest()
    }
    temporary = manifest_path.with_suffix('.json.tmp')
    temporary.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + '\n')
    temporary.replace(manifest_path)
    print(f'Imported {args.audience}/{args.slide}: {duration:.2f}s, {len(cues)} reviewed caption cues')


if __name__ == '__main__':
    main()

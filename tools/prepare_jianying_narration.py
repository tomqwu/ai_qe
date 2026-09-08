"""Prepare short narration inputs and an optional pyJianYingDraft text timeline.

Uses staging times only. Generate speech and recognize final captions in Jianying;
the library does not provide TTS or Mac UI/export automation.
"""
import argparse
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def split_text(text, max_chars=450):
    """Prefer sentence boundaries; preserve every word and cap each input."""
    if not 1 <= max_chars <= 500:
        raise ValueError('Use a character limit between 1 and 500')
    text = ' '.join(text.split())
    if not text:
        raise ValueError('Narration text is empty')
    sentences = re.split(r'(?<=[.!?。！？])\s+', text)
    parts, current = [], ''
    for sentence in sentences:
        # Long sentences fall back to whole words; never silently truncate.
        units = [sentence] if len(sentence) <= max_chars else sentence.split()
        for unit in units:
            if len(unit) > max_chars:
                raise ValueError('A single word exceeds the input limit; edit the script')
            joined = f'{current} {unit}'.strip()
            if len(joined) > max_chars:
                parts.append(current)
                current = unit
            else:
                current = joined
    if current:
        parts.append(current)
    assert ' '.join(parts) == text
    return parts


def stamp(seconds):
    minutes, seconds = divmod(seconds, 60)
    hours, minutes = divmod(minutes, 60)
    return f'{hours:02}:{minutes:02}:{seconds:02},000'


def prepare(source, output, audience='audition', max_chars=450, slot_seconds=60,
            create_draft=False):
    if slot_seconds < 1:
        raise ValueError('Staging slots must be positive')
    data = json.loads(source.read_text())
    scripts = {'audition': data['audition']} if audience == 'audition' else data['decks'][audience]
    segments = []
    for slide, script in scripts.items():
        for part, text in enumerate(split_text(script['speakText'], max_chars), 1):
            index = len(segments) + 1
            segments.append({
                'id': f'{index:03}', 'audience': audience, 'slide': slide,
                'title': script['title'], 'part': part, 'text': text,
                'characters': len(text), 'words': len(text.split()),
                'staging_start_seconds': (index - 1) * slot_seconds,
                'staging_duration_seconds': slot_seconds,
                'input_file': f'{index:03}-{slide}-part-{part:02}.txt',
            })
    if not segments:
        raise ValueError('No narration scripts found')
    if create_draft:
        import pyJianYingDraft as draft
    # A new directory avoids overwriting a recording or hand-edited export.
    output.mkdir(parents=True, exist_ok=False)
    for item in segments:
        (output / item['input_file']).write_text(item['text'] + '\n')
    manifest = {
        'timing_kind': 'staging-only-not-final-captions',
        'max_characters': max_chars, 'segments': segments,
    }
    (output / 'segments.json').write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + '\n')
    srt = output / 'tts-input-staging.srt'
    srt.write_text('\n\n'.join(
        f"{i}\n{stamp(s['staging_start_seconds'])} --> "
        f"{stamp(s['staging_start_seconds'] + slot_seconds)}\n{s['text']}"
        for i, s in enumerate(segments, 1)) + '\n')
    (output / 'README.txt').write_text(
        'NARRATION INPUTS — STAGING TIMES ONLY\n\n'
        'Import tts-input-staging.srt into a separate Jianying draft, add it to the '
        'timeline, and generate the same voice for each segment. The 450-character '
        'default is below both a 500-word and a 500-character input limit.\n\n'
        'Staging slots are not speaking durations. Preserve slide/part order in '
        'segments.json. Join each slide using the actual generated audio lengths; '
        'remove staging gaps, not intentional spoken pauses. Recognize English '
        'captions from the final audio and proofread terminology.\n\n'
        'The optional library draft is a generated artifact, not an installed Mac '
        'project. Recent Jianying versions may not load it directly. SRT import is '
        'the tested fallback on Mac 10.5.0. Never replace an existing native draft.\n'
    )
    if create_draft:
        folder = output / 'library-draft'
        folder.mkdir()
        script = draft.DraftFolder(str(folder)).create_draft(
            'AIxQE narration inputs', 1920, 1080, allow_replace=False)
        script.import_srt(str(srt), 'Narration inputs - staging only')
        script.save()
    return manifest


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, default=ROOT / 'assets/data/narration-scripts.json')
    parser.add_argument('--output', type=Path, required=True, help='New local folder outside the public assets')
    parser.add_argument('--audience', choices=['audition', 'evp', 'technical', 'industry-evp', 'industry-technical'], default='audition')
    parser.add_argument('--max-chars', type=int, default=450)
    parser.add_argument('--slot-seconds', type=int, default=60, help='Staging only; never final timing')
    parser.add_argument('--draft', action='store_true', help='Requires optional pyJianYingDraft==0.3.0')
    args = parser.parse_args()
    try:
        manifest = prepare(args.source, args.output, args.audience, args.max_chars,
                           args.slot_seconds, args.draft)
    except (ValueError, FileExistsError, ModuleNotFoundError) as error:
        parser.error(str(error))
    segments = manifest['segments']
    print(f"Prepared {len(segments)} inputs; largest {max(s['characters'] for s in segments)} characters. "
          'All times are staging placeholders.')


if __name__ == '__main__':
    main()

"""Create WebVTT and SRT from actual ElevenLabs character alignment.

Uses original character timestamps, restores the approved display terminology,
and refuses a transcript mismatch. No speech generation or timing estimation.
"""
import argparse
import json
import math
import re
import unicodedata
from pathlib import Path
from typing import NamedTuple


class TimedText(NamedTuple):
    start: float
    end: float
    text: str


PRONUNCIATIONS = (
    ('A P I', 'API'), ('Postgres Q L', 'PostgreSQL'),
    ('Q A', 'QA'), ('Q E', 'QE'), ('A I', 'AI'), ('C I', 'CI'),
    ('Wire Mock', 'WireMock'), ('J Unit', 'JUnit'), ('Rest Assured', 'REST Assured'),
    ('Test containers', 'Testcontainers'), ('Postgres', 'PostgreSQL'),
)


def normalized(text):
    return ' '.join(unicodedata.normalize('NFKC', text).split())


def aligned_words(document, display_text):
    if not isinstance(document, dict):
        raise ValueError('Expected a character alignment object')
    alignment = document.get('alignment', document)
    if not isinstance(alignment, dict):
        raise ValueError('Expected a character alignment object')
    characters = alignment.get('characters')
    starts = alignment.get('character_start_times_seconds')
    ends = alignment.get('character_end_times_seconds')
    if not all(isinstance(value, list) for value in (characters, starts, ends)) or not characters:
        raise ValueError('Expected nonempty character and timestamp arrays')
    if len(characters) != len(starts) or len(starts) != len(ends):
        raise ValueError('Character and timestamp array lengths differ')
    previous_end = 0
    for character, start, end in zip(characters, starts, ends):
        if not isinstance(character, str) or len(character) != 1:
            raise ValueError('Every alignment character must contain exactly one character')
        if any(isinstance(t, bool) or not isinstance(t, (int, float)) or not math.isfinite(t)
               for t in (start, end)):
            raise ValueError('Character times must be finite numbers')
        if start < previous_end or end < start:
            raise ValueError('Character times are negative, overlapping or reversed')
        previous_end = end
    source = ''.join(characters)
    raw = list(re.finditer(r'\S+', source))
    words, index = [], 0
    while index < len(raw):
        first = last = raw[index]
        restored = first.group()
        consumed = 1
        for spoken, display in PRONUNCIATIONS:
            count = len(spoken.split())
            if index + count > len(raw):
                continue
            candidate = ' '.join(match.group() for match in raw[index:index + count])
            match = re.fullmatch(r'(["“‘(]*)' + re.escape(spoken) + r'([.,;:!?…"”’)]*)', candidate)
            if match:
                restored = match[1] + display + match[2]
                last = raw[index + count - 1]
                consumed = count
                break
        word = TimedText(starts[first.start()], ends[last.end() - 1], restored)
        if word.end <= word.start:
            raise ValueError(f'Word has no positive measured duration: {restored}')
        if '<' in restored or '>' in restored:
            raise ValueError('Use plain-text captions without markup')
        words.append(word)
        index += consumed
    restored_text = normalized(' '.join(word.text for word in words))
    if not restored_text or restored_text != normalized(display_text):
        raise ValueError('Aligned spoken text does not match the canonical display text after pronunciation restoration')
    return words


WEAK_ENDINGS = {'a', 'an', 'the', 'and', 'or', 'but', 'of', 'to', 'with', 'for',
                'from', 'in', 'on', 'can', 'will', 'must', 'its', 'our', 'their'}


def weak_ending(text):
    return text.lower() in WEAK_ENDINGS


def caption_lines(words):
    text = ' '.join(word.text for word in words)
    if len(text) <= 42:
        return [text]
    candidates = []
    for split in range(1, len(words)):
        left = ' '.join(word.text for word in words[:split])
        right = ' '.join(word.text for word in words[split:])
        if max(len(left), len(right)) <= 42:
            score = abs(len(left) - len(right)) + 18 * weak_ending(words[split - 1].text)
            if re.search(r'[,;:.!?]["”’)]*$', left):
                score -= 8
            candidates.append((score, left, right))
    if not candidates:
        return None
    _, left, right = min(candidates)
    return [left, right]


def caption_cues(words):
    """Choose real word boundaries with readable lines and useful phrase breaks."""
    count = len(words)
    if not count:
        raise ValueError('No timed words')
    # Dynamic programming avoids leaving an unnecessarily tiny final cue.
    costs, choices = [math.inf] * count + [0], {}
    for start in range(count - 1, -1, -1):
        for stop in range(start + 1, count + 1):
            duration = words[stop - 1].end - words[start].start
            lines = caption_lines(words[start:stop])
            if duration > 7 or lines is None:
                break
            ending = words[stop - 1].text
            punctuation = 0 if re.search(r'[.!?]["”’)]*$', ending) else .45 if re.search(r'[,;:]["”’)]*$', ending) else 1.15
            if stop < count and words[stop].start - words[stop - 1].end >= .2:
                punctuation = min(punctuation, .45)
            score = 1 + .2 * (duration - 3.7) ** 2 + punctuation + 3 * weak_ending(ending)
            # Prefer a complete spoken sentence over carrying its next half-sentence.
            score += sum(2.5 for word in words[start:stop - 1]
                         if re.search(r'[.!?]["”’)]*$', word.text) and word.end - words[start].start >= 2)
            if duration < 2:
                score += 3 * (2 - duration) ** 2
            if duration > 5:
                score += 2 * (duration - 5) ** 2
            total = score + costs[stop]
            if total < costs[start]:
                costs[start] = total
                choices[start] = (stop, '\n'.join(lines))
    if not math.isfinite(costs[0]):
        raise ValueError('A timed word cannot fit the seven-second or 42-character cue limits')
    cues, position = [], 0
    while position < count:
        stop, text = choices[position]
        cues.append(TimedText(words[position].start, words[stop - 1].end, text))
        position = stop
    return cues


def timestamp(value, separator='.'):
    total = round(value * 1000)
    hours, total = divmod(total, 3600000)
    minutes, total = divmod(total, 60000)
    seconds, millis = divmod(total, 1000)
    return f'{hours:02}:{minutes:02}:{seconds:02}{separator}{millis:03}'


def write_captions(cues, output):
    vtt, srt = Path(str(output) + '.vtt'), Path(str(output) + '.srt')
    if vtt.exists() or srt.exists():
        raise ValueError('Caption output already exists; choose a new output stem')
    for cue in cues:
        if round(cue.end * 1000) <= round(cue.start * 1000):
            raise ValueError('Measured cue is too short for millisecond subtitle precision')
    vtt_text = 'WEBVTT\n\n' + '\n\n'.join(
        f'{timestamp(cue.start)} --> {timestamp(cue.end)}\n{cue.text}' for cue in cues) + '\n'
    srt_text = '\n\n'.join(
        f'{index}\n{timestamp(cue.start, ",")} --> {timestamp(cue.end, ",")}\n{cue.text}'
        for index, cue in enumerate(cues, 1)) + '\n'
    vtt.parent.mkdir(parents=True, exist_ok=True)
    vtt.write_text(vtt_text, encoding='utf-8')
    srt.write_text(srt_text, encoding='utf-8')
    return vtt, srt


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--alignment', required=True, type=Path, help='ElevenLabs alignment object or response containing alignment')
    parser.add_argument('--display-text', required=True, type=Path, help='Canonical UTF-8 transcript with display terminology')
    parser.add_argument('--output', required=True, type=Path, help='New output stem; writes .vtt and .srt')
    args = parser.parse_args()
    try:
        document = json.loads(args.alignment.read_text(encoding='utf-8'))
        if not isinstance(document, dict):
            raise ValueError('Expected a JSON alignment object')
        display_text = args.display_text.read_text(encoding='utf-8-sig')
        cues = caption_cues(aligned_words(document, display_text))
        outputs = write_captions(cues, args.output)
    except (ValueError, OSError) as error:
        parser.error(str(error))
    print(f'Created {len(cues)} cues from measured character times: ' + ', '.join(map(str, outputs)))


if __name__ == '__main__':
    main()

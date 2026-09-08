"""Prepare or generate slide narration with the approved ElevenLabs voice.

Outputs stay outside the repository. Default mode writes a reviewable plan;
--generate uses account credits. Final recordings require a paid subscription.
Use --private-preview only for a small, explicitly labelled listening preview.
"""
import argparse
import base64
import getpass
import hashlib
import json
import os
import subprocess
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

from captions_from_alignment import aligned_words, caption_cues, write_captions
from import_narration import captions

ROOT = Path(__file__).resolve().parents[1]
DECKS = ('evp', 'technical', 'industry-evp', 'industry-technical')
PAID_TIERS = {'starter', 'creator', 'pro', 'scale', 'business', 'enterprise'}


def fingerprint(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True).encode()).hexdigest()


def write_json(path, value):
    temporary = path.with_suffix(path.suffix + '.tmp')
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    temporary.replace(path)


def build_plan(scripts, profile, audiences, slides=None, private=False):
    if slides and len(audiences) != 1:
        raise ValueError('--slide requires exactly one audience')
    jobs = []
    for audience in audiences:
        chosen = slides or list(scripts['decks'][audience])
        for slide in chosen:
            if slide not in scripts['decks'][audience]:
                raise ValueError(f'Unknown slide: {audience}/{slide}')
            script = scripts['decks'][audience][slide]
            if not 0 < len(script['speakText']) <= 5000:
                raise ValueError(f'{audience}/{slide}: outside Eleven v3 input limits')
            jobs.append({'audience': audience, 'slide': slide, **script})
    total = sum(len(job['speakText']) for job in jobs)
    if private and (len(jobs) > 4 or total > 4000):
        raise ValueError('A private preview is limited to four slides and 4,000 characters')
    return {'schema': 1, 'purpose': 'private-preview' if private else 'client-presentation',
            'profile': profile, 'characters': total, 'jobs': jobs}


def check_allowance(subscription, characters, private=False):
    tier = subscription.get('tier')
    if not private and tier not in PAID_TIERS:
        raise ValueError(f'Client recordings require a paid subscription; API reports {tier!r}. '
                         'No speech has been generated.')
    used, limit = subscription.get('character_count'), subscription.get('character_limit')
    if not all(isinstance(n, (int, float)) for n in (used, limit)):
        raise ValueError('Account credit allowance is unavailable; generation has not started')
    remaining = max(0, limit - used)
    if characters > remaining:
        raise ValueError(f'Need approximately {characters:,} credits; only {remaining:,.0f} remain. '
                         'Generation has not started.')
    return remaining


class Client:
    def __init__(self, key):
        self.key = key

    def request(self, path, body=None):
        request = urllib.request.Request('https://api.elevenlabs.io' + path,
            data=None if body is None else json.dumps(body).encode(),
            headers={'xi-api-key': self.key, 'Content-Type': 'application/json'})
        try:
            with urllib.request.urlopen(request, timeout=180) as response:
                return json.load(response)
        except urllib.error.HTTPError as error:
            try:
                detail = json.load(error).get('detail', {})
                message = detail.get('message', detail) if isinstance(detail, dict) else detail
            except (ValueError, AttributeError):
                message = 'Provider rejected the request'
            raise ValueError(f'ElevenLabs {error.code}: {str(message).replace(self.key, "[redacted]")[:400]}') from None
        except (OSError, TimeoutError):
            raise ValueError('Network response is uncertain. Check ElevenLabs history before retrying; '
                             'the tool will not automatically submit another charged request.') from None


def finish_recording(folder, job, profile):
    raw = folder / 'response.json'
    response = json.loads(raw.read_text())
    # Keep this response until all output checks succeed, so a caption failure
    # can be repaired without buying the same speech again.
    audio = folder / 'audio.mp3'
    audio.write_bytes(base64.b64decode(response['audio_base64'], validate=True))
    alignment = {k: response[k] for k in ('alignment', 'normalized_alignment') if k in response}
    write_json(folder / 'alignment.json', alignment)
    cues = caption_cues(aligned_words(alignment, job['text']))
    duration = float(json.loads(subprocess.check_output([
        'ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'json', str(audio)
    ]))['format']['duration'])
    if not 0 < duration < 600 or cues[-1].end > duration + .15:
        raise ValueError('Audio duration or caption alignment is invalid')
    for suffix in ('.srt', '.vtt'):
        (folder / ('captions' + suffix)).unlink(missing_ok=True)
    write_captions(cues, folder / 'captions')
    captions(folder / 'captions.vtt', duration)
    (folder / 'transcript.txt').write_text(job['text'] + '\n')
    request_receipt = json.loads((folder / 'request.json').read_text())
    receipt = {'fingerprint': fingerprint({'job': job, 'profile': profile}),
               'audience': job['audience'], 'slide': job['slide'],
               'voice': profile['provider'] + ' / ' + profile['voice'],
               'model_id': profile['model_id'], 'caption_method': profile['caption_method'],
               'duration': round(duration, 3), 'cues': len(cues),
               'sha256': hashlib.sha256(audio.read_bytes()).hexdigest(),
               'generated_at': request_receipt['requested_at'],
               'subscription_tier': request_receipt['subscription_tier'],
               'purpose': request_receipt['purpose']}
    write_json(folder / 'recording.json', receipt)
    raw.unlink()
    return receipt


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True, help='Private directory outside the repository')
    parser.add_argument('--audience', choices=DECKS, action='append', help='Default: all four decks')
    parser.add_argument('--slide', action='append', help='Limit one audience to selected existing slide IDs')
    parser.add_argument('--private-preview', action='store_true')
    parser.add_argument('--generate', action='store_true', help='Generate with account credits after preflight')
    parser.add_argument('--workers', type=int, choices=range(1, 5), default=1,
                        help='Concurrent requests, capped to the subscription allowance')
    args = parser.parse_args()
    try:
        output = args.output.expanduser().resolve()
        if output == ROOT or output.is_relative_to(ROOT):
            raise ValueError('Choose an output directory outside the public repository')
        scripts = json.loads((ROOT / 'assets/data/narration-scripts.json').read_text())
        profile = json.loads((ROOT / 'assets/data/narration-voice.json').read_text())
        plan = build_plan(scripts, profile, list(dict.fromkeys(args.audience or DECKS)),
                          list(dict.fromkeys(args.slide)) if args.slide else None, args.private_preview)
        output.mkdir(parents=True, exist_ok=True)
        plan_path = output / 'plan.json'
        if plan_path.exists() and json.loads(plan_path.read_text()) != plan:
            raise ValueError('This output directory contains a different plan; use a new directory')
        write_json(plan_path, plan)
        print(f"{len(plan['jobs'])} slides; {plan['characters']:,} characters; {profile['voice']}; {plan['purpose']}", flush=True)
        if not args.generate:
            print(f'Prepared {plan_path}. Add --generate to use the account after allowance checks.')
            return
        pending = []
        for job in plan['jobs']:
            folder = output / job['audience'] / job['slide']
            receipt_path = folder / 'recording.json'
            if receipt_path.exists():
                receipt = json.loads(receipt_path.read_text())
                assert receipt['fingerprint'] == fingerprint({'job': job, 'profile': profile}), 'Recording differs from plan'
                assert hashlib.sha256((folder / 'audio.mp3').read_bytes()).hexdigest() == receipt['sha256'], 'Recording hash differs'
                captions(folder / 'captions.vtt', receipt['duration'])
                continue
            if (folder / 'response.json').exists():
                finish_recording(folder, job, profile)
                continue
            if (folder / 'request.json').exists():
                raise ValueError(f'{folder}: previous request has no saved response. Check provider history before retrying.')
            pending.append(job)
        if not pending:
            print('All recordings and measured captions are complete.')
            return
        key = os.environ.pop('ELEVENLABS_API_KEY', None)
        if not key:
            if not sys.stdin.isatty():
                raise ValueError('Use an interactive hidden prompt or ELEVENLABS_API_KEY environment variable')
            key = getpass.getpass('ElevenLabs API key (hidden): ')
        client = Client(key)
        try:
            subscription = client.request('/v1/user/subscription')
            needed = sum(len(job['speakText']) for job in pending)
            remaining = check_allowance(subscription, needed, args.private_preview)
            print(f"Account: {subscription['tier']}; {remaining:,.0f} available credits; about {needed:,} needed.", flush=True)
            def generate(job):
                folder = output / job['audience'] / job['slide']
                folder.mkdir(parents=True, exist_ok=True)
                body = {k: profile[k] for k in ('model_id', 'voice_settings', 'language_code')}
                body['text'] = job['speakText']
                write_json(folder / 'request.json', {'requested_at': datetime.now(timezone.utc).isoformat(),
                    'subscription_tier': subscription['tier'], 'purpose': plan['purpose'],
                    'voice_id': profile['voice_id'], 'request': body})
                response = client.request('/v1/text-to-speech/' + profile['voice_id'] +
                    '/with-timestamps?output_format=' + profile['output_format'], body)
                write_json(folder / 'response.json', response)
                receipt = finish_recording(folder, job, profile)
                return job, receipt
            workers = min(args.workers, {'free': 2, 'starter': 3}.get(subscription['tier'], 4))
            completed = 0
            with ThreadPoolExecutor(max_workers=workers) as pool:
                # Only start one bounded group at a time. A validation or network
                # failure stops subsequent groups without resubmitting speech.
                for offset in range(0, len(pending), workers):
                    errors = []
                    futures = [pool.submit(generate, job) for job in pending[offset:offset + workers]]
                    for future in as_completed(futures):
                        try:
                            job, receipt = future.result()
                            completed += 1
                            print(f"{completed}/{len(pending)} {job['audience']}/{job['slide']}: {receipt['duration']}s, {receipt['cues']} cues", flush=True)
                        except Exception as error:
                            errors.append(error)
                    if errors:
                        raise errors[0]
        finally:
            client.key = None
            key = None
    except (ValueError, OSError, AssertionError, subprocess.CalledProcessError) as error:
        parser.exit(1, str(error) + '\n')


if __name__ == '__main__':
    main()

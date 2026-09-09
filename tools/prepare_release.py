"""Prepare the current publication assets and notes without contacting GitHub."""
import argparse
import hashlib
import json
import re
import shutil
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def prepare(output):
    release = dict((key, json.loads(value)) for key, value in
                   re.findall(r'^(\w+): (".*")$', (ROOT / '_data/release.yml').read_text(), re.M))
    assert re.fullmatch(r'\d+\.\d+\.\d+', release['version']), 'Invalid site version'
    for field in ('slide_edition', 'fintech_edition', 'research_edition', 'questionnaire_edition'):
        assert re.fullmatch(r'\d+(?:\.\d+\.\d+)?', release[field]), f'Invalid {field}'
    output.mkdir(parents=True, exist_ok=True)
    assert not list(output.iterdir()), 'Use an empty directory for the release package'
    filenames = [f'assets/pdf/ai-qe-{audience}-v{release["slide_edition"]}.pdf' for audience in ('evp', 'technical')]
    filenames += [f'assets/pdf/ai-qe-fintech-{audience}-v{release["fintech_edition"]}.pdf' for audience in ('evp', 'technical')]
    filenames += [f'assets/pdf/ai-qe-industry-research-v{release["research_edition"]}.pdf',
                  f'assets/pdf/ai-qe-discovery-questionnaire-v{release["questionnaire_edition"]}.pdf',
                  'assets/video/assurance-architecture.mp4', 'assets/video/assurance-architecture.vtt',
                  'assets/data/industry-sources.csv', 'assets/data/industry-sources.json',
                  'assets/data/qe-modernization-sources.csv', 'assets/data/qe-modernization-sources.json',
                  'assets/data/fintech-evidence-sources.csv', 'assets/data/fintech-evidence-sources.json']
    assets = output / 'assets'
    assets.mkdir()
    hashes = {}
    for filename in filenames:
        source = ROOT / filename
        assert source.is_file(), f'Missing publication asset: {filename}'
        shutil.copyfile(source, assets / source.name)
        hashes[source.name] = hashlib.sha256(source.read_bytes()).hexdigest()
    narration = json.loads((ROOT / 'assets/data/narration.json').read_text())
    assert narration.get('complete'), 'The narration release requires all slide recordings'
    bundle = assets / f'ai-qe-narration-v{release["version"]}.zip'
    scripts = json.loads((ROOT / 'assets/data/narration-scripts.json').read_text())['decks']
    assert set(narration['decks']) == set(scripts), 'Narration audiences differ from the slide scripts'
    total_slides = sum(len(slides) for slides in scripts.values())
    records = []
    for audience, deck in narration['decks'].items():
        assert set(deck['slides']) == set(scripts[audience]), f'{audience}: incomplete narration coverage'
        for slide, entry in deck['slides'].items():
            for field in ('audio', 'captions'):
                source = (ROOT / entry[field].lstrip('/')).resolve()
                assert source.is_relative_to(ROOT / 'assets/audio') and source.is_file(), 'Missing narration asset'
                if field == 'audio':
                    assert hashlib.sha256(source.read_bytes()).hexdigest() == entry['sha256'], 'Changed narration audio'
                records.append((source.relative_to(ROOT).as_posix(), source.read_bytes()))
            records.append((f'transcripts/{audience}/{slide}.txt', (entry['transcript'] + '\n').encode()))
    assert len(records) == total_slides * 3, 'Narration bundle must cover every slide'
    records.append(('narration.json', json.dumps(narration, ensure_ascii=False, indent=2).encode()))
    guides = json.loads((ROOT / 'assets/data/narration-guides.json').read_text())
    for guide in [*guides['guides'], *guides['demo'].values()]:
        assert guide['slide'] in narration['decks'][guide['deck']]['slides'], 'Unrecorded presenter guide'
    records.append(('narration-guides.json', json.dumps(guides, ensure_ascii=False, indent=2).encode()))
    flows = json.loads((ROOT / 'assets/data/narration-flows.json').read_text())
    records.append(('narration-flows.json', json.dumps(flows, ensure_ascii=False, indent=2).encode()))
    records.append(('README.txt', (
        'AI x QE — English audio narration\n\n'
        'Every slide maps to MP3 audio, timed WebVTT captions and a transcript. Shared explanations may reuse a recording. '
        'Folder keys: evp = banking executive, technical = banking architecture, '
        'industry-evp = industry executive, industry-technical = industry architecture.\n\n'
        'Open https://tomqwu.github.io/ai_qe/briefings/ and select Play narration '
        'for synchronized slide playback with a two-second pause between slides. '
        'narration-guides.json maps existing diagram and scenario explanations to these recordings '
        'and supplies presenter walkthrough notes and the 3D story caption anchors. narration-flows.json maps exact recorded caption '
        'cues to diagram components and arrows for audio-driven visual focus. '
        f'Industry PDFs: v{release["slide_edition"]}; banking PDFs: v{release["fintech_edition"]}.\n'
    ).encode()))
    with zipfile.ZipFile(bundle, 'w', compression=zipfile.ZIP_DEFLATED) as archive:
        for name, content in sorted(dict(records).items()):
            info = zipfile.ZipInfo(name, date_time=(2026, 9, 8, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            archive.writestr(info, content)
    hashes[bundle.name] = hashlib.sha256(bundle.read_bytes()).hexdigest()
    checksums = assets / 'SHA256SUMS.txt'
    checksums.write_text(''.join(f'{digest}  {name}\n' for name, digest in sorted(hashes.items())))
    hashes[checksums.name] = hashlib.sha256(checksums.read_bytes()).hexdigest()
    room = json.loads((ROOT / '_data/briefing_room.json').read_text())
    counts = {(deck['series'], deck['audience']): deck['slides'] for deck in room}
    notes = f'''{release["latest_change"]}

[Open the site](https://tomqwu.github.io/ai_qe/?v={release["version"]}) · [Presentation room](https://tomqwu.github.io/ai_qe/briefings/) · [Fintech story](https://tomqwu.github.io/ai_qe/case-studies/fintech/) · [Discovery guide](https://tomqwu.github.io/ai_qe/discovery/)

[Platform readiness and adoption assumptions](https://tomqwu.github.io/ai_qe/platform-readiness/)

[QE modernization, containerization and service virtualization](https://tomqwu.github.io/ai_qe/qe-modernization/)

[Financial-services results and client trials](https://tomqwu.github.io/ai_qe/case-studies/fintech/evidence/)

Publication editions:

- Site and presentation player: **v{release["version"]}**
- Industry decks: **v{release["slide_edition"]}** — {counts[('Industry perspective', 'evp')]} Executive slides and {counts[('Industry perspective', 'technical')]} technical slides
- Fintech decks: **v{release["fintech_edition"]}** — {counts[('Fintech case', 'evp')]} Executive slides and {counts[('Fintech case', 'technical')]} technical slides
- Research companion: **v{release["research_edition"]}** — 13 pages
- Fillable discovery questionnaire: **v{release["questionnaire_edition"]}**

Assets include all six PDFs, the architecture film and captions, the industry, modernization and fintech-evidence CSV/JSON source registers, and the complete {total_slides}-slide audio narration bundle with English subtitles and transcripts. SHA256SUMS.txt covers all fifteen downloadable publication files. The PDF filenames identify their content edition, which may precede a player release. The existing architecture film retains its v1.8.0 edition.

Published only after the site build, browser checks, PDF checks and GitHub Pages deployment succeed. The fintech case is fictional; its estimates and outcomes are illustrative assumptions.
'''
    (output / 'notes.md').write_text(notes)
    manifest = {'tag': f'v{release["version"]}', 'title': f'AI × QE · v{release["version"]}', 'assets': hashes}
    (output / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
    print(f'Prepared {manifest["tag"]}: {len(hashes)} assets including checksums')
    return manifest


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True)
    prepare(parser.parse_args().output)

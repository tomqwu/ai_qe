"""Prepare the current publication assets and notes without contacting GitHub."""
import argparse
import hashlib
import json
import re
import shutil
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
- Industry decks: **v{release["slide_edition"]}** — {counts[('Industry perspective', 'evp')]} EVP slides and {counts[('Industry perspective', 'technical')]} technical slides
- Fintech decks: **v{release["fintech_edition"]}** — {counts[('Fintech case', 'evp')]} EVP slides and {counts[('Fintech case', 'technical')]} technical slides
- Research companion: **v{release["research_edition"]}** — 13 pages
- Fillable discovery questionnaire: **v{release["questionnaire_edition"]}**

Assets include all six PDFs, the architecture film and captions, and the industry, modernization and fintech-evidence CSV/JSON source registers. SHA256SUMS.txt covers all fourteen downloadable publication files. The PDF filenames identify their content edition, which may precede a site-navigation release. The existing architecture film retains its v1.8.0 edition.

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

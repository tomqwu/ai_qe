"""Reject retired content anywhere in the built publication, including PDF fields."""
import html
import re
import sys
from pathlib import Path

from pypdf import PdfReader

site = Path(sys.argv[1] if len(sys.argv) > 1 else '_site')
assert site.is_dir(), f'Missing site build: {site}'
retired = re.compile(r'\bappsec\b|\bapplication[\s-]+security\b|\b(?:SAST|DAST|SCA)\b', re.I)
errors = []
checked = 0
pdf_pages = 0
for path in sorted(site.rglob('*')):
    if not path.is_file():
        continue
    relative = path.relative_to(site)
    if retired.search(str(relative)):
        errors.append(f'{relative}: retired publication path')
    if path.suffix == '.pdf':
        reader = PdfReader(path)
        pdf_pages += len(reader.pages)
        text = '\n'.join(page.extract_text() or '' for page in reader.pages)
        text += str(reader.metadata) + str(reader.get_fields() or {})
        text += str([annotation.get_object().get('/A', {})
                     for page in reader.pages for annotation in page.get('/Annots', [])])
    elif path.suffix in {'.html', '.svg', '.json', '.csv'}:
        text = html.unescape(path.read_text())
    elif path.suffix == '.js' and path.name == 'explorers.js':
        text = path.read_text()
    else:
        continue
    checked += 1
    match = retired.search(text)
    if match:
        errors.append(f'{relative}: {match.group()} remains in published content')

for name in ('ai-qe-evp-v1.3.0.pdf', 'ai-qe-technical-v1.3.0.pdf',
             'ai-qe-industry-research-2026.pdf', 'ai-qe-fintech-evp-v1.6.0.pdf',
             'ai-qe-fintech-technical-v1.6.0.pdf'):
    if (site / 'assets/pdf' / name).exists():
        errors.append(f'{name}: superseded download is still published')

assert not errors, '\n'.join(errors)
print(f'Passed: QA-only scope across {checked} published files and {pdf_pages} PDF pages, including fields and links')

"""Verify guided PDFs follow the exact web route, including the closing decision."""
import html
import json
import re
import sys
import unicodedata
from pathlib import Path
from pypdf import PdfReader
from publication_assets import current_pdfs

ROOT = Path(__file__).resolve().parents[1]
site = Path(sys.argv[1] if len(sys.argv) > 1 else '_site')
routes = json.loads((ROOT / '_data/briefing_routes.json').read_text())
release = dict(re.findall(r'^(\w+): "([^"]+)"$', (ROOT / '_data/release.yml').read_text(), re.M))

def normalize(text):
    return ''.join(unicodedata.normalize('NFKC', html.unescape(text)).split()).lower()

pages = 0
for key, route in routes.items():
    source = (site / route['url'].strip('/') / 'index.html').read_text()
    assert len(set(route['slides'])) == len(route['slides']), key
    assert route['slides'][-1] == route['full_order'][-1] == route['closing'], key
    for suffix, order in [('', route['full_order']), ('-guided', route['slides'])]:
        name = f"{route['pdf_prefix']}{suffix}-v{release[route['edition']]}.pdf"
        pdf = PdfReader(ROOT / 'assets/pdf' / name)
        assert len(pdf.pages) == len(order), name
        assert pdf.metadata.author == 'Tom Wu', name
        assert 'Synthetic English narration' in pdf.pages[0].extract_text(), name
        for page, slide_id in zip(pdf.pages, order):
            section = re.search(r'<section[^>]+id="slide-' + str(slide_id) + r'".*?</section>', source, re.S)[0]
            title = re.search(r'<h2[^>]*>(.*?)</h2>', section, re.S)[1]
            title = re.sub('<[^>]+>', '', title)
            assert normalize(title) in normalize(page.extract_text()), f'{name}: slide {slide_id} title/order mismatch'
            pages += 1

actual = {p.name for p in (site / 'assets/pdf').glob('*.pdf')}
assert actual == current_pdfs(), f'Published PDF allowlist mismatch: {actual ^ current_pdfs()}'
print(f'Passed: all {pages} full/guided PDF pages match web order, closing decisions, author and media credits; only current PDFs published')

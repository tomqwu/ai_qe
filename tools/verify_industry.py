"""Check research provenance, exported register and presentation completeness."""
import csv,json,re,sys
from pathlib import Path
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parents[1]
site=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else None
sources=json.loads((ROOT/'_data/industry_sources.json').read_text())
ids={s['id'] for s in sources}
assert len(ids)==len(sources), 'Duplicate source ID'
for s in sources:
    for field in ('id','title','publisher','date','kind','url','takeaway','caveat','scope','access','reviewed'):
        assert s.get(field), f'{s["id"]}: missing {field}'
    assert s['url'].startswith('https://'), s['id']
rows=list(csv.DictReader((ROOT/'assets/data/industry-sources.csv').open()))
assert rows==[{k:str(v) if v is not None else '' for k,v in s.items()} for s in sources], 'CSV/source register mismatch'
for folder in ('docs/industry','briefings','_includes/industry'):
    for path in (ROOT/folder).glob('*'):
        if path.suffix not in ('.html','.md'): continue
        for group in re.findall(r'include industry/cite\.html ids="([^"]+)"',path.read_text()):
            assert set(group.split(','))<=ids, f'Unknown citation in {path}'
for audience in ('evp','technical'):
    text=(ROOT/f'briefings/{audience}.html').read_text()
    count=int(re.search(r'slide_count: (\d+)',text)[1])
    actual=[int(n) for n in re.findall(r'id="slide-(\d+)"',text)]
    assert actual==list(range(1,count+1)), f'{audience}: incomplete or duplicate slides'
    assert len(re.findall(r'include slide-footer.html',text))==count
pdf=PdfReader(ROOT/'assets/pdf/ai-qe-industry-research-2026.pdf')
assert len(pdf.pages)==13
assert all(len(page.extract_text().strip())>100 for page in pdf.pages), 'Blank PDF page'
urls={str(a.get_object().get('/A',{}).get('/URI','')) for page in pdf.pages for a in page.get('/Annots',[])}
assert {s['url'] for s in sources}<=urls, 'Missing or stale PDF publisher links'
if site:
    assert json.loads((site/'assets/data/industry-sources.json').read_text())==sources
    assert not (site/'research').exists(), 'Private publisher archive exposed'
    library=(site/'docs/industry/library/index.html').read_text()
    assert all(f'id="{id}"' in library for id in ids)
print(f'Passed: {len(sources)} sources, matching CSV/JSON, valid citations, complete decks, 13-page linked brief')

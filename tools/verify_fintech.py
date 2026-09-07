"""Check that the case, its two slide editions and their PDFs agree."""
import json,re,sys,unicodedata
from pathlib import Path
from html import unescape
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parents[1]
site=Path(sys.argv[1] if len(sys.argv)>1 else '_site')
case=json.loads((ROOT/'_data/fintech_case.json').read_text())
decks=json.loads((ROOT/'_data/fintech_decks.json').read_text())
release=(ROOT/'_data/release.yml').read_text()
assert re.search(r'fintech_edition: "([^"]+)"',release)[1]==case['edition']
assert sum(g['count'] for g in case['staff'])==75
assert len(case['workflow'])==8 and len(case['profiles'])==3
source_ids={s['id'] for s in case['sources']}
normalized=lambda s: ''.join(unicodedata.normalize('NFKC',unescape(s)).split())
for audience,slides in decks.items():
    page=(site/f'briefings/fintech-{audience}/index.html').read_text()
    assert len(re.findall(r'<section class="slide ',page))==len(slides)
    pdf=PdfReader(ROOT/f'assets/pdf/ai-qe-fintech-{audience}-v{case["edition"]}.pdf')
    assert len(pdf.pages)==len(slides)
    for n,(slide,leaf) in enumerate(zip(slides,pdf.pages),1):
        words=normalized(leaf.extract_text())
        assert normalized(slide['title']) in words,f'{audience}/{n}: missing title'
        assert f'v{case["edition"]}' in words and 'fictionalfintechcase' in words.lower()
        assert normalized(slide['note']) in words,f'{audience}/{n}: missing disclosure'
        assert set(filter(None,slide['sources'].split(',')))<=source_ids
        for row in slide.get('rows') or []:
            for cell in row:assert normalized(cell) in words,f'{audience}/{n}: missing table evidence'
        if slide['visual']=='architecture':
            for label in ['QA context','AI workbench','Human review','Test runners','Run evidence','Release review']:assert normalized(label) in words
        if slide['visual']=='capacity':
            for label in ['300h','182h','40h','78h','66h','33h','15packs']:assert label in words
    urls=[str(a.get_object().get('/A',{}).get('/URI','')) for p in pdf.pages for a in p.get('/Annots',[])]
    assert any('tomqwu.github.io/ai_qe/case-studies/fintech/' in u for u in urls)
print('Passed: fintech assumptions, source IDs, case editions and all 33 PDF pages including diagram labels, tables, caveats and usable case links')

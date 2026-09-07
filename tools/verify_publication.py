"""Check agreement between the release, static claims, search and audience exports."""
import json,re,sys,unicodedata
import xml.etree.ElementTree as ET
from pathlib import Path
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parents[1]
site=Path(sys.argv[1] if len(sys.argv)>1 else '_site')
version=re.search(r'version: "([^"]+)"',(ROOT/'_data/release.yml').read_text())[1]
edition_match=re.search(r'slide_edition: "([^"]+)"',(ROOT/'_data/release.yml').read_text())
edition=edition_match[1] if edition_match else version
results=json.loads((ROOT/'_data/scenario_results.json').read_text())
html=(site/'docs/economics/savings-model/index.html').read_text()
for key,r in results.items():
    row=re.search(r'<tr data-scenario="'+key+r'">(.*?)</tr>',html,re.S)[1]
    actual=float(re.search(r'data-scenario-net="([^"]+)"',row)[1])
    assert abs(actual-r['net'])<1e-10, f'Static economics mismatch: {key}'
legacy=(site/'docs/evidence/testing-studies/index.html').read_text()
assert '75% of generated tests' not in legacy and '75% of target test classes' in legacy
decks=[deck for deck in json.loads((ROOT/'_data/briefing_room.json').read_text()) if deck['series']=='Industry perspective']
for audience,count in [(deck['audience'],deck['slides']) for deck in decks]:
    text=(site/f'briefings/{audience}/index.html').read_text()
    assert f'v{version}' in text
    pdf=PdfReader(ROOT/f'assets/pdf/ai-qe-{audience}-v{edition}.pdf')
    assert len(pdf.pages)==count, f'{audience}: incorrect export length'
    for i,page in enumerate(pdf.pages):
        words=page.extract_text()
        assert len(words)>100 and f'v{edition}' in words, f'{audience}/{i+1}: missing content or edition'
        section=re.search(r'<section[^>]+id="slide-'+str(i+1)+r'".*?</section>',text,re.S)[0]
        svg=re.search(r'<svg xmlns="http://www.w3.org/2000/svg".*?</svg>',section,re.S)
        if svg:
            normalized=''.join(unicodedata.normalize('NFKC',words).split())
            for node in ET.fromstring(svg[0]).iter('{http://www.w3.org/2000/svg}text'):
                label=''.join(unicodedata.normalize('NFKC',''.join(node.itertext())).split())
                assert label in normalized, f'{audience}/{i+1}: missing PDF diagram label: {label}'
    links=[str(a.get_object().get('/A',{}).get('/URI','')) for page in pdf.pages for a in page.get('/Annots',[])]
    assert any('tomqwu.github.io/ai_qe/docs/' in x for x in links), 'PDF needs usable source links'
print(f"Passed: canonical scenario/claim agreement, edition labels, {sum(deck['slides'] for deck in decks)} PDF pages and working source-link annotations")

"""Add stable slide and dictionary anchors after Jekyll renders."""
import json,re,sys
from html.parser import HTMLParser
from pathlib import Path
class Slides(HTMLParser):
    def __init__(self):
        super().__init__();self.items=[];self.slide=None;self.depth=0;self.title=False;self.skip=0
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=='section' and a.get('id','').startswith('slide-'):
            self.slide={'id':a['id'],'title':'','content':''};self.depth=1
        elif self.slide and tag=='section':self.depth+=1
        if self.slide and tag=='h2':self.title=True
        if self.slide and tag=='br':self.handle_data(' ')
        if tag in ('script','style','svg'):self.skip+=1
    def handle_endtag(self,tag):
        if tag in ('script','style','svg'):self.skip=max(0,self.skip-1)
        if tag=='h2':self.title=False
        if self.slide and tag=='section':
            self.depth-=1
            if not self.depth:self.items.append(self.slide);self.slide=None
    def handle_data(self,data):
        if self.slide and not self.skip:
            self.slide['content']+=data+' '
            if self.title:self.slide['title']+=data
root=Path(sys.argv[1] if len(sys.argv)>1 else '_site')
# Safari does not focus links on pointer activation: relatedTarget is null while
# a result click is still in progress. Keep results mounted until the native click
# completes. Outside clicks and known focus destinations still dismiss search.
theme_js=root/'assets/js/just-the-docs.js'
theme_text=theme_js.read_text()
focus_statement='const nextFocusedElement = evt.relatedTarget;'
old_safe_focus=focus_statement+'\n    if (!nextFocusedElement) { hideSearch(); return; }'
previous_safe_focus=old_safe_focus+"\n    if (nextFocusedElement.matches('[data-close-search]')) return;"
safe_focus=focus_statement+"\n    if (!nextFocusedElement) return;\n    if (nextFocusedElement.matches('[data-close-search]')) return;"
if safe_focus not in theme_text:
    assert theme_text.count(focus_statement)==1, 'Review the pinned theme search-focus patch after updating the theme'
    theme_text=theme_text.replace(previous_safe_focus,focus_statement).replace(old_safe_focus,focus_statement).replace(focus_statement,safe_focus)
# Browser controls/window changes are a definite departure, unlike a null
# focusout during a Safari link click. Do not replace native anchor navigation.
focus_listener="searchResults.addEventListener('focusout', updateSearchFocus);"
blur_patch=focus_listener+"\n  window.addEventListener('blur', hideSearch);"
if blur_patch not in theme_text:
    assert theme_text.count(focus_listener)==1, 'Review the theme search-dismissal patch'
    theme_text=theme_text.replace(focus_listener,blur_patch)
# Pasted/assisted input may not emit keyup. Also replay a query entered while
# the asynchronous search index was loading, once the handlers are installed.
keyup_statement="jtd.addEvent(searchInput, 'keyup', function(e){"
input_patch="jtd.addEvent(searchInput, 'input', update);\n\n  "+keyup_statement
if input_patch not in theme_text:
    assert theme_text.count(keyup_statement)==1, 'Review the theme search-input patch'
    theme_text=theme_text.replace(keyup_statement,input_patch)
loaded_statement='searchLoaded(index, docs);'
ready_patch=loaded_statement+"\n      var enteredQuery = document.getElementById('search-input');\n      if (enteredQuery.value) enteredQuery.dispatchEvent(new Event('input'));"
if ready_patch not in theme_text:
    assert theme_text.count(loaded_statement)==1, 'Review the theme search-ready patch'
    theme_text=theme_text.replace(loaded_statement,ready_patch)
# A second event for the same query must not cancel later result batches.
update_start='function update() {\n    currentSearchIndex++;\n\n'
if update_start in theme_text:
    theme_text=theme_text.replace(update_start,'function update() {\n')
    theme_text=theme_text.replace('    currentInput = input;','    currentSearchIndex++;\n    currentInput = input;')
assert '    currentSearchIndex++;\n    currentInput = input;' in theme_text, 'Review search result batching after theme updates'
theme_js.write_text(theme_text)
# The theme normally emits an unversioned script URL. Readers must receive the
# fixed search behavior even when their browser cached a previous site edition.
version=json.loads(re.search(r'^version: (".*")$',(Path(__file__).resolve().parents[1]/'_data/release.yml').read_text(),re.M)[1])
script_url=re.compile(r'(<script\b[^>]*\bsrc="[^"]*/assets/js/just-the-docs\.js)(?:\?v=[^" ]*)?("[^>]*>)')
versioned_pages=0
for page in root.rglob('*.html'):
    html=page.read_text()
    updated,count=script_url.subn(lambda match:match[1]+'?v='+version+match[2],html)
    if count:
        page.write_text(updated)
        versioned_pages+=1
assert versioned_pages, 'No theme script URLs found to version'
p=root/'assets/js/search-data.json';index=json.loads(p.read_text())
for audience,name in [('evp','Executive strategic vision'),('technical','Technical architecture'),('fintech-evp','Fintech strategic vision'),('fintech-technical','Fintech QA architecture')]:
    parser=Slides();parser.feed((root/f'briefings/{audience}/index.html').read_text())
    for slide in parser.items:
        path=f'/briefings/{audience}/#{slide["id"]}'
        index[f'{audience}-{slide["id"]}']={'doc':name,'title':' '.join(slide['title'].split()),'content':' '.join(slide['content'].split()),'url':'/ai_qe'+path,'relUrl':path}
dictionary=json.loads((Path(__file__).resolve().parents[1]/'_data/dictionary.json').read_text())
index['dictionary']={'doc':'Dictionary','title':'AI × QE dictionary','content':'Plain-language glossary of terms, acronyms, definitions and examples.','url':'/ai_qe/dictionary/','relUrl':'/dictionary/'}
for term in dictionary['terms']:
    path=f'/dictionary/#{term["id"]}'
    content=' '.join([term['term'],*term['aliases'],term['definition'],term['example']])
    index[f'dictionary-{term["id"]}']={'doc':'Dictionary','title':term['term'],'content':content,'url':'/ai_qe'+path,'relUrl':path}
adoption=json.loads((Path(__file__).resolve().parents[1]/'_data/adoption.json').read_text())
for dependency in adoption['dependencies']:
    path=f'/platform-readiness/#dependency-{dependency["id"]}'
    index[f'adoption-{dependency["id"]}']={'doc':'Platform readiness','title':dependency['title'],'content':' '.join(dependency[field] for field in ('assumption','evidence','owner','action','example','harbor')),'url':'/ai_qe'+path,'relUrl':path}
modernization=json.loads((Path(__file__).resolve().parents[1]/'_data/modernization.json').read_text())
for stream in modernization['workstreams']:
    path=f'/qe-modernization/#workstream-{stream["id"]}'
    index[f'modernization-{stream["id"]}']={'doc':'QE modernization','title':stream['title'],'content':' '.join(stream[field] for field in ('current','build','proof','owner','ai')),'url':'/ai_qe'+path,'relUrl':path}
fintech_evidence=json.loads((Path(__file__).resolve().parents[1]/'_data/fintech_evidence.json').read_text())
for case in fintech_evidence['cases']:
    path=f'/case-studies/fintech/evidence/#case-{case["id"]}'
    index[f'fintech-evidence-{case["id"]}']={'doc':'Fintech results and client pilots','title':case['name'],'content':' '.join(case[field] for field in ('headline','unit','finding','change','limit','lesson')),'url':'/ai_qe'+path,'relUrl':path}
p.write_text(json.dumps(index,ensure_ascii=False))
print(f'Search finalized: {len(index)} entries including audience slides and {len(dictionary["terms"])} dictionary terms')

# Publish current downloads only; immutable older editions remain in GitHub releases.
from publication_assets import current_pdfs
for pdf in (root / 'assets/pdf').glob('*.pdf'):
    if pdf.name not in current_pdfs(): pdf.unlink()

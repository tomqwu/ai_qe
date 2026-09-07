"""Add stable slide and dictionary anchors after Jekyll renders."""
import json,sys
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
p=root/'assets/js/search-data.json';index=json.loads(p.read_text())
for audience,name in [('evp','EVP strategic vision'),('technical','Technical architecture'),('fintech-evp','Fintech strategic vision'),('fintech-technical','Fintech QA architecture')]:
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
p.write_text(json.dumps(index,ensure_ascii=False))
print(f'Search finalized: {len(index)} entries including audience slides and {len(dictionary["terms"])} dictionary terms')

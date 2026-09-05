#!/usr/bin/env python3
"""Gather public publisher PDFs locally; never rehost them in the Pages output."""
import concurrent.futures, hashlib, json, urllib.request
from pathlib import Path
from datetime import date
ROOT=Path(__file__).resolve().parents[1]
DEST=ROOT/'research/downloads'
DEST.mkdir(parents=True,exist_ok=True)
sources=json.loads((ROOT/'_data/industry_sources.json').read_text())
def gather(s):
    item={'id':s['id'],'url':s['document_url'],'retrieved':date.today().isoformat()}
    try:
        request=urllib.request.Request(s['document_url'],headers={'User-Agent':'AI-QE Research Archive/1.0'})
        with urllib.request.urlopen(request,timeout=45) as response:
            data=response.read(); item['resolved_url']=response.url
        if not data.startswith(b'%PDF-'): raise ValueError('Response is not a PDF; no access form bypassed')
        path=DEST/(s['id']+'.pdf');path.write_bytes(data)
        item.update(status='downloaded',local_path=str(path.relative_to(ROOT)),bytes=len(data),sha256=hashlib.sha256(data).hexdigest())
    except Exception as exc: item.update(status='unavailable',reason=str(exc))
    return item
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    results=list(pool.map(gather,[s for s in sources if s['document_url']]))
(ROOT/'research/document-manifest.json').write_text(json.dumps(results,indent=2)+'\n')
for r in results: print(r['id'],r['status'],r.get('bytes',r.get('reason')))

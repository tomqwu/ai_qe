"""One allowlist for current downloadable PDFs; old releases stay on GitHub."""
import json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def current_pdfs():
 r=dict(re.findall(r'^(\w+): "([^"]+)"$',(ROOT/'_data/release.yml').read_text(),re.M))
 names={f'ai-qe-{a}{suffix}-v{r[field]}.pdf' for audiences,field in [(('evp','technical'),'slide_edition'),(('fintech-evp','fintech-technical'),'fintech_edition')] for a in audiences for suffix in ('','-guided')}
 names.update([f'ai-qe-industry-research-v{r["research_edition"]}.pdf',f'ai-qe-discovery-questionnaire-v{r["questionnaire_edition"]}.pdf'])
 return names

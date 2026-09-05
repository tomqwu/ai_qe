#!/usr/bin/env python3
"""Rebuild the original research brief; requires reportlab and Pillow."""
import json
from io import BytesIO
from PIL import Image
from pathlib import Path
from html import escape
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.lib.utils import ImageReader
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/pdf/ai-qe-industry-research-2026.pdf'
S=json.loads((ROOT/'_data/industry_sources.json').read_text())
W,H=595.28,841.89
NAVY='#152e40';TEAL='#096d69';INK='#405563';LINE='#cfdbd9';PAPER='#fcfcfa'
c=canvas.Canvas(str(OUT),pagesize=(W,H),pageCompression=1)
c.setTitle('AI x QE: Industry Research | September 2026');c.setAuthor('AI-QE Research')
PAGE=0

def illustration(name):
    # Re-encode for a compact portable PDF; composition and pixels remain unchanged.
    buffer=BytesIO()
    Image.open(ROOT/'assets/images/industry'/name).convert('RGB').save(buffer,format='JPEG',quality=90)
    buffer.seek(0)
    return ImageReader(buffer)

def clean(t):
    return t.replace('×','x').replace('–','-').replace('—','-').replace('−','-').replace('’',"'").replace('“','"').replace('”','"').replace('≥','>=').replace('→','to').replace('·',' / ')
def para(t,x,y,w=499,size=11.5,color=INK,bold=False,leading=None):
    style=ParagraphStyle('p',fontName='Helvetica-Bold' if bold else 'Helvetica',fontSize=size,leading=leading or size*1.48,textColor=HexColor(color))
    p=Paragraph(clean(t),style);_,h=p.wrap(w,750)
    if y+h>H-58: raise ValueError(f'Page {PAGE} overflow at {y+h}: {t[:70]}')
    p.drawOn(c,x,H-y-h)
    return y+h

def line(y,x=48,w=499):
    c.setStrokeColor(HexColor(LINE));c.setLineWidth(.7);c.line(x,H-y,x+w,H-y)
def page(kicker,title,sub=''):
    global PAGE
    if PAGE:c.showPage()
    PAGE+=1
    c.setFillColor(HexColor(PAPER));c.rect(0,0,W,H,fill=1,stroke=0)
    para('AI-QE RESEARCH',48,26,size=8.5,bold=True,color=TEAL)
    para('SEPTEMBER 2026',430,26,w=120,size=8,color=INK)
    line(49)
    para(kicker.upper(),48,75,size=9,bold=True,color=TEAL)
    y=para(title,48,96,size=29,bold=True,color=NAVY,leading=32)
    if sub:y=para(sub,48,y+16,size=12.5)
    line(H-45)
    c.setFillColor(HexColor(INK));c.setFont('Helvetica',8);c.drawString(48,26,'Independent synthesis / Reviewed 5 September 2026')
    c.setFillColor(HexColor(TEAL));c.setFont('Helvetica-Bold',9);c.drawRightString(W-48,26,f'{PAGE:02d}')
    return y+28

def heading(t,y):return para(t,48,y,size=16,bold=True,color=NAVY)+10

def note(t,y,ids=''):
    y=para(t,48,y,size=9,color=INK)
    if ids:
        links=' '.join(f'<a href="https://tomqwu.github.io/ai_qe/docs/industry/library/#{i}" color="{TEAL}">[{i}]</a>' for i in ids.split(','))
        y=para('Sources: '+links,48,y+7,size=9)
    return y+20

def blocks(items,y):
    for title,body in items:
        line(y);y+=12;top=y;y=para(title,48,y,w=140,size=12,bold=True,color=TEAL)
        end=para(body,205,top,w=342,size=11.3)
        y=max(y,end)+17
    return y

def flow(items,y):
    gap=15;cw=(499-3*gap)/4;bottom=y
    for i,(title,body) in enumerate(items):
        x=48+i*(cw+gap);c.setStrokeColor(HexColor(TEAL));c.setLineWidth(2);c.line(x,H-y,x+cw,H-y)
        a=para(f'{i+1:02d}',x,y+12,w=cw,size=9,color=TEAL,bold=True)
        a=para(title,x,a+7,w=cw,size=13,bold=True,color=NAVY,leading=16)
        a=para(body,x,a+10,w=cw,size=10,leading=14)
        bottom=max(bottom,a)
        if i<3:para('>',x+cw+3,y-6,w=10,size=12,color=TEAL)
    return bottom+22

# 1 / Cover
page('Industry research','Quality engineering\nfor the AI era'.replace('\n','<br/>'),'AI for quality engineering. Quality engineering for AI.')
c.drawImage(illustration('quality-studio.webp'),30,285,width=535,height=357,mask='auto')
para('Strategic vision and assurance architecture',48,579,size=18,bold=True,color=NAVY)
para('A financial-services perspective on industry adoption, evidence, technology and the operating model.',48,616,size=12.5)
note('30 curated primary-source entries. Includes public Gartner and McKinsey material, DORA, enterprise research, NIST, OWASP, OSFI and representative product documentation.',678)
# 2 / Thesis
y=page('01 / Strategic thesis','A broader quality mandate','The opportunity is a shared quality capability across assisted delivery and AI applications.')
y=blocks([('AI for QE','Generate test candidates, diagnose failures and support security review. Independent checks establish whether the output is useful.'),('QE for AI','Evaluate task outcomes, retrieval and tool actions. Test the application configuration and its operating boundary.'),('Shared foundation','Maintain task contracts, trusted evaluation cases, version history and accountable decisions. Reuse platform services where they improve integration.')],y)
y=heading('Strategic implication',y+12)
y=para('AI can contribute more artifacts and actions while QE strengthens the organization\'s ability to judge them. The durable investment is the evaluation system, engineering capability and evidence around the tools.',48,y)
note('Authored synthesis informed by analyst perspectives, engineering research and assurance frameworks. It does not describe a deployed bank system.',y+22,'G01,M01,D01,A01')
# 3 / Industry
y=page('02 / Industry outlook','Adoption needs an operating system','Public surveys describe experimentation alongside integration and trust challenges.')
y=heading('Reported barriers to GenAI adoption in QE',y)
para('Share of respondents / World Quality Report 2025-26',48,y,size=10);y+=37
for lab,val in [('Data privacy',67),('Integration complexity',64),('Hallucination / reliability',60),('AI / ML skill gaps',50)]:
    para(lab,48,y,w=190,size=11)
    c.setFillColor(HexColor('#edf2ef'));c.rect(242,H-y-18,250,17,fill=1,stroke=0)
    c.setFillColor(HexColor(TEAL));c.rect(242,H-y-18,250*val/100,17,fill=1,stroke=0)
    para(str(val)+'%',508,y,w=40,size=11,bold=True,color=NAVY);y+=47
para('0%',242,y,w=50,size=9);para('50%',359,y,w=50,size=9);para('100%',471,y,w=50,size=9);y+=30
y=note('Overlapping responses, not a composition. Overall survey: more than 2,000 executives, 22 countries and 10 sectors. The public release does not provide question-specific sample sizes.',y,'W01')
y=heading('What this suggests',y)
y=para('Prioritize approved context, workflow integration, reliable checks and skills. Analyst forecasts describe a direction; they do not turn survey responses into measured enterprise value.',48,y)
note('Gartner full testing reports were not available; their public abstracts are cataloged with explicit access limits.',y+18,'G02,G03,G04')
# 4 / Evidence
y=page('03 / Evidence','The result depends on the work','Metrics, participants and study designs must travel with every headline.')
y=blocks([('Field experiments','Cui and colleagues studied 4,867 developers. The pooled estimate was 26.08% more completed tasks (standard error: 10.3 percentage points).'),('METR trial','16 experienced developers on familiar repositories took 19% longer with early-2025 AI access (95% CI: +2% to +39%).'),('METR update','The 2026 follow-up reported faster point estimates, but both intervals include no effect. Selection and time measurement limit interpretation.')],y)
y=note('These are different populations and outcome definitions. Do not average them or chart them as one temporal series.',y,'E01,E02,E03')
y=heading('Evidence roles',y)
y=para('Forecasts support scenarios. Surveys describe reported experience. Experiments estimate effects within a design. Cases reveal implementation mechanics. Product documentation establishes available functions. Each answers a different question.',48,y)
note('The interactive site displays METR confidence intervals and a separate economic scenario model with explicit assumptions.',y+18)
# 5 / Tests
y=page('04 / AI for QE','Generation is only the first step','Industrial implementations filter candidates before they become maintained tests.')
y=flow([('Builds','Syntax and dependencies are valid.'),('Repeats','Results hold across repeated runs.'),('Detects faults','Relevant assertions challenge behavior.'),('Earns review','Maintainers assess meaning and rework.')],y+8)
y=note('Authored synthesis of filtered and mutation-guided test generation. These stages are not a measured numerical funnel.',y,'E04,E05,E07')
y=heading('An independent oracle matters',y)
y=para('A passing test may simply reproduce the implementation\'s mistake. Use specifications, approved assertions, relevant mutations and reviewer judgment to challenge the expected result. Protect the oracle from silent weakening.',48,y)
y=heading('Diagnosis needs contextual evidence',y+24)
y=para('Failure-analysis systems can help reviewers navigate CI evidence. Measure accuracy on a reviewed sample separately from deployment volume, feedback usefulness and resolution effort.',48,y)
note('Google AutoDiagnose separates a 71-failure manual evaluation from its much larger deployment population. Local task accuracy remains to be validated.',y+18,'E06')
# 6 / Eval
y=page('05 / QE for AI','Continuous application assurance')
c.drawImage(illustration('assurance-lab.webp'),48,H-y-267,width=400,height=267,mask='auto');y+=289
y=flow([('Define','Task contracts and risk scenarios.'),('Evaluate','Checks, calibrated judges and adversarial cases.'),('Release','Versioned evidence and owner decision.'),('Observe','Traces, drift, cost and incidents.')],y)
y=para('Feedback loop: curated production failures become regression cases.',48,y,size=11,bold=True,color=TEAL)
note('Proposed lifecycle. Re-evaluate changes to models, prompts, retrieval, tools and permissions. Hold out evaluation examples and calibrate model judges with expert labels.',y+16,'A01,A02,T03')
# 7 / authority
y=page('06 / Agent architecture','Permission lives outside the model','A proposed application boundary for a governed QE workflow.')
y=flow([('Context','Scoped code, contracts and test evidence.'),('AI workflow','Model, prompts, retrieval and memory.'),('Policy gate','Identity, tool scope, budget and approval.'),('Bounded tools','Sandbox, test runner and draft change.')],y+8)
y=blocks([('Verification','Independent tests, security checks and review govern the release decision.'),('Evidence','Join configuration versions, tool calls, artifacts, decisions and cost under a privacy-aware logging standard.'),('Recovery','Test denied actions, bounded retries, escalation, stop conditions and fallback.')],y)
y=note('Retrieved content and tool output remain untrusted. Runtime permission checks should not depend on the model obeying a prompt.',y,'A03,A05,R01')
note('OSFI\'s July 2026 bulletin offers sound practices complementing existing guidelines. Revised E-23 is effective May 1, 2027; assess system applicability with institutional model-risk owners.',y+15,'R02')
# 8 / operating
y=page('07 / Operating model','Ownership connects quality and value')
y=blocks([('Product / business','Task outcomes, acceptance criteria and accountable value owner.'),('QE / engineering','Test validity, evaluation datasets and delivery integration.'),('Platform / AI','Approved runtime, identity, context services and observability.'),('Security / risk','Threat scenarios, policy and independent challenge.'),('Finance / delivery','Total cost, use of released capacity and validated benefit.')],y)
y=heading('Measure the whole workflow',y+2)
y=para('Include preparation, review, correction, repeated runs and controls in active effort. Measure escaped defects and rework alongside adoption, latency and cost. Agent runtime and human effort are different units.',48,y)
note('Proposed ownership model. Released capacity needs an explicit capture mechanism; external task gains do not establish enterprise savings.',y+16,'D01,D02,M01')
# 9 / tech
y=page('08 / Technology landscape','Different tools serve different layers','Representative examples from current documentation, not a market ranking.')
y=blocks([('Test assets','Tricentis Tosca and Applitools: authoring and visual regression. Validate test meaning, baselines and false alerts.'),('Change review','GitHub Copilot: review suggestions. Validate issues found and missed plus reviewer effort.'),('AI evaluation','LangSmith and Microsoft Foundry: datasets and result comparison. Validate calibration, versions and exportability.'),('Agent red teaming','Promptfoo: adversarial tool and permission scenarios. Match coverage to actual authority.')],y)
y=note('Documentation reviewed September 5, 2026. Available capabilities are not independent effectiveness evidence.',y,'T01,T02,T03,T04,T05,T06')
y=heading('Common selection brief',y)
y=para('Compare on the same tasks. Request data flows, retention terms, identity scope, evaluation exports, resilience tests and total operating cost. Retain control of task contracts, curated evaluation data and evidence history.',48,y)
note('The selection criteria are authored synthesis. Gartner\'s proprietary platform-selection criteria were not accessible.',y+18,'G02')
# 10 / roadmap
y=page('09 / Implementation','Expansion follows repeatable evidence')
y=flow([('Foundations','Classified context, repeatable tests and baseline.'),('Assistance','One bounded workflow with reviewed artifacts.'),('Assurance','Versioned evaluation, telemetry and fallback.'),('Authority','Broader tasks with action-level evidence.')],y+8)
y=heading('A useful pilot comparison',y)
y=para('Choose frequent, bounded tasks. Compare like with like and record complexity and experience. Track net effort, quality floors, adoption, total cost and how released capacity is used. Validate successful results across teams and releases before broader scale.',48,y)
y=heading('Open research questions',y+26)
y=para('The reviewed evidence does not settle sustained escaped-defect reduction, long-term test maintainability, simultaneous-agent human effort or rare operational failure rates. Treat these as explicit measurement needs.',48,y)
y=heading('Scope and access',y+26)
y=para('This independent desk review is curated, not exhaustive. Licensed Gartner material was reviewed only at abstract level. WQR figures use the public release. Publisher PDFs remain in a local archive with hashes; the website links originals. Illustrations are AI-generated concepts; diagrams are proposed designs.',48,y,size=10.5)
note('Full topic pages, interactive models, methods and downloadable source register: <a href="https://tomqwu.github.io/ai_qe/docs/industry/" color="#096d69">tomqwu.github.io/ai_qe/docs/industry/</a>',y+20)
# 11-13 / references
for start in range(0,len(S),10):
    y=page('Source register',f'References {start+1}-{min(start+10,len(S))}','Original publisher links are embedded in each title. Full method and access notes are in the online library.')
    for s in S[start:start+10]:
        line(y);y+=8
        title=f'<b>{s["id"]}</b> / <a href="{escape(s["url"],quote=True)}" color="{TEAL}">{escape(s["title"])}</a>'
        y=para(title,48,y,size=10,leading=12)
        y=para(escape(s['publisher'])+' / '+escape(s['date'])+' / '+escape(s['kind']),48,y+4,size=8.2,leading=10)
        y=para('Access: '+escape(s['access']),48,y+3,size=8.2,leading=10)+8
c.save()
print(f'{OUT}: {PAGE} pages')

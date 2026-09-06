from pathlib import Path
from html import escape
ROOT=Path(__file__).resolve().parents[1]/'_includes/diagrams'
ROOT.mkdir(parents=True,exist_ok=True)
# Native, editable SVG diagrams. Geometry encodes system boundaries and research quantities.
class SVG:
 def __init__(self,name,title,w=1200,h=540):
  self.name=name;self.parts=[f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" class="research-diagram" role="img" aria-labelledby="{name}-title"><title id="{name}-title">{escape(title)}</title><defs><marker id="{name}-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 1 1 L 9 5 L 1 9" fill="none" stroke="#096d69" stroke-width="1.6"/></marker></defs>']
 def rect(self,x,y,w,h,cls='node',rx=8):self.parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" class="{cls}"/>')
 def text(self,x,y,t,cls='label',anchor='start'):
  self.parts.append(f'<text x="{x}" y="{y}" class="{cls}" text-anchor="{anchor}">{escape(t)}</text>')
 def path(self,d,cls='edge',arrow=True,link=None):
  connection=f' data-from="{link[0]}" data-to="{link[1]}"' if link else ''
  self.parts.append(f'<path d="{d}" class="{cls}"'+(f' marker-end="url(#{self.name}-arrow)"' if arrow else '')+connection+'/>')
 def circle(self,x,y,r,cls='dot'):self.parts.append(f'<circle cx="{x}" cy="{y}" r="{r}" class="{cls}"/>')
 def node(self,x,y,w,h,title,lines=(),cls='node',key=None):
  if key:self.parts.append(f'<g role="button" tabindex="0" aria-label="Inspect {escape(title)}" data-architecture-node="{key}" aria-pressed="false">')
  self.parts.append(f'<g class="diagram-node {"on-dark" if "node-navy" in cls else ""}">')
  self.rect(x,y,w,h,cls)
  self.text(x+16,y+28,title,'node-title')
  for j,t in enumerate(lines):self.text(x+16,y+51+20*j,t,'node-text')
  self.parts.append('</g>')
  if key:self.parts.append('</g>')
 def save(self):
  output='\n'.join(self.parts)+ '\n</svg>\n'
  if self.name=='platform': output=output.replace('role="img"','role="group"',1)
  (ROOT/(self.name+'.svg')).write_text(output)

s=SVG('platform','Proposed enterprise AI and quality engineering platform: delivery interfaces, governed context and agent execution, independent assurance, release and evidence feedback',1200,600)
s.rect(14,20,1172,112,'lane lane-teal');s.text(32,46,'DELIVERY EXPERIENCE','lane-title')
for x,title,lines in [(240,'Engineer / QE',('IDE · pull request · test workbench',)),(570,'Delivery systems',('Repository · CI · issue tracker',)),(890,'AI applications',('Product workflows · agents',))]:s.node(x,35,278,78,title,lines)
s.text(32,75,'Work enters through', 'node-text');s.text(32,95,'existing team workflows','node-text')
s.rect(14,165,730,233,'lane');s.text(32,193,'GOVERNED EXECUTION','lane-title')
s.node(32,212,214,145,'Context service',('Classify + minimize','Permitted retrieval','Versioned input snapshot'),'node', 'context')
s.node(276,212,208,145,'QE agent runtime',('Task plan + model router','Prompt / model versions','Memory + retry limits'),'node node-teal','runtime')
s.node(514,212,210,145,'Action gateway',('Agent identity + policy','Tool / resource allowlists','Budget + approval rules'),'node node-navy','gateway')
s.path('M 246 283 H 274',link=('context', 'runtime'));s.path('M 484 283 H 512',link=('runtime', 'gateway'))
s.path('M 380 113 V 210',link=('experience', 'runtime'));s.text(295,153,'task + scope','edge-label')
s.path('M 710 113 V 140 H 138 V 212','edge edge-dashed',link=('delivery', 'context'));s.text(444,155,'approved context','edge-label')
s.rect(772,165,414,233,'lane lane-sand');s.text(790,193,'INDEPENDENT ASSURANCE','lane-title')
s.node(792,212,374,65,'Sandbox + deterministic checks',('Build · repeatability · mutation · security',),'node','checks')
s.node(792,293,374,65,'Evaluation service',('Held-out cases · judges · human labels',),'node','evaluation')
s.path('M 724 244 H 790',link=('gateway', 'checks'));s.text(738,231,'allow','edge-label','middle')
s.path('M 1028 113 V 155 H 1169 V 325 H 1166','edge edge-dashed',link=('application', 'evaluation'))
s.text(927,149,'application versions','edge-label')
s.text(34,382,'Repository text and tool output cannot grant permissions.','small')
s.rect(14,432,730,148,'lane');s.text(32,459,'EVIDENCE + FEEDBACK','lane-title')
s.node(32,477,328,79,'Evidence store',('Task / run / artifact / decision IDs','Quality · effort · cost · incidents'),'node','evidence')
s.node(388,477,336,79,'Curated regression corpus',('Accepted failures + reviewed expectations','New cases challenge the next release'),'node')
s.path('M 360 516 H 386',link=('evidence', 'corpus'));s.path('M 620 357 V 417 H 196 V 475','edge edge-dashed',link=('gateway', 'evidence'));s.text(634,417,'run traces','edge-label')
s.node(792,448,374,109,'Release authority',('Reviewer + existing CI / change gates','Approve · hold · rollback','The generating agent cannot approve itself'),'node node-teal','release')
s.path('M 1128 277 V 410 H 1040 V 446',link=('checks', 'release'));s.path('M 898 358 V 446',link=('evaluation', 'release'));s.text(806,431,'checks + evaluation evidence','edge-label')
s.path('M 979 557 V 570 H 196 V 558','edge edge-dashed',link=('release', 'evidence'));s.path('M 724 517 H 757 V 379 H 979 V 360','edge edge-dashed',link=('corpus', 'evaluation'))
s.text(32,590,'Proposed logical architecture · dashed paths carry evidence or feedback','small')
s.save()

s=SVG('strategic-system','Strategic target state: two quality missions use a shared assurance platform to create trustworthy delivery outcomes',1200,530)
s.node(20,38,256,146,'AI for QE',('Test design','Failure diagnosis','Security review'),'node node-teal')
s.node(20,313,256,146,'QE for AI',('Behavior and grounding','Agent actions','Drift and resilience'),'node node-navy')
s.rect(340,23,509,451,'lane');s.text(366,54,'SHARED QUALITY CAPABILITY','lane-title')
s.node(365,81,460,82,'Testable intent',('Requirements → task contracts → expectations',))
s.node(365,205,460,82,'Independent assurance',('Tests + evaluations + security checks + review',),'node node-teal')
s.node(365,329,460,105,'Operational learning',('Versioned evidence + observed failures','Curated cases improve the next evaluation',))
s.path('M 596 163 V 202');s.path('M 596 287 V 326');s.path('M 366 380 H 351 V 121 H 363','edge edge-dashed')
s.path('M 276 111 H 340');s.path('M 276 386 H 340')
s.node(906,38,274,104,'Delivery outcomes',('Faster validated change','Less avoidable rework',))
s.node(906,208,274,104,'Trustworthy AI',('Evidence of behavior','Bounded authority',))
s.node(906,378,274,104,'Reusable capability',('Shared evaluation assets','Portable controls',))
s.path('M 850 123 H 885 V 90 H 904');s.path('M 850 246 H 904');s.path('M 850 380 H 881 V 430 H 904')
s.text(25,510,'Strategic vision · outcomes are ambitions to validate, not reported bank results','small')
s.save()

s=SVG('testgen-evidence','Meta TestGen-LLM evaluation: among 86 target test classes, 75 percent had a generated test that built, 57 percent had one that passed reliably, and 25 percent had one that increased coverage',1200,490)
s.text(22,29,'A PASSING TEST IS AN INTERMEDIATE RESULT','lane-title')
s.text(22,66,'Share of target test classes with at least one qualifying generated test','label')
for y,label,value,desc in [(112,'Builds correctly',75,'Syntax and dependencies'),(218,'Passes reliably',57,'Builds + non-flaky execution'),(324,'Adds coverage',25,'Builds + passes + new line coverage')]:
 s.text(22,y+26,label,'node-title');s.text(22,y+52,desc,'small');s.rect(340,y,690,57,'bar-track',2);s.rect(340,y,690*value/100,57,'bar-teal' if value!=25 else 'bar-navy',2);s.text(1056,y+40,f'{value}%','stat')
s.text(340,409,'0%','small');s.text(685,409,'50%','small','middle');s.text(1030,409,'100%','small','end')
s.text(22,453,'Meta / FSE 2024 · §3.3 · 86 Kotlin components with existing test classes · reported percentages rounded','small')
s.text(22,477,'Denominator is target test classes, not individual generated tests. Coverage is a proxy for test improvement.','small')
s.save()

s=SVG('evaluation-system','Proposed AI evaluation architecture with versioned application configurations, held-out cases, independent evaluation, release decisions, monitoring and feedback',1200,575)
s.node(20,20,298,103,'Versioned application',('Model · prompt · retrieval','Tools · permissions · memory'),'node node-navy')
s.node(20,185,298,105,'Evaluation corpus',('Representative + adversarial cases','Held-out set · human labels'),'node')
s.node(388,20,358,103,'Baseline and candidate runs',('Same tasks and test conditions','Record outputs AND tool actions'),'node node-teal')
s.node(388,185,358,132,'Independent scoring',('Deterministic contracts','Calibrated judges + expert review','Quality by scenario; cost and latency'),'node')
s.path('M 318 72 H 386');s.path('M 318 233 H 351 V 78 H 386');s.path('M 567 123 V 183');s.text(585,156,'versioned traces','edge-label')
s.parts.append('<polygon points="978,166 1153,249 978,332 803,249" class="decision"/>')
s.text(978,237,'Release gate','node-title','middle');s.text(978,263,'Agreed floors hold?','node-text','middle')
s.path('M 746 249 H 801');s.node(868,19,288,100,'Hold + investigate',('Failed case → diagnosis','Revise configuration or control'),'node node-sand')
s.path('M 978 167 V 121','edge edge-amber');s.text(995,146,'no','edge-label')
s.node(856,399,302,104,'Controlled deployment',('Canary / bounded exposure','Human escalation + rollback'),'node node-teal')
s.path('M 978 332 V 397');s.text(994,371,'yes','edge-label')
s.node(388,399,358,104,'Production monitoring',('Task outcomes · drift · denied actions','Sampled traces · incidents · corrections'),'node')
s.path('M 856 451 H 748');s.node(20,399,298,104,'Case curation',('Review expectations and privacy','Add failures to regression suite'),'node')
s.path('M 388 451 H 320');s.path('M 169 399 V 292','edge edge-dashed');s.text(183,359,'new cases','edge-label')
s.text(22,553,'Proposed application-level assurance · evaluate again when context, behavior or authority changes','small')
s.save()

s=SVG('test-sequence','Illustrative payment API test-generation sequence: contract, scoped context, candidate, policy-mediated execution, independent mutation test and reviewer approval',1200,540)
actors=[(115,'Engineer / QE'),(355,'QE agent'),(595,'Policy gateway'),(835,'Sandbox / CI'),(1080,'Reviewer')]
for x,t in actors:
 s.rect(x-106,15,212,53,'actor',4);s.text(x,47,t,'node-title','middle');s.path(f'M {x} 68 V 476','lifeline',False)
rows=[(106,115,355,'1  Contract: reject a negative payment amount'),(164,355,595,'2  Request approved API contract + test patterns'),(214,595,355,'3  Return scoped, versioned context'),(266,355,595,'4  Submit candidate test + requested runner'),(318,595,835,'5  Authorize sandbox run; no production access'),(372,835,595,'6  Test must catch a seeded boundary fault'),(420,595,1080,'7  Evidence bundle: assertions, CI, mutation result'),(475,1080,115,'8  Human approval → existing merge controls')]
for y,x1,x2,t in rows:
 s.path(f'M {x1} {y} H {x2}', 'edge edge-dashed' if x1>x2 else 'edge')
 # Put each short annotation above its message; span across available lanes when needed.
 labelx=25 if y==106 else (280 if y in (164,214,266) else (570 if y in(318,372) else (560 if y==420 else 240)))
 s.text(labelx,y-10,t,'sequence-label')
s.text(22,526,'Illustrative workflow · approved contract defines the oracle; generated tests cannot silently weaken it','small');s.save()

s=SVG('research-decisions','Research-to-design map connecting DORA, Meta, NIST and OSFI findings with architecture decisions',1200,530)
s.text(24,28,'RESEARCH OBSERVATION','lane-title');s.text(430,28,'DESIGN RESPONSE','lane-title');s.text(884,28,'EVIDENCE TO RETAIN','lane-title')
rows=[('DORA / verification effort','Generation can shift work into review.','Join effort with run telemetry','Prep · review · correction'),('Meta / filtered test generation','Passing is not proof of added value.','Independent test-quality gate','Stable runs · fault detection'),('NIST / lifecycle assurance','Assurance continues in production.','Version cases; feed failures back','Case history · drift · release'),('OWASP + OSFI / agent actions','Tools expand the impact of failure.','Enforce permissions outside the model','Identity · allow/deny · approval')]
for i,(a,b,c,d) in enumerate(rows):
 y=64+i*109;s.node(20,y,364,84,a,(b,),'node');s.node(430,y,397,84,c,(), 'node node-teal');s.text(447,y+57,['Measure net workflow effort','Protect approved assertions','Re-evaluate configuration changes','Test denied actions and recovery'][i],'node-text');s.path(f'M 384 {y+42} H 428');s.node(875,y,305,84,d,(), 'node');s.text(891,y+58,['D02','E04 · E05','A01 · A02','A03 · R01'][i],'node-text');s.path(f'M 827 {y+42} H 873')
s.save()

s=SVG('capability-horizons','Proposed capability roadmap with three horizons and evidence gates for stronger AI participation',1200,490)
for x,y,n,title,lines in [(20,284,'01','Trusted assistance',['Draft tests + diagnose failures','Independent checks; human approval']), (420,177,'02','Connected assurance',['Shared evaluation and context services','Cross-team evidence and feedback']), (820,70,'03','Controlled agents',['Multi-step work with bounded authority','Action-level controls and recovery'])]:
 s.rect(x,y,360,166,'node node-teal' if n=='02' else 'node');s.text(x+18,y+35,n,'stat');s.text(x+18,y+73,title,'node-title')
 for j,t in enumerate(lines):s.text(x+18,y+107+23*j,t,'node-text')
s.path('M 380 359 H 399 V 255 H 417');s.path('M 780 252 H 799 V 147 H 817')
s.text(28,249,'Gate: local quality + net effort','small');s.text(430,142,'Gate: repeatable outcomes across teams','small');s.text(827,35,'Gate: safe actions + tested resilience','small')
s.text(28,481,'Proposed horizons, not a dated forecast or measured maturity score','small');s.save()

s=SVG('evidence-contrasts','Two randomized-study findings measured different outcomes: a 26.08 percent increase in completed tasks in field experiments and a 19 percent increase in completion time in METR early-2025 study',1200,480)
s.rect(20,20,560,345,'lane');s.rect(620,20,560,345,'lane lane-sand')
s.text(44,54,'CUI ET AL. / THREE FIELD EXPERIMENTS','lane-title');s.text(644,54,'METR / EARLY-2025 TRIAL','lane-title')
s.text(44,120,'+26.08%','big-stat');s.text(44,159,'completed tasks','label');s.text(644,120,'+19%','big-stat');s.text(644,159,'completion time','label')
for x,vals in [(44,[('Developer sample','4,867'),('Precision','SE 10.3 percentage points'),('Setting','Coding assistants in three firms')]),(644,[('Developer / task sample','16 / 246'),('Precision','95% CI: +2% to +39%'),('Setting','Experienced developers; familiar repos')])]:
 for i,(a,b) in enumerate(vals):s.text(x,209+51*i,a,'small');s.text(x,232+51*i,b,'node-title')
s.path('M 300 365 V 398 H 900 V 365','edge',False);s.text(600,439,'The unit, task and user population determine what transfers.','node-title','middle');s.text(600,470,'Separate outcomes; do not pool these percentages or treat them as QE savings rates.','small','middle');s.save()


s=SVG('threat-boundary','Agent threat model: untrusted context reaches the model, but a policy gateway controls tools and resource access, with denied-action tests and bounded recovery',1200,490)
s.rect(20,30,278,370,'lane lane-sand');s.text(40,60,'UNTRUSTED INPUT','lane-title')
s.node(40,88,238,100,'Retrieved content',('Documents · web · code','May contain instructions'))
s.node(40,237,238,100,'Tool output / memory',('Poisoned observations','Persistent injected context'))
s.node(358,163,240,125,'Agent runtime',('Interprets task and context','Proposes tool + arguments','Cannot grant itself access'))
s.path('M 278 137 H 320 V 208 H 356');s.path('M 278 287 H 320 V 250 H 356')
s.path('M 641 36 V 417','lifeline',False);s.text(648,31,'AUTHORITY BOUNDARY','lane-title')
s.node(687,162,234,126,'Policy gateway',('Agent identity + resource','Allowlist + approval rule','Deny outside scope'),'node node-navy')
s.path('M 598 225 H 685');s.text(609,203,'request','edge-label')
s.node(972,67,208,105,'Allowed tools',('Scoped credentials','Bounded execution'),'node node-teal');s.path('M 921 205 H 946 V 119 H 970')
s.node(972,291,208,105,'Denied action',('No side effect','Stop / escalate'),'node node-sand');s.path('M 921 249 H 946 V 343 H 970','edge edge-amber')
s.text(25,441,'Test: poisoned context requests a production write → gateway denies → trace records identity, target and reason','node-title')
s.text(25,477,'Proposed negative test · test recovery as well as refusal · finite coverage does not prove absence of vulnerabilities','small');s.save()

s=SVG('evidence-model','Measurement data model joining task, run, review and outcome records to measure net effort and quality by comparable task cohort',1200,500)
for x,y,w,title,lines,cls in [
 (20,32,294,'Task',('task_id · task type · complexity','Eligible cohort + baseline effort','Preparation + active execution'),'node'),
 (449,32,304,'Run',('run_id → task_id','Model / prompt / context versions','Tool calls · cost · elapsed time'),'node node-teal'),
 (884,32,296,'Review',('review_id → run_id','Decision + active human effort','Corrections + independent checks'),'node'),
 (884,283,296,'Outcome',('outcome_id → task_id / artifact_id','Rework · defects · cycle time','Observed period + capture basis'),'node'),
 (449,283,304,'Cohort comparison',('Comparable tasks + quality floors','Prep + execution + review + rework','Net effort, cost and uncertainty'),'node node-navy')]:s.node(x,y,w,133,title,lines,cls)
s.path('M 314 99 H 447');s.text(381,85,'1 : many','edge-label','middle');s.path('M 753 99 H 882');s.text(818,85,'1 : many','edge-label','middle')
s.path('M 1032 165 V 281');s.text(1048,255,'artifact link','edge-label');s.path('M 1032 215 H 789 V 312 H 755','edge edge-dashed');s.text(812,205,'review effort','edge-label')
s.path('M 168 165 V 349 H 447');s.path('M 601 165 V 281');s.path('M 884 349 H 755')
s.text(25,456,'Total human effort = preparation + execution + verification + correction + rework','node-title')
s.text(25,487,'Proposed logical schema · retain identifiers and versions; minimize sensitive payloads · time saved requires a capture mechanism','small');s.save()

print(f'{len(list(ROOT.glob("*.svg")))} native diagrams written')

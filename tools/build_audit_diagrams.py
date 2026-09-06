"""Readable overview diagrams and explicitly ordered walkthroughs (authored synthesis)."""
import json
from pathlib import Path
from build_research_diagrams import SVG
ROOT=Path(__file__).resolve().parents[1]
research=json.loads((ROOT/'_data/diagram_research.json').read_text())
def finish(s,sources,caption,finding,decision,words):
 s.save();research[s.name]=dict(sources=sources,caption=caption,finding=finding,decision=decision,words=words)
s=SVG('strategy-choices','Three strategic choices: local assistants, shared assurance services, bounded agents',1200,450)
for x,n,title,lines,cls in [(20,'01','Local assistants',('Fast individual adoption','Duplicated context and checks','Local learning stays fragmented'),'node'),(425,'02','Shared assurance',('Portable tests and evidence','Domain-owned expectations','Common evaluation and controls'),'node node-teal'),(830,'03','Bounded agents',('Multi-step delegated work','Stronger action authority','Higher recovery obligations'),'node')]:
 s.text(x+18,40,n,'stat');s.node(x,70,350,172,title,lines,cls)
s.path('M 370 155 H 423');s.path('M 775 155 H 828');s.text(50,290,'Use to learn tasks', 'label');s.text(440,290,'Recommended strategic center', 'label');s.text(848,290,'Earn through evidence','label')
s.rect(20,335,1160,85,'lane');s.text(42,368,'Sequencing choice: standardize the proof before expanding delegated authority.','label');s.text(42,399,'Trade-off: shared services require ownership; agent breadth requires independently tested containment.','node-text')
finish(s,'G01,D01,A01,A03','Authored strategic choices · no bank maturity or savings claim.','Industry outlook and lifecycle guidance support broader AI participation and independent assurance.','Use shared assurance as the strategic center; delegate actions only as boundaries and evidence mature.','Local assistants accelerate individual tasks. Shared assurance makes expectations, evaluation and evidence reusable. Bounded agents add delegated actions and stronger recovery obligations. These are design choices, not measured maturity scores.')
s=SVG('bank-workflow','Illustrative payment API change: current working hypothesis and proposed target workflow',1200,470)
s.text(20,38,'CURRENT WORKING HYPOTHESIS · VALIDATE WITH THE BANK','lane-title')
for x,title,line in [(20,'Interpret requirement','Interpret intent'),(325,'Write tests','Local prompts'),(630,'Review change','Rebuild evidence'),(935,'Release','Late evidence assembly')]:
 s.node(x,65,245,94,title,(line,));
 if x<935:s.path(f'M {x+245} 112 H {x+303}')
s.text(20,222,'PROPOSED TARGET · NEGATIVE PAYMENT AMOUNTS MUST BE REJECTED','lane-title')
for x,title,lines in [(20,'Domain contract',('Owner-approved rule','Versioned test oracle')),(325,'Bounded generation',('Permitted context only','Sandbox tests')),(630,'Independent proof',('Original passes','Mutant fails','Reviewer decides')),(935,'Evidence-led release',('Existing release owner','Failure → new test case'))]:
 s.node(x,250,245,126,title,lines,'node node-teal')
 if x<935:s.path(f'M {x+245} 310 H {x+303}')
s.text(20,435,'Shared: identity, evaluation runners, evidence schema. Domain: payment rules, test cases, acceptance and service outcomes.','small')
finish(s,'E04,E05,D02,A03','Illustrative financial-services workflow · current-state row is a hypothesis, not an observed bank condition.','Test-generation studies use quality gates; verification work remains part of the workflow.','Join a domain-owned payment contract to shared evidence services and existing release authority.','The current-state hypothesis has local interpretation, test writing, review and late evidence assembly. The target versions the approved payment rule, generates tests in a scoped sandbox, independently checks fault detection and retains the reviewer decision and release evidence.')
s=SVG('contract-chain','Four joined artifacts for payment API test generation',1200,435)
for x,title,lines in [(20,'Task envelope',('PAY-042 · payments-api','Versioned input hashes','Scope · expiry · budget')),(325,'Policy decision',('DEC-042 · policy v7','Allow sandbox test only','Identity + expiry binding')),(630,'Evaluation manifest',('EVAL-042 · corpus v3','Original passes','Mutant fails','Artifact + runner hashes')),(935,'Evidence record',('RUN-042 · review held','Links all three artifacts','No self-approval'))]:
 s.node(x,80,245,180,title,lines,'node node-teal' if x in (325,935) else 'node')
 if x<935:s.path(f'M {x+245} 169 H {x+303}')
s.rect(20,305,1160,100,'lane');s.text(42,338,'Every boundary verifies identity, versions, expiry, resource scope and the same artifact digest.','label');s.text(42,372,'Mismatch, unavailable authorization or missing durable evidence → hold; no promotion.','node-text')
finish(s,'A01,A03,R01','Runnable reference contracts · synthetic example, not a production integration.','Lifecycle and action-risk guidance require versioned evidence and scoped authority.','Provide joined artifacts and negative fixtures so the logical design can be exercised.','A payment test task binds permitted context, resource scope and deadline. A policy decision authorizes only the sandbox action. An evaluation manifest joins artifact and corpus versions. The evidence record links task, policy and evaluation and remains held for human review.')
s=SVG('appsec-loop','Application-security finding through reviewed remediation, with a separate dismissed-finding audit branch',1200,450)
for x,title,lines in [(20,'Scanner finding',('Trace + CWE + source hash','No model-only discovery claim')),(420,'Contextual triage',('Evidence + human disposition','Never silently suppress')),(820,'Draft remediation',('Reviewed patch proposal','Least-privilege identity'))]:
 s.node(x,45,350,120,title,lines,'node node-teal' if x==420 else 'node')
s.path('M 370 106 H 418');s.path('M 770 106 H 818');s.node(820,270,350,125,'Independent validation',('Rerun scanner + regression','Exploit / negative case','Owner approves existing PR gate'))
s.path('M 994 165 V 268');s.node(420,270,350,125,'Dismissal audit',('Retain evidence and reason','Sample dismissed findings','Reopen missed true positives'),'node node-sand')
s.path('M 595 165 V 268','edge edge-dashed');s.text(612,225,'if dismissed','edge-label');s.node(20,270,350,125,'Learning record',('Accepted fix / audited dismissal','Outcome + reviewer + versions','New case for next evaluation'))
s.path('M 820 408 H 196 V 396','edge edge-dashed');s.path('M 420 334 H 372','edge edge-dashed')
finish(s,'E08,E09,A03','Proposed AppSec workflow · triage, fix and dismissal are distinct evidence paths.','Autofix reports remediation workflow gains; static-analysis research shows model-dependent precision and recall.','Validate fixes independently and audit dismissals so reducing alert volume cannot conceal missed vulnerabilities.','A scanner finding is enriched with trace and contextual evidence. Human triage chooses a draft remediation or a retained dismissal. Fixes rerun the scanner and regression checks. Dismissals enter a sampled audit and missed true positives are reopened. Both paths retain reviewer, versions and outcomes.')
# Projection-friendly platform overview retains all directed routes and component identities.
s=SVG('platform-slide','Enterprise assurance platform overview; inspect components or follow the guided paths',1200,440)
for x,w,title,line in [(20,280,'Team workflows','IDE · workbench'),(400,280,'Delivery systems','Repository · CI'),(900,280,'AI applications','RAG · agents')]:s.node(x,10,w,62,title,(line,),'node')
for x,w,title,line,key in [(20,250,'Context','Permitted snapshots','context'),(330,250,'QE runtime','Bounded plan + model','runtime'),(640,250,'Action gateway','Identity + policy','gateway'),(950,230,'Checks','Sandbox + validity','checks')]:s.node(x,143,w,78,title,(line,),'node node-teal' if key=='gateway' else 'node',key)
for x,w,title,line,key in [(20,250,'Evidence store','Run + artifact + decision','evidence'),(330,250,'Regression corpus','Reviewed failure cases','corpus'),(640,250,'Release authority','Reviewer + change gate','release'),(950,230,'Evaluation','Held-out + adversarial','evaluation')]:s.node(x,315,w,78,title,(line,),'node node-teal' if key=='release' else 'node',key)
for d,a,b in [('M 270 182 H 328','context','runtime'),('M 580 182 H 638','runtime','gateway'),('M 890 182 H 948','gateway','checks'),('M 160 72 V 101 H 455 V 141','experience','runtime'),('M 540 72 V 123 H 145 V 141','delivery','context'),('M 1040 72 H 1192 V 354 H 1182','application','evaluation'),('M 1065 221 V 277 H 765 V 313','checks','release'),('M 950 354 H 892','evaluation','release'),('M 700 221 V 250 H 145 V 313','gateway','evidence'),('M 765 393 V 427 H 145 V 395','release','evidence'),('M 270 354 H 328','evidence','corpus'),('M 455 315 V 293 H 1065 V 313','corpus','evaluation')]:s.path(d,'edge edge-dashed' if a in ('application','delivery','gateway','release','corpus') and b!='checks' else 'edge',link=(a,b))
s.save()
(ROOT/'_data/diagram_research.json').write_text(json.dumps(research,indent=2,ensure_ascii=False)+'\n')
# Sequence numbering follows authored message order. Recovery and AppSec use explicit branches.
flows={}
sequences={
 'test-sequence': [('1 / Task contract','The domain owner requires rejection of negative payment amounts.'),('2 / Request context','The runtime requests only approved contract and test patterns.'),('3 / Scoped context','The policy boundary returns versioned permitted evidence.'),('4 / Candidate test','The runtime submits a candidate and a requested runner.'),('5 / Authorize sandbox','Authorization is checked before any tool runs.'),('6 / Independent test','The original passes and the seeded faulty behavior fails.'),('7 / Evidence bundle','Checks, versions and artifact digest go to the reviewer.'),('8 / Human decision','Existing repository controls govern approval and merge.')],
 'gateway-sequence':[('1 / Attempt production write','The sandbox-only task requests an unauthorized resource.'),('2 / Evaluate policy','The gateway checks identity, scope and approval before execution.'),('3 / Record denial','Persist reason and policy version. The tool is never invoked.'),('4 / Return denied','Stop this action; escalate through a separate authorized workflow.')],
 'fallback-state':[('1 / Contain','A breach or outage stops consequential agent actions.'),('2 / Route to fallback','Use the approved manual queue or last validated service.'),('3 / Recovery review','Validate the fix and exercise the original failure case.'),('4 / Authorized resumption','An owner authorizes normal service. Reconcile prior side effects separately.')],
 'appsec-loop':[('1 / Finding → triage','Enrich scanner evidence and identify the responsible owner.'),('2 / Fix branch','A reviewed disposition requests a draft remediation.'),('3 / Validate fix','Rerun security and regression checks; review before merge.'),('Dismissal branch','If triage dismissed the finding, audit it instead of treating it as fixed.'),('5 / Fix evidence','Retain the verified outcome, versions and reviewer.'),('6 / Dismissal evidence','Retain audit results; reopen any missed true positive.')]
}
for name,steps in sequences.items():
 flows[name]=[dict(title=title,detail=detail,node='',routes=[f'edge:{i}']) for i,(title,detail) in enumerate(steps)]
(ROOT/'_data/diagram_flows.json').write_text(json.dumps(flows,indent=2)+'\n')

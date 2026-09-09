"""Regenerate all research diagrams, including the deeper audience briefings.

The diagrams are proposed designs, not empirical scores or publisher models.
Importing the original builder also regenerates its ten shared diagrams.
"""
import json
from pathlib import Path
from build_research_diagrams import SVG

DATA = Path(__file__).resolve().parents[1] / '_data/diagram_research.json'
research = json.loads(DATA.read_text())

def finish(s, sources, caption, finding, decision, words):
    s.save()
    research[s.name] = dict(sources=sources, caption=caption, finding=finding,
                            decision=decision, words=words)

def rail(s, text, y=470):
    s.rect(20, y-28, 1160, 52, 'lane lane-teal')
    s.text(40, y+5, text, 'node-text')

s = SVG('opportunity-map', 'Proposed portfolio screen by action authority and ease of verifying the result', 1200, 510)
s.rect(180, 42, 475, 185, 'lane lane-teal'); s.rect(675, 42, 495, 185, 'lane lane-sand')
s.rect(180, 245, 475, 185, 'lane'); s.rect(675, 245, 495, 185, 'lane lane-sand')
s.text(20, 97, 'Easy to verify', 'node-title'); s.text(20, 300, 'Needs expert', 'node-title'); s.text(20, 327, 'judgment', 'node-title')
s.text(200, 77, 'BOUNDED STARTING POINTS', 'lane-title')
s.text(200, 119, 'Test drafts with an executable contract', 'label'); s.text(200, 153, 'Failure summaries linked to logs', 'node-text')
s.text(695, 77, 'CONTROLLED EXECUTION', 'lane-title')
s.text(695, 119, 'Sandbox test execution', 'label'); s.text(695, 153, 'Draft pull requests through scoped tools', 'node-text')
s.text(200, 280, 'BUILD THE EVALUATION CAPABILITY', 'lane-title')
s.text(200, 325, 'Risk analysis and exploratory test ideas', 'label'); s.text(200, 363, 'Expert review defines useful output', 'node-text')
s.text(695, 280, 'SEPARATE AUTHORITY DECISION', 'lane-title')
s.text(695, 325, 'Production changes and customer actions', 'label'); s.text(695, 363, 'Require action-level evidence and recovery', 'node-text')
s.path('M 180 452 H 1170', 'axis-line'); s.text(190, 488, 'Advice / draft artifacts', 'node-text'); s.text(860, 488, 'Greater action authority', 'node-text')
finish(s, 'E04,E06,A01,A03', 'Proposed portfolio screen · qualitative categories, not a scored market ranking.',
       'Industrial cases demonstrate bounded test generation and diagnosis. Agent guidance adds the consequences of actions to the evaluation problem.',
       'Select an initial workflow with an independent check and limited authority; assess judgment-heavy and consequential workflows separately.',
       'A two-by-two screen separates easy-to-verify results from expert judgment, and advice from greater action authority. Test drafts and log-linked diagnosis are candidate starting points.')

s = SVG('ownership-system', 'Proposed operating responsibilities for product teams, the platform and independent challenge', 1200, 500)
s.node(375, 25, 450, 88, 'Product and QE owner', ('Owns behavior and release outcomes',), 'node node-teal')
s.node(20, 213, 330, 123, 'Shared platform team', ('Context, identity and runtime', 'Service + evidence export'), 'node')
s.node(435, 213, 330, 123, 'Delivery team', ('Test intent, assertions and review', 'Accept through existing CI'), 'node node-navy')
s.node(850, 213, 330, 123, 'Delivery and risk owners', ('Exception cases + evidence review', 'Scope and escalation advice'), 'node node-sand')
s.path('M 600 113 V 211'); s.text(614, 166, 'accountability', 'edge-label')
s.path('M 350 260 H 433'); s.path('M 850 260 H 767'); s.text(90, 192, 'Shared services', 'lane-title'); s.text(880, 192, 'Independent challenge', 'lane-title')
s.path('M 600 336 V 398'); s.node(375, 400, 450, 75, 'Operations and value owners', ('Incidents, adoption and capacity use',), 'node node-teal')
finish(s, 'D01,M01,A01', 'Proposed ownership model · adapt to existing institutional accountability.',
       'DORA and McKinsey place AI adoption in the surrounding delivery organization. NIST frames governance across the lifecycle.',
       'Assign a product owner for outcomes, a platform owner for services and a separate challenge function; include operations and value capture.',
       'Product and QE accountability flows to the delivery team. Shared platform services enable delivery; delivery and risk owners challenge its evidence. Operations and value owners use the resulting outcomes.')

s = SVG('investment-stack', 'Proposed investment split between product-specific quality assets and reusable assurance services', 1200, 490)
s.text(30, 35, 'PRODUCT-SPECIFIC ASSETS', 'lane-title')
for x, title, lines in [(20, 'Payments', ('Transaction invariants', 'Failure and recovery cases')), (415, 'Customer service AI', ('Grounded response criteria', 'Escalation and tool scenarios')), (810, 'Engineering workflows', ('Repository test contracts', 'Review and rework baselines'))]:
    s.node(x, 58, 370, 118, title, lines)
for x in (205, 600, 995): s.path(f'M {x} 176 V 231')
s.rect(20, 235, 1160, 106, 'lane lane-teal'); s.text(40, 266, 'REUSABLE ASSURANCE SERVICES', 'lane-title')
s.text(40, 306, 'Dataset registry · Evaluation runners · Identity + gateway · Evidence store · Recovery tooling', 'label')
s.path('M 600 341 V 390')
s.rect(20, 393, 1160, 76, 'lane'); s.text(40, 425, 'REPLACEABLE MODEL AND TOOL ADAPTERS', 'lane-title')
s.text(40, 452, 'Procure capabilities against local tests; preserve access to configurations, artifacts and evidence.', 'node-text')
finish(s, 'D01,M01,T03,T06', 'Proposed investment architecture · layer size does not represent budget allocation.',
       'Organizational research emphasizes delivery foundations. Evaluation tools expose datasets and run comparisons, but task fit still requires local validation.',
       'Fund reusable services centrally while product teams own domain-specific quality assets. Use adapters and evidence export requirements to support substitution.',
       'Three example domains contribute different quality assets. They use a common assurance layer, which connects through replaceable model and tool adapters.')

s = SVG('strategic-scorecard', 'Proposed leadership evidence contract linking strategic goals, measures and decisions', 1200, 500)
for x, t in [(20,'STRATEGIC OUTCOME'),(370,'EVIDENCE TO EXAMINE'),(820,'LEADERSHIP DECISION')]: s.text(x+16,32,t,'lane-title')
rows = [('Delivery capacity', 'Net effort with review and rework', 'Redeploy verified capacity'),
        ('Trustworthy outcomes', 'Fault detection and escaped defects', 'Hold the quality floor'),
        ('Reusable capability', 'Results by team and task', 'Fund the shared service'),
        ('Controlled autonomy', 'Denials and recovery tests', 'Set the next authority limit')]
for i,(a,b,c) in enumerate(rows):
    y=58+i*99
    s.node(20,y,310,76,a,(), 'node node-teal'); s.node(370,y,405,76,b,()); s.node(820,y,360,76,c,(), 'node node-sand')
    s.path(f'M 330 {y+38} H 368'); s.path(f'M 775 {y+38} H 818')
s.text(36, 483, 'Every readout includes task mix, sample, period, costs and uncertainty. No organizational results are claimed here.', 'small')
finish(s, 'D02,E01,E03,A01', 'Proposed leadership scorecard · measures and decisions, with no invented performance values.',
       'Studies use different tasks, populations and outcome measures; verification effort can offset generation gains.',
       'Tie each strategic objective to observable evidence and an explicit decision. Keep quality and control floors alongside capacity measures.',
       'Four rows connect delivery capacity, trustworthy outcomes, reusable capability and controlled autonomy to evidence and leadership decisions.')

s = SVG('governance-loop', 'Proposed governance loop connecting system inventory, authority, evidence and ongoing review', 1200, 510)
s.node(20,70,290,113,'System inventory',('Purpose + dependencies','Named accountable owner'), 'node node-teal')
s.node(455,70,290,113,'Authority and appetite',('Allowed data and actions','Escalation + stop rules'))
s.node(890,70,290,113,'Evidence review',('Evaluation + control results','Exceptions + open risks'))
s.path('M 310 126 H 453'); s.path('M 745 126 H 888')
s.node(455,310,290,104,'Operational review',('Incidents + service changes','Revisit scope and authority'), 'node node-sand')
s.path('M 1035 183 V 362 H 747'); s.path('M 455 362 H 165 V 185','edge edge-dashed')
s.text(891,240,'Approved scope', 'node-text'); s.text(24,282,'New evidence', 'node-text')
rail(s,'OSFI context: July 2026 bulletin = sound practices; revised E-23 takes effect 1 May 2027.',478)
finish(s, 'A01,R01,R02', 'Proposed governance loop · assess applicability through existing risk functions.',
       'NIST links governance to lifecycle risk management. OSFI discusses AI accountability and resilience; revised E-23 has a future effective date.',
       'Maintain an inventory and an explicit authority boundary, then revisit them after incidents or material changes. This diagram is not a compliance certification.',
       'Inventory informs authority limits. Evidence review supports an approved scope. Operations feed incidents and service changes back into the inventory and authority decision.')

s = SVG('context-route', 'Proposed permission-aware retrieval pipeline with provenance and an untrusted-content boundary',1200,520)
s.node(20,55,240,124,'Approved sources',('Contracts + code','Synthetic fixtures','Access + retention'))
s.node(325,55,240,124,'Retrieval service',('User and agent scope','Filter by current access','Relevant passages'), 'node node-teal')
s.node(630,55,240,124,'Context snapshot',('Source IDs + versions','Minimal task evidence','Classified + traceable'))
s.node(935,55,245,124,'Agent runtime',('Read as task evidence','Treat text as data','Scoped proposals'), 'node node-navy')
for x in (260,565,870):s.path(f'M {x} 118 H {x+63}')
s.node(325,302,385,115,'Retrieval evaluation',('Relevant evidence and correct citations','Forbidden / stale access tests'), 'node node-sand')
s.path('M 750 179 V 262 H 517 V 300','edge edge-dashed')
s.node(785,302,395,115,'Action authority remains external',('Retrieved text cannot grant tool access','Gateway rechecks the requested action'))
s.path('M 1057 179 V 300')
s.text(35,481,'Proposed checks include denied retrieval, access revocation, stale content and conflicting source passages.','small')
finish(s,'A01,A03,R01','Proposed context architecture · retrieval improves task evidence; permissions remain separately enforced.',
       'Lifecycle guidance covers input provenance; agent risk guidance addresses untrusted context and access scope.',
       'Filter retrieval using current authorization, retain a versioned input snapshot and test grounding separately from action permissions.',
       'Approved sources feed scoped retrieval and a minimal context snapshot. The runtime treats that content as evidence. Retrieval checks evaluate relevance and access; the action gateway retains authority.')

s = SVG('configuration-bundle','Proposed versioned release bundle connecting application components and evaluation evidence',1200,500)
s.rect(20,20,740,364,'lane');s.text(40,53,'APPLICATION RELEASE MANIFEST','lane-title')
for x,y,title,lines in [(40,80,'Model + prompt',('Provider / model revision','System and task prompt IDs')),(405,80,'Retrieval + data',('Index and source snapshot','Corpus and access policy IDs')),(40,230,'Tools + memory',('Schemas and allowed actions','Memory rules and retention')),(405,230,'Evaluation contract',('Dataset, rubric and judge versions','Thresholds and scenario groups'))]:
    s.node(x,y,335,126,title,lines)
s.node(860,118,320,156,'Release identity',('Manifest hash + code commit','Baseline and candidate run IDs','Decision and approving owner'), 'node node-teal')
s.path('M 760 196 H 858')
rail(s,'A material component change creates a new candidate and triggers the relevant evaluation suite.',453)
finish(s,'A01,T03,T06','Proposed release manifest · the model name alone cannot identify the evaluated system.',
       'Lifecycle assurance requires tracking changing system components. Evaluation platforms compare configurations and datasets.',
       'Bind the code, prompt, retrieval, tool policy and evaluator versions to one release identity; keep the run and decision references with it.',
       'A manifest contains model and prompt, retrieval and data, tools and memory, and the evaluation contract. A release identity binds those versions to evaluated runs and approval.')

s = SVG('test-oracle','Proposed independent test oracle showing expected behavior, generated assertions and execution evidence',1200,510)
s.node(20,46,350,117,'Approved behavior contract',('Reject negative payment amounts','No balance or ledger change'), 'node node-teal')
s.node(20,244,350,117,'Implementation under test',('Current code may contain a defect','Observed behavior is evidence'))
s.node(465,130,305,124,'Generated candidate test',('Input: a negative amount','Contract-derived assertions','Agent proposes the test'))
s.node(865,46,315,117,'Oracle review',('Check result + side effects','Challenge weak assertions'), 'node node-sand')
s.node(865,244,315,117,'Independent execution',('Pass on valid implementation','Fail on a relevant seeded fault'))
s.path('M 370 103 H 407 V 180 H 463');s.path('M 370 303 H 407 V 219 H 463','edge edge-dashed')
s.path('M 770 171 H 817 V 103 H 863');s.path('M 770 213 H 817 V 303 H 863')
rail(s,'A test can pass because it repeats the implementation’s mistake. The expected behavior needs an independent basis.',465)
finish(s,'E04,E05','Illustrative payment contract · expected behavior is proposed for this example.',
       'Meta separates generated tests from executable validation and extends test value beyond code coverage through fault-oriented testing.',
       'Review assertions against an approved behavior contract and evaluate side effects. Use relevant faults to challenge a test that merely matches current behavior.',
       'The approved contract and implementation inform a candidate test. Separate oracle review checks intended behavior; independent execution checks both valid code and a seeded fault.')

s = SVG('mutation-loop','Proposed mutation-guided test generation: one candidate must pass original code and detect a selected fault',1200,500)
s.node(20,58,270,121,'Fault concern',('Fault: accepts negatives','Select a relevant mutation'), 'node node-sand')
s.node(390,58,310,121,'Candidate test',('Generate for stated concern','Preserve intended assertion'), 'node node-teal')
s.path('M 290 119 H 388')
s.node(860,25,320,110,'Original implementation',('Candidate passes','Preserve expected behavior'))
s.node(860,210,320,110,'Mutated implementation',('Test fails for target fault','Exclude invalid faults','Exclude equivalent faults'))
s.path('M 700 103 H 780 V 80 H 858');s.path('M 700 147 H 780 V 265 H 858')
s.node(390,358,310,99,'Reviewable test evidence',('Results + fault rationale','Human review before merge'), 'node node-teal')
s.path('M 1180 80 H 1190 V 408 H 702');s.path('M 1020 320 V 347 H 545 V 356')
s.path('M 390 408 H 335 V 160 H 292','edge edge-dashed');s.text(36,379,'Refine the concern', 'node-text')
finish(s,'E05','Design pattern informed by Meta ACH · detecting selected mutants does not prove all real faults are covered.',
       'Meta ACH uses modeled faults to drive test generation and checks generated tests against original and mutated code.',
       'Retain both execution results and review mutation relevance. A test gains useful evidence when it distinguishes intended behavior from a meaningful fault.',
       'A fault concern drives a candidate test. It must pass original code and fail a relevant mutated version. Combined evidence reaches review; weak results lead to refining the concern.')

s = SVG('diagnosis-workflow','Proposed failure diagnosis workflow with log citations, review and separate accuracy and deployment populations',1200,500)
s.node(20,55,260,112,'Failing integration test',('Safe logs + trace IDs','Relevant change context'))
s.node(335,55,260,112,'Diagnostic assistant',('Extract relevant log lines','Cause + evidence'), 'node node-teal')
s.node(650,55,250,112,'Engineer review',('Confirm or correct cause','Route remediation'))
s.node(955,55,225,112,'Outcome record',('Accepted / corrected','Diagnosis effort'))
for a,b in [(280,333),(595,648),(900,953)]:s.path(f'M {a} 111 H {b}')
s.rect(20,245,565,185,'lane lane-teal');s.text(42,284,'GOOGLE: REVIEWED ACCURACY SAMPLE','lane-title');s.text(42,353,'90.14%','big-stat');s.text(295,339,'71 manually evaluated failures','node-text');s.text(42,397,'Root-cause accuracy in the reported case study','node-text')
s.rect(610,245,570,185,'lane');s.text(632,284,'GOOGLE: DEPLOYMENT POPULATION','lane-title');s.text(632,353,'52,635','big-stat');s.text(897,339,'distinct failing tests','node-text');s.text(632,397,'A separate population; accuracy was not measured on all of it','node-text')
s.text(35,478,'Local pilot: blinded review of sampled causes, evidence correctness and total diagnosis effort.','small')
finish(s,'E06','Google case study (2026) plus a proposed local workflow · populations remain separate.',
       'Google reports 90.14% root-cause accuracy on 71 reviewed failures and deployment across 52,635 distinct failing tests.',
       'Attach relevant log evidence to a diagnosis, retain reviewer corrections and measure local accuracy separately from reach.',
       'A failing test feeds an assistant and then an engineer review. The outcome record captures corrections and effort. Separate panels show the small accuracy sample and larger deployment population.')

s = SVG('flaky-repair','Proposed flaky-test repair loop preserving test semantics and checking repeatability',1200,500)
s.node(20,65,250,118,'Reproduce the flake',('Record failure conditions','Retain test intent'))
s.node(330,65,250,118,'Targeted context',('Dynamic call paths','Timing and shared state'))
s.node(640,65,250,118,'Candidate repair',('Fix the failure cause','Keep valid assertions'), 'node node-teal')
s.node(950,65,230,118,'Validation',('Vary conditions','Review behavior'))
for a,b in [(270,328),(580,638),(890,948)]:s.path(f'M {a} 124 H {b}')
s.node(640,315,540,109,'Reject misleading stability',('Deleted assertions can hide a faulty repair.','Review both the repair and the fault-detection capability.'),'node node-sand')
s.path('M 1065 183 V 313');s.path('M 640 368 H 145 V 185','edge edge-dashed')
s.text(42,299,'Failed validation returns to diagnosis', 'node-text')
s.text(35,477,'Pattern informed by FlakyGuard’s Uber Go case; validate transferability to the local language and test environment.','small')
finish(s,'E07','Proposed repair assurance loop · inspired by a six-month industrial Go case.',
       'FlakyGuard combines targeted execution context with LLM-based repair. Its paper discusses the risk of fixes that weaken test semantics.',
       'Require reproducibility, preserved assertions and independent repeated validation before proposing a merge.',
       'The workflow reproduces a flaky failure, gathers targeted context, proposes a repair and validates it. Semantically weak or unstable repairs return to diagnosis.')

s = SVG('corpus-design','Proposed evaluation corpus lifecycle with separate development, held-out and adversarial case sets',1200,510)
s.node(20,60,280,141,'Candidate cases',('Tasks + approved examples','Reviewed service failures','Synthetic edge cases'))
s.node(360,60,280,141,'Curation and labeling',('Minimize sensitive content','Deduplicate related cases','Review expected behavior'), 'node node-teal')
s.path('M 300 130 H 358')
for y,title,lines in [(20,'Development set',('Prompt iteration and debugging',)),(174,'Held-out evaluation',('Release comparison; restrict tuning access',)),(328,'Adversarial set',('Authority, disclosure, recovery',))]:
    s.node(765,y,415,112,title,lines,'node node-sand' if y==328 else 'node');s.path(f'M 640 130 H 700 V {y+56} H 763')
s.text(35,296,'SPLIT RELATED CASES TOGETHER', 'lane-title');s.text(35,334,'Near duplicates can make a held-out result', 'label');s.text(35,365,'look more general than it is.', 'label')
s.text(35,481,'Version each case, source permission, expectation, scenario tag and review decision. Report results by important slice.','small')
finish(s,'A01,T03,T06','Proposed corpus design · set sizes depend on the task and consequences of failure.',
       'NIST emphasizes representative evaluation. Evaluation tooling supports curated datasets and feedback from operational traces.',
       'Separate tuning from release evaluation, group related examples during splitting and preserve adversarial scenarios with explicit expected behavior.',
       'Candidate cases pass through privacy review, deduplication and labeling. They feed development, held-out and adversarial sets with distinct uses.')

s = SVG('gateway-sequence','Proposed sequence for a denied tool action: policy enforcement happens before execution',1200,520)
actors=[(20,'Agent runtime'),(320,'Policy gateway'),(620,'Scoped tool'),(920,'Evidence store')]
for x,title in actors:
    s.node(x,15,260,70,title,(),'node node-navy',flow_key={20:'runtime',320:'gateway',620:'tool',920:'evidence'}[x]);s.path(f'M {x+130} 85 V 384','lifeline',False)
events=[(150,450,132,'1  Request action + resource + run ID'),(450,450,210,'2  Check identity, policy and approval'),(450,1050,287,'3  Record denial + policy version'),(450,150,364,'4  Return denial; stop or escalate')]
for a,b,y,t in events:
    if a==b:s.path(f'M {a} {y-18} H {a+60} V {y+18} H {a}');s.text(a+78,y,t,'sequence-label')
    else:s.path(f'M {a} {y} H {b}');s.text(min(a,b)+12,y-13,t,'sequence-label')
s.text(656,420,'No tool invocation', 'node-title');s.text(654,445,'Assert no side effect', 'node-text')
s.text(35,496,'Negative case: a retrieved document requests a production write, while the agent has sandbox-only authority.','small')
finish(s,'A03,R01','Proposed denial sequence · the test verifies execution and evidence, beyond the model’s response.',
       'Agent risk guidance identifies tool misuse and identity problems. OSFI discusses scoped identities, tool restrictions and activity logs.',
       'Check policy at the gateway before invocation. A denial must produce no tool side effect and a traceable reason.',
       'The runtime requests a production write. The gateway evaluates scope, records a denial and returns it to the runtime. The scoped tool is never invoked.')

s = SVG('execution-isolation','Proposed execution zones separating agent orchestration, sandbox work and protected production',1200,510)
for x,w,title,cls in [(20,350,'AGENT ORCHESTRATION','lane'),(425,350,'SANDBOX EXECUTION','lane lane-teal'),(830,350,'PROTECTED PRODUCTION','lane lane-sand')]:s.rect(x,20,w,370,cls);s.text(x+18,55,title,'lane-title')
s.node(40,95,310,106,'Runtime worker',('Bounded task and retry budget','No production credentials'))
s.node(445,95,310,106,'Ephemeral runner',('Task-scoped identity','Synthetic / approved fixtures'))
s.node(850,95,310,106,'Existing release systems',('Protected deployment identity','Separate change authority'))
s.path('M 350 148 H 443');s.text(371,133,'allow', 'edge-label','middle')
s.node(445,251,310,106,'Controlled outputs',('Logs and test artifacts','Redaction and retention rules'))
s.path('M 600 201 V 249')
s.node(850,251,310,106,'Reviewed artifact',('Signed or verified provenance','Independent approval evidence'))
s.path('M 755 303 H 848');s.text(790,287,'review', 'edge-label','middle');s.path('M 1005 251 V 203')
s.text(40,276,'Default-deny egress', 'node-title');s.text(40,310,'Explicit destinations and quotas', 'node-text');s.text(40,338,'Cleanup after every task', 'node-text')
rail(s,'Sandboxing limits consequences; it still needs access controls, escape tests and artifact validation.',463)
finish(s,'A03,R01,E04','Proposed deployment boundaries · zones represent authority, not a specific cloud product.',
       'Agent guidance emphasizes scoped tool access and separation of consequential actions. Industrial generation patterns use independent execution checks.',
       'Keep workers without production credentials, isolate test execution and allow only reviewed artifacts through existing release controls.',
       'An orchestration worker invokes an ephemeral sandbox. Controlled artifacts reach review, then protected release systems. Production authority never belongs to the generating worker.')

s = SVG('release-gate','Proposed release decision logic with mandatory floors and scenario-level evaluation',1200,500)
s.node(20,60,275,133,'Comparable runs',('Same held-out corpus','Configuration versions','Repeat runs as needed'))
s.node(385,60,340,133,'Mandatory floors',('Behavior + regression tests','Denial + privacy scenarios','Workflow latency / cost limits'), 'node node-teal')
s.node(830,25,350,106,'Hold and investigate',('Any mandatory floor fails','Retain the failing scenario'), 'node node-sand')
s.node(830,236,350,124,'Release review',('Inspect scenario-level regressions','Weigh gains + uncertainty','Approve a bounded rollout'))
s.path('M 295 127 H 383');s.path('M 725 100 H 777 V 78 H 828');s.text(738,64,'fail','edge-label')
s.path('M 725 159 H 777 V 298 H 828');s.text(739,212,'pass','edge-label')
rail(s,'A higher average score cannot override a failed critical scenario. Thresholds are agreed locally.',451)
finish(s,'A01,A02,T06','Proposed release logic · no universal score threshold is asserted.',
       'Lifecycle assurance considers system-specific risks and uncertainty. Evaluation tools support run and case-level comparisons.',
       'Use mandatory floors for critical behaviors, then inspect the distribution of changes before authorizing rollout.',
       'Comparable runs reach a mandatory-floor check. Failure holds the candidate. Passing candidates proceed to review of scenario-level regressions and remaining uncertainty.')

s = SVG('fallback-state','Proposed recovery state machine for an AI workflow with bounded recovery authority',1200,510)
s.node(20,60,260,120,'Normal operation',('Approved configuration','Active monitoring'), 'node node-teal',flow_key='normal')
s.node(360,60,280,120,'Containment',('Stop consequential actions','Preserve relevant evidence'), 'node node-sand',flow_key='containment')
s.node(760,60,420,120,'Fallback service',('Approved prior route or manual queue','Protect the underlying business process'),flow_key='fallback')
s.path('M 280 119 H 358');s.text(287,42,'trigger', 'edge-label')
s.path('M 640 119 H 758');s.text(666,102,'route', 'edge-label')
s.node(760,328,420,113,'Recovery review',('Diagnose, patch and rerun failure scenarios','Owner authorizes resumption'),flow_key='recovery')
s.path('M 970 180 V 326');s.text(984,249,'stable fallback', 'edge-label')
s.path('M 760 386 H 10 V 120 H 18','edge edge-dashed');s.text(227,369,'approved recovery', 'edge-label')
s.text(32,252,'Example triggers', 'lane-title');s.text(32,288,'Provider outage, policy breach,', 'label');s.text(32,320,'budget limit or severe regression', 'label')
s.text(35,490,'Reverting a model does not undo a completed side effect. Compensation and reconciliation need their own runbook.','small')
finish(s,'A01,A03,R01','Proposed recovery state machine · triggers and fallback capacity require local exercises.',
       'Lifecycle and agent guidance make recovery relevant to assurance. OSFI discusses tested AI failure scenarios and continuity measures.',
       'Separate containment, fallback and authorized resumption; explicitly handle actions that cannot be reversed by a model rollback.',
       'A trigger moves normal operation to containment and fallback. Recovery review verifies a fix before an owner authorizes resumption. Completed side effects require separate reconciliation.')

s = SVG('trace-pipeline','Proposed observability pipeline linking operational events to quality, operations and evaluation records',1200,510)
for x,title,lines in [(20,'Application events',('Task and run IDs','Timing and model usage')),(415,'Gateway decisions',('Requested action and resource','Allow / deny + policy version')),(810,'Reviewer feedback',('Accepted / corrected result','Failure reason and effort'))]:s.node(x,40,370,117,title,lines)
for x in (205,600,995):s.path(f'M {x} 157 V 211')
s.rect(20,214,1160,100,'lane lane-teal');s.text(40,247,'TELEMETRY COLLECTION BOUNDARY','lane-title');s.text(40,285,'Join by run ID · Minimize payloads · Apply access and retention rules · Preserve event integrity','label')
for x,title,lines in [(20,'Operations',('Service errors and tail latency','Cost or retry-limit alerts')),(415,'Platform monitoring',('Unexpected tool patterns','Denials and incident evidence')),(810,'Evaluation curation',('Reviewed failure cases','Regression dataset candidates'))]:
    s.node(x,374,370,108,title,lines);s.path(f'M {x+185} 314 V 372')
finish(s,'A01,T03,A03','Proposed event architecture · traces and derived evidence need their own data controls.',
       'Evaluation workflows use operational feedback, while agent risk guidance calls attention to tool and action behavior.',
       'Join application events, gateway decisions and reviewer corrections without broadly copying sensitive raw prompts into monitoring systems.',
       'Three event streams enter a controlled telemetry boundary. The joined records support operations, platform monitoring and reviewed regression-case curation.')

DATA.write_text(json.dumps(research, ensure_ascii=False, indent=2) + '\n')
print(f'Regenerated {len(research)} research diagrams and their source annotations.')

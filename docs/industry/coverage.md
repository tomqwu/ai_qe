---
title: Research coverage and method
parent: Industry research
nav_order: 8
permalink: /docs/industry/coverage/
---
# Coverage, evidence strength and open questions

This review asks: where can AI improve quality work; how must AI itself be evaluated; what changes in architecture and ownership; and what evidence would justify the next decision? It is a curated public-source review through **6 September 2026**, not an exhaustive market study. The source register preserves original dates, access limits and caveats.

## Coverage matrix

“Supported” means relevant evidence exists in this review, not that effectiveness transfers to a bank. “Weak” means the available material does not answer the outcome question. These are evidence grades, not product scores.

| Quality workflow | Coverage | Evidence available | What remains to establish locally |
|---|---|---|---|
| Test design / generation | Supported, narrow industrial evidence | Meta TestGen-LLM and mutation-guided generation (E04/E05); Tosca capability documentation (T01) | Domain oracle validity, useful-test yield, review and maintenance effort |
| Test data / environments | Weak outcome evidence | Data-permission and corpus controls from A01/A03; no comparable data-generation benchmark retained | Privacy leakage, constraint validity, representativeness and environment fidelity |
| Execution / regression | Supported architecture; weak causal economics | Visual baseline capability (T02), sandbox and independent-check designs | Missed changes, full regression cost and reproducible execution |
| Maintenance / flaky tests | Supported in a narrow deployment | FlakyGuard (E07), with separate reproducibility and fix-acceptance denominators | Semantic preservation across languages and frameworks |
| Failure triage | Supported, setting-specific | AutoDiagnose (E06); labeled accuracy and deployment volume are different cohorts | Accuracy, unsupported diagnoses, reviewer effort and resolution outcomes |
| AppSec triage / remediation | Mixed: vendor observation and research benchmark | Autofix workflow report (E08); ZeroFalse SAST adjudication (E09) | Recall on local findings, verified fix quality and audit of dismissals |
| Nonfunctional quality | Weak in this review | Lifecycle guidance covers reliability and monitoring; no comparative performance/accessibility improvement evidence retained | Tail latency, load realism, resilience and accessibility testing under representative conditions |
| QE for AI / agent evaluation | Supported methods and product capabilities | NIST/OWASP guidance (A01/A03); evaluation tooling (T03/T05/T06) | Business-specific cases, judge calibration, denied actions and operational drift |

{% include industry/cite.html ids="E04,E05,E06,E07,E08,E09,A01,A03,T01,T02,T03,T05,T06" %}

## Selection and exclusion record

| Decision | Rationale / effect |
|---|---|
| Include original empirical papers, publisher reports, regulator text and product docs | Preserve study method and actual product scope; do not cite summaries as independent replication |
| Retain older TestGen and Autofix work | Methods and workflow patterns remain relevant; date and product/version limitations remain visible |
| Separate RCTs, observational studies, vendor studies, surveys, forecasts and guidance | These answer different questions and cannot be pooled into a common productivity percentage |
| Include Gartner public abstracts only | Licensed criteria and vendor assessments were not available; no proprietary ranking is reconstructed |
| Exclude unsupported market shares, revenue estimates and vendor “best” scores | No comparable validated dataset supports them |
| Mark data generation and nonfunctional outcomes weak | Avoid filling research gaps with feature marketing; these require a separate evidence search and local benchmark |
| Exclude social posts and secondary repetitions from quantitative claims | They do not provide a new denominator or causal design |

Searches followed the eight workflow categories above, then traced claims back to publisher originals. This was a purposive search rather than a preregistered systematic review: no complete screened-paper count or exhaustive exclusion log is claimed. The [document library]({{ '/docs/industry/library/' | relative_url }}) is the included-source register. Legacy [study notes]({{ '/docs/evidence/testing-appsec-studies/' | relative_url }}) retain additional historical context; use the library and canonical claim notes for the presentation narrative.

## Comparable evaluation, without unsupported vendor rankings

Compare approved candidates on the **same** contract, dataset split, task mix, runner budget and human review process. Record supported feature/version, evidence type, deployment boundary and actual export sample for each candidate. Then measure useful outputs, missed failures, review effort, latency, cost and recovery behavior. Product documentation establishes that a capability is described; it does not establish superiority.

| Deployment option | Integration/control evidence to request | Principal trade-off |
|---|---|---|
| Existing IDE / CI service | Identity and repository permissions, artifact export, audit events, supported frameworks | Quick workflow adoption; portability and policy controls may be constrained |
| Managed evaluation / AI platform | Region, retention, dataset ownership, private connectivity, model versions and cost records | Managed operations; dependence on provider interfaces and data boundaries |
| Institution-operated runner and adapters | Patch/support owner, sandbox isolation, short-lived credentials, evidence retention and recovery | Direct control; internal operational and maintenance cost |

These are deployment patterns, not claims that every named product supports every option. Ask each supplier for the applicable edition, contract and reference architecture. The [technology landscape]({{ '/docs/industry/landscape/' | relative_url }}) maps documented examples to the common requirements.

## AppSec: validate the disposition, including dismissals

{% include diagrams/figure.html name="appsec-loop" label="AppSec finding through remediation and dismissal audit" %}

GitHub reports a faster remediation workflow in its Autofix observation, while ZeroFalse examines structured SAST evidence across models. Neither establishes safe autonomous suppression of bank findings. Separate true-positive recall from agreement on false positives; audit a stratified sample of dismissed findings and reopen missed vulnerabilities. {% include industry/cite.html ids="E08,E09" %}

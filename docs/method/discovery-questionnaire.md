---
title: Discovery questionnaire
parent: Method
nav_order: 1
description: Design rules, lessons from reviewing a 29-question executive questionnaire, and the role-routed core questionnaire with the fillable PDF.
---

# Discovery questionnaire
{: .no_toc }

<details open markdown="block">
  <summary>Contents</summary>
  {: .text-delta }
- TOC
{:toc}
</details>

[Download the fillable PDF (v2)](../../../assets/pdf/ai-qe-appsec-discovery-questionnaire-v2.pdf){: .btn .btn-primary } [Generator script](https://github.com/tomqwu/ai_qe/blob/main/tools/questionnaire_form.py){: .btn }

## Design rules

One form, role-routed at the first question; each respondent sees 10-15 questions and finishes in about 15 minutes. Every range question includes "Don't know" and "Not applicable" so that a guess is not recorded as data. Ranges are mutually exclusive ("1-5 / 6-20 / 21-50 / more than 50", never "10-25 / 25-50") and have no gaps. Priority questions (what success means, the autonomy ceiling, the go/no-go threshold) are single-select; inventory questions are multi-select without a cap; everything else is "select up to three". The activity taxonomy in the effort question matches the activity categories in the savings formula so that answers feed the model directly. The form states at the top that approximate ranges suffice and that no confidential data, rate cards or financial commitments are requested.

## Lessons from reviewing a 29-question executive form

A well-built 29-question form with 186 checkbox options across 19 multi-select questions, five dropdowns, two free-text tables and three open questions takes a knowledgeable respondent 20-30 minutes, not 15, because every option must be read before a selection limit can be applied. No single respondent can answer all six sections: an executive cannot answer flaky-test or CI/CD questions, a QE director cannot answer contractor-renewal or Finance-recognition questions, and an AppSec lead has no view of regression duration.

The recurring defects were: multi-select on the questions that define success (the "which outcome matters most" question with a "balanced combination" escape option produced no signal); "select all that apply" on an autonomy ladder, which loses the ceiling; a controls question where every option is mandatory in a bank, so selecting six of eleven carries no information; overlapping effort thresholds (10%, 20% and 30% as separate checkboxes); two near-duplicate use-case questions; range gaps in the regression-duration dropdown; and a denominator left open on the external-capacity question (headcount or spend). The largest omission was the financial-capture question set: budget ownership, variable share of spend, renewal windows, what happens to released capacity, and what Finance will recognize as a saving. Without those, the same 4% capacity result can be booked as a hard saving, as cost avoidance, or as nothing.

## Role-routed core questionnaire (v2)

Routing: executive sponsor, Finance and procurement answer Sections 1, 5B and 6; engineering, delivery and QE leaders answer Sections 2, 3, 4 and 6; application-security leaders answer Section 4 (AI platform, tools, capabilities in use), 5A and 6.

### Section 1. Executive objectives and spending concerns (sponsor route)

| # | Question | Type | Options |
|---|---|---|---|
| 1 | Primary objectives for exploring AI in quality engineering | Up to 3 | Reduce manual testing effort; Shorten regression and release cycles; Improve automation coverage and maintainability; Reduce escaped production defects; Improve application-security remediation; Improve audit and release evidence; Increase delivery capacity without increasing team size; Improve developer productivity |
| 2 | If a pilot proved one thing, which ONE outcome would justify continuing? | Single | Hard-dollar cost reduction; Cost avoidance (deferred hiring or renewals); Additional delivery capacity; Faster time to market; Improved software quality; Reduced technology or cyber risk; Improved regulatory and audit evidence; Not sure yet |
| 3 | Which outcomes must NOT deteriorate for a pilot to count as a success? | Multi | Escaped defects or production incidents; Release stability or change-failure rate; Security posture and remediation SLAs; Privacy and sensitive-data handling; Audit and release evidence; Engineer adoption and morale |
| 4 | Greatest concerns with current or previous AI initiatives | Up to 3 | Unclear or unproven business value; Excessive consulting or implementation cost; High licensing, token or model-consumption cost; Too many overlapping tools; Low adoption or weak workflow fit; Security, privacy or data-residency risk; Difficulty moving beyond pilots; Weak governance, controls or accountability; Productivity gains that do not become budget savings; Quality or security regressions from AI-generated artifacts; Regulatory or audit scrutiny; Previous AI pilots that did not deliver |

### Section 2. Delivery scope and QA operating model (engineering route)

| # | Question | Type | Options |
|---|---|---|---|
| 5 | Delivery teams or applications in potential scope | Single range + optional text | 1-5; 6-20; 21-50; More than 50; Scope not yet defined |
| 6 | Share of in-scope applications that are modern cloud or API systems with automated pipelines | Single range | Under 20%; 20-40%; Over 40% to 60%; Over 60% to 80%; Over 80%; Unknown |
| 7 | Typical squad composition by role | Text table | Developers; Manual QA analysts; Automation engineers / SDETs / QEs; BAs and product owners; AppSec resources |
| 8 | Share of QA headcount that is external, offshore or managed service | Single range | Under 10%; 10-25%; Over 25% to 50%; Over 50% to 75%; Over 75%; Unknown |
| 9 | Operating-model descriptions | Multi | Centralized; Embedded; Managed service; Hybrid; Dedicated automation/SDET capability; Business-led UAT; Varies by business unit; Being redesigned |
| 10 | Where QA spends the most human effort | Top 3 | Requirements review and acceptance criteria; Test planning and test-case creation; Building automated tests; Maintaining or repairing automated tests; Preparing test data; Environments; Manual functional execution; Regression execution; Failed-test triage and root cause; Defect creation, routing, retest and closure; UAT coordination; Quality reporting, traceability and release evidence |

### Section 3. Testing maturity and workflow (engineering route)

| # | Question | Type | Options |
|---|---|---|---|
| 11 | Share of regression test cases that execute automatically without human intervention | Single range | Under 20%; 20-40%; Over 40% to 60%; Over 60% to 80%; Over 80%; Varies; Unknown |
| 12 | Test types consistently automated in CI/CD | Multi | Unit; Component; API; Contract; Integration; UI/end-to-end; Regression; Performance; Accessibility; Security; Few or none; Varies |
| 13 | Typical elapsed regression duration for a major release (calendar days) | Single range | Up to 1 calendar day; Over 1 to 3 calendar days; Over 3 to 5 calendar days; Over 5 to 10 calendar days; Over 10 to 14 calendar days; More than 14 calendar days; Varies; Unknown |
| 14 | Active human hours per full regression cycle | Single range | Under 8; 8-40; Over 40 to 120; Over 120 to 400; Over 400; Unknown |
| 15 | Issues that most frequently delay testing or releases | Up to 3 | Requirements; Unit/component testing gaps; Manual test-case creation; Manual regression; Flaky automation; Test data; Environments; Downstream dependencies; Legacy or mainframe integration; Defect triage and ownership; Security findings; UAT, evidence or approvals |
| 16 | Mandatory quality and security release gates | Multi | Unit pass rate or coverage; API/integration/regression pass rate; Defect thresholds; SAST; SCA/CVE; DAST or penetration testing; Performance or resilience; Accessibility; UAT or business approval; Production-readiness or change approval; Traceability or control evidence |

### Section 4. Metrics, toolchain and AI readiness (engineering and AppSec routes)

| # | Question | Type | Options |
|---|---|---|---|
| 17 | For each baseline measure: tracked and trusted, tracked but unreliable, or not tracked | Grid, one per row | QA effort hours by activity; Regression duration and volume; Automation coverage and maintenance effort; Flaky or rerun rate; Defect volume, severity, reopen and escaped; Change-failure, rollback or incident rate; Mean time to triage and remediate; Release frequency and lead time; QA labour, contractor, managed-service or tool spend; Security-finding backlog and SLA |
| 18 | Approved enterprise AI platform and approved coding or testing assistants | Single + text | Azure OpenAI; AWS Bedrock; Google Vertex AI; Internal or private model platform; More than one; None approved yet; Unknown |
| 19 | Primary tools by capability (optional) | Text table | Requirements; Source control and CI/CD; Test management and automation; Observability; SAST/SCA/DAST |
| 20 | AI-assisted QA or AppSec capabilities in use or being evaluated | Dual checkbox per row | Requirements or scenario generation; Unit, API or UI test generation; Automation maintenance or self-healing; Regression selection; Synthetic test data; Failed-test triage; Defect creation or routing; Release-quality summaries; Vulnerability triage or fixes; None or informal only |

### Section 5A. Application security and AI controls (AppSec route)

| # | Question | Type | Options |
|---|---|---|---|
| 21 | Most valuable AI-assisted AppSec use cases | Up to 3 | Contextual finding prioritization; False-positive, reachability or exploitability analysis; Developer-friendly explanations; Remediation recommendations; Remediation pull requests for human review; Security-test generation; Threat modelling; Fix validation and closure evidence |
| 22 | Highest level of AI action acceptable in an initial pilot | Single (ladder) | Recommendations only; Generate artifacts for human review; Execute tests in non-production; Create defects or work items; Create remediation pull requests with human approval; Validate fixes and trigger retesting; No AI action until policy exists |
| 23 | AI controls NOT yet in place that would need addressing before a pilot | Multi | Source-code and IP confidentiality; Customer-data privacy; Data residency and retention; Approved-model and vendor enforcement; Role-based access and segregation of duties for AI identities; Audit logging of prompts, outputs and approvals; Human approval for production-impacting actions; Explainability; Model, prompt and artifact versioning; Cost controls; Vendor portability and safe disable; Model inventory and risk rating |

### Section 5B. Economics and financial capture (sponsor route)

| # | Question | Type | Options |
|---|---|---|---|
| 24 | Spending or capacity that could realistically be reduced, avoided or redeployed within 12 months | Multi | Contractor renewals due within 12 months; Managed-service scope or volumes; Planned QA or security hiring; Overtime or surge; Tool licences; Test infrastructure or execution cost; Rework and incident effort; Capacity redeployed to delivery; No capture mechanism identified; Not my decision |
| 25 | Annual addressable QA and testing spend in scope | Single range | Under $5M; $5-15M; Over $15M to $40M; Over $40M to $100M; Over $100M; Prefer not to say; Unknown |
| 26 | Share of that spend that is variable (contractors, offshore, managed services) | Single range | Under 20%; 20-40%; Over 40% to 60%; Over 60%; Unknown |
| 27 | If QA capacity were released, what would most likely happen to it? | Single | Absorbed by backlog and demand growth; Redeployed to other work; Reduced through contractor or service changes; Not decided; Unknown |
| 28 | Minimum evidence Finance would accept to recognize a saving | Single | Measured reduction in contractor or service invoices; Approved reduction in a budget line; Avoided hiring or renewal documented against plan; Measured effort reduction alone; Not defined yet |

### Section 6. Pilot direction and executive input (all routes)

| # | Question | Type | Options |
|---|---|---|---|
| 29 | Application types suitable for an initial pilot | Multi | Modern API or microservices; Internal web; Customer-facing web; Mobile; Legacy or mainframe-integrated; Data or analytics; Packaged platform; More than one for comparison; Not yet selected |
| 30 | Use cases suitable for a limited pilot | Up to 3 | Requirement analysis and scenario generation; Executable API or component-test generation; UI automation generation or maintenance; Change-impact analysis and regression selection; Failed-test triage and root cause; Flaky-test detection and repair; Synthetic test data; SAST/SCA triage and prioritization; Secure-code remediation recommendations or PRs; Release evidence and readiness summaries |
| 31 | Minimum net reduction in targeted human effort that would justify a second phase | Single | At least 10%; At least 20%; At least 30%; Effort alone is not sufficient; Not sure |
| 32 | Other outcomes that would justify further investment | Up to 2 | Regression duration; Failure-triage time; Automation-maintenance effort; No deterioration in escaped defects or change-failure rate; Vulnerability-remediation time; Demonstrated contractor reduction or hiring avoidance; Credible payback within 12-18 months |
| 33 | Conditions that should stop or prevent expansion | Multi | Insufficient measurable savings; High implementation cost; High ongoing licence or model cost; Poor accuracy or excessive rework; Security, privacy, residency or audit concerns; Cannot integrate with toolchain; Quality or stability deterioration; Low adoption; No credible financial-capture mechanism |
| 34-36 | Open text (optional, up to 1,000 characters each): most expensive or frustrating workflow; the question the executive most wants answered; a representative application, team or release and its delivery lead | Text | |

## Timing check

Sponsor route: Q1-4, Q24-28, Q29-36, about 11-13 minutes. Engineering route: Q5-20, Q29-36, about 15-18 minutes (drop Q9 and Q19 to the data request if it tests long). AppSec route: Q18-23, Q29-36, about 10-12 minutes.

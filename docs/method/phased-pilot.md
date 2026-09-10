---
title: Phased pilot design
parent: Method
nav_order: 3
description: A conservative five-phase engagement model with cost guardrails and go/no-go gates, recommended use cases, measurement design, quality and security floors, and a benefits-realization mechanism.
---

# Phased pilot design
{: .no_toc }

<details open markdown="block">
  <summary>Contents</summary>
  {: .text-delta }
- TOC
{:toc}
</details>

## Phase plan

Effort figures are ranges of person-days for the advisory team and for the bank's team; they are deliberately not converted to dollars. Each phase ends with a written go/no-go memo signed by the sponsor.

| Phase | Objective | Duration | Effort (person-days) | Tangible deliverables | Cost guardrail and go/no-go gate |
|---|---|---|---|---|---|
| 0. Sponsor alignment and guardrails | Confirm the business problem, addressable cost base, scope, approved AI platform, cost ceiling and decision authority; select the primary outcome and agree its measure, evidence, floor and stop criteria; agree Finance recognition for any cash claim | 2 weeks | Advisory 8-12; bank 4-6 | Questionnaire results summary; one-page sponsor charter; outcome charter with owner, baseline and acceptance criteria; Finance capture register when cash is claimed; control boundary statement; application shortlist | Fixed-fee or capped. Go if a sponsor, funded ceiling, approved value rationale and outcome criteria are recorded, one or two applications are nominated and approved AI access is confirmed. Missing approved access or funding holds the pilot; missing cash capture prevents a cash claim, not an evidenced quality or capacity case |
| 1. Current-state baseline | Map people, process, tooling, test strategy, gates, workflow data and economics for one or two representative applications; separate conventional engineering gaps from AI-suitable work; select one or two QA use cases | 4-6 weeks | Advisory 30-45; bank 15-25 (including a three-week time capture at about ten minutes per person per day) | Baseline report (activity time split, regression profile, pipeline and defect data, gate inventory); engineering-gap list (not AI); use-case selection memo with measurement design; preliminary waterfall with assumptions; control mapping; pilot plan and budget | Capped. Go if baseline data can measure net effort, the chosen workflow has a measurable baseline for the agreed primary outcome, and no control gap blocks. No-go if the primary gaps are conventional (environments, test data, flaky suites) and should be fixed first, or baseline data cannot be obtained |
| 2. Capped low-risk pilot | Run one or two QA use cases on existing approved platforms; measure net human effort, elapsed time, quality, acceptance, rework, AI operating cost and control performance; humans approve all code changes and production-impacting actions | 8-10 weeks (two to three sprints after a two-week setup) | Advisory 60-90; bank 40-60 across squads | Working integrations on approved platforms; measurement dashboard; weekly control log (identities, approvals, prompt and model versions, token spend); pilot report; updated waterfall; go/no-go recommendation | Capped with a monthly inference ceiling per squad. Use the ordered decision table below: hold breaches first, distinguish insufficient evidence, then go, extend/redesign or stop. Finance must validate any claimed cash saving; absence of capture leaves a capacity, quality, reliability or evidence case for sponsor review |
| 3. Limited production validation | Expand only successful capabilities to three to five additional teams or one additional technology stack; validate repeatability, adoption, support load, controls, model cost and benefits realization across at least two releases | 1-2 quarters | Advisory 30-50 per quarter; bank owns run cost | Playbook per capability; enablement material; support model; control evidence pack for second line and audit; outcome evidence and sponsor review; Finance-validated register entries for cash claims; scale decision memo | Capped per quarter. Go if the agreed outcome repeats on at least two of three new teams, floors hold across two releases and support and cost limits hold. Booked savings are required only when claiming realized cash savings |
| 4. Incremental scale | Scale capability by capability after validated value against the chosen outcome; consider shared integrations, broader tooling, AI control-plane functions and limited agentic execution only where justified | Ongoing | Sized per capability | Business case per capability using measured data; platform decision only if existing tools demonstrably cannot meet the requirement | Each capability has its own ceiling and stop rule; no enterprise platform purchase without Phase 3 evidence |

{% include pilot-timelines.html %}

## Applications and use cases

Recommended scope is one modern cloud or API-based application with an existing automated pipeline and a regression suite of meaningful size, plus optionally one mainframe-integrated or packaged application, so the sponsor sees both the best case and the realistic case. Do not start with a mobile application (tooling variance) or a data platform (test semantics differ).

**Default QA use case 1: failed-test triage and root-cause classification.** High-volume, measurable (time from failure to classified cause, classification accuracy versus human judgement, defect-preparation time), non-production-impacting, and CI remains the system of record. The Google ICSE 2026 deployment gives a reference point for accuracy expectations.

**Default QA use case 2: executable API or component test generation from specifications and existing tests.** Measurable (acceptance rate, coverage delta, time to first passing test, maintenance effort over subsequent sprints); Meta's results support staged validation gates; they do not predict bank acceptance. Report candidate-level acceptance and class-level yield separately against the bank baseline. Requires an API specification or existing scaffolds, which is why the modern application is the primary target.

**Alternates.** Automation maintenance and flaky-test remediation where quarantine rates are high {% include flakyguard-claim.html %} Change-impact analysis and regression selection only where requirements-to-test traceability already exists; without it the use case becomes a data project. Requirement and test-scenario generation is popular but its net effort is hard to measure because the baseline activity is diffuse; keep it for a later phase.

## Adoption prerequisites

Before agreeing pilot dates or benefits, complete the [workflow-specific dependency assessment]({{ '/platform-readiness/' | relative_url }}). Record the application boundary, selected workflow, evidence reference, owner, remediation and review date. Infrastructure, delivery pipelines, test-data reset, dependency virtualization or real-integration access, testability, framework reliability and observability must support the chosen execution path. Also establish approved AI access, reviewer capacity, offshore handoffs, platform support and a funded baseline.

A missing prerequisite cannot be offset by a high score elsewhere. Use the register to scope foundation work or a narrower assisted workflow. Repeatable capability is required in the target application; expansion additionally requires supported reuse by a second team. These are proposed adoption gates, separate from the quality and value gates below.

## Minimum data and access

Read access to the pilot squads' repositories, CI logs, test results and defect tracker; API specifications for the modern application; the approved enterprise AI platform with a dedicated pilot project, region and spending ceiling; a service identity per AI integration with least privilege and short-lived credentials; a logging destination for prompts, responses, model versions and approvals; non-production environments with de-identified or synthetic test data only. No production data, no production write access, no customer data in prompts.

## Baseline and pilot measurement design

Record the primary outcome and frozen acceptance criteria before observing pilot results. Do not choose a different success metric after seeing a favorable result. Baseline (three to four weeks): structured activity time capture by squad members against the twelve-activity taxonomy; extraction of two quarters of pipeline, defect and test-maintenance data; calibration of the classification accuracy of current human triage on a sample. Pilot: alternate sprints or alternate squads with and without the AI capability where the team structure allows; otherwise compare against the baseline with the same squad and record confounders (release calendar, staffing changes). Measures: active human hours per activity, elapsed time per activity, artifact acceptance rate, rework rate, classification accuracy, coverage delta, adoption (share of eligible tasks where the capability was used), inference cost, control events. Report net task saving using the formula with review, correction and control effort deducted, as a confidence range rather than a point estimate. Record task complexity and developer experience as covariates, because the evidence shows they change the sign of the effect.

## Quality, security and audit floors

Escaped defects by severity, change-failure rate, rollback count and production incidents on pilot applications must not exceed the two-quarter baseline range. No increase in overdue critical defects; quarantined flaky tests retain an owner, an expiry and replacement coverage. No personal or customer data in prompts, verified by logging review. Every AI-generated artifact traceable to a prompt version, model version, reviewer and approval record; deterministic systems remain the system of record; every AI integration has a unique non-human identity with least privilege and periodic recertification. A breach of any floor pauses the pilot pending sponsor review.

## Benefits-realization mechanism

The sponsor opens an outcome charter in Phase 0 for every route. If cash is claimed, Finance also opens a benefits register with one row per capture mechanism (each contractor or offshore renewal, each managed-service SOW, each planned requisition, each licence line), the owner of that budget line, the earliest date it could change, and the evidence Finance will accept. The QE leader owns capacity measurement; the budget-line owner owns conversion; Finance owns recognition; the sponsor reviews the register at each go/no-go gate. A capacity result with no capture row is reported as productivity, not cash saving. A quality, reliability, evidence or reuse case records its agreed metric, result, cost and sponsor decision; it does not need a fictional cash conversion. Advisory fees for later phases may be partly linked to register entries signed by Finance, which aligns incentives with capture rather than with activity.

## Risks to the engagement

Baseline data may not exist or may be untrusted; without squad-manager support for the time capture, the pilot produces elapsed-time and artifact counts only. Adoption may be low; consultancy and analyst material points to change management, not tooling, as the binding constraint. Quality may degrade in ways that appear only after several releases; floors must be measured for at least two releases before scale. A managed-service provider may claim the same AI gains for itself; capture terms must be negotiated. The approved AI platform may restrict model choice, region or data classification; confirm in Phase 0. A supervisory review may touch the pilot; the control mapping and evidence pack should be ready from Phase 2.

## Select the outcome before the pilot

[Download the blank outcome charter]({{ '/assets/examples/pilot-charter.json' | relative_url }}). Record the sponsor, value rationale, funded cost ceiling, primary outcome and acceptance criteria before execution. The template is a local worksheet; its fields do not verify approval.

| Primary outcome | Required decision evidence | Cash treatment |
| --- | --- | --- |
| Capacity / effort | Net active-effort interval, including review and rework; use the economic thresholds below | Released capacity is not automatically a cash saving |
| Cash saving | Economic-route evidence plus a Finance-validated positive net saving and register reference | Include realized capture and all agreed costs |
| Quality / reliability | Approved metric, denominator, target and direction; complete matched exposure and uncertainty where applicable | No cash conversion required |
| Evidence / supported reuse | Approved completeness or reuse metric, target, independent reviewer and evidence references | No cash conversion required |

Every route needs a funded ceiling, approved value rationale, sufficient exposure, adoption evidence and unchanged quality/authorization floors. Criteria and minimum exposure are authored for the chosen question, not universal statistical guarantees. A seeded-fault catalogue can demonstrate detection on that catalogue; it does not establish fewer production defects. One limited extension tests one stated redesign hypothesis.

**Example:** a quality-led pilot detects every fault in its approved fixed catalogue, meets its exposure and review requirements, holds floors and stays within budget. It can merit a limited next step with zero cash capture. An effort-led result below the economic threshold does not become successful merely by relabeling it as quality after the fact.

## Decision protocol and exact boundaries

{% include pilot-gates.html %}

**Economic route only:** the 10%/15% effort bands below are proposed management thresholds, not scientifically established effect sizes. Quality, reliability, evidence and reuse routes use the criteria frozen in their charter; they do not inherit an effort-saving requirement. A point estimate of exactly **10%** enters extend/redesign; exactly **15%** may enter limited go when all other conditions and uncertainty checks pass. Both cases below 10% triggers stop only with adequate evidence. A confidence interval crossing 10% or 15% is insufficient evidence for that boundary, even if its point estimate appears favorable. A control breach overrides every route. Missing or boundary-crossing evidence remains insufficient.

{% assign g = site.data.pilot_gates %}

Before the pilot, the measurement lead and control owner sign a protocol: {{ g.baseline_weeks }} weeks of baseline, an {{ g.pilot_weeks }}-week pilot window including setup, and at least {{ g.observation_releases }} observed releases before expansion. Track every eligible task, including abandoned and failed attempts. Adoption denominator is **all eligible tasks**; acceptance denominator is **all submitted candidate artifacts**, with class-level yields reported separately. Net saving compares total active human hours per completed, matched task, including preparation, failed attempts, review, correction and controls. Report complexity and developer-experience strata, assignment method and release exposure.

Require at least {{ g.min_tasks_per_arm }} comparable completed tasks per arm per use case as a reporting floor, not a power guarantee. The measurement lead must size the sample from baseline variance and the minimum effect of interest; use paired or cluster-aware bootstrap confidence intervals according to assignment. Fewer tasks, severe imbalance or intervals crossing decision boundaries are **insufficient evidence**. There is one extension of at most {{ g.max_extension_weeks }} weeks, with a changed hypothesis and a ceiling approved by the sponsor; otherwise hold expansion.

Quality floors use rates and exposure: escaped defects per release/change, failures per deployment, critical defects by severity and resolution age, unauthorized actions per attempted action, and rework hours per accepted artifact. Record counts and denominators alongside rates. Security or authorization breaches trigger immediate hold; other quality tolerances and interval methods must be agreed before assignment. Two releases without an incident cannot demonstrate the absence of rare failures. For example, zero events in 100 independent opportunities still has an approximate 95% upper event-rate bound of 3%; independence may not hold for releases. Continue monitoring after a limited go.

## Two distinct gateway responsibilities

A **model-provider routing gateway** selects models and allocates spend; a new shared router may be deferred until scale. An **action authorization boundary** enforces identity, resource scope, expiry, approval and deny behavior outside the model. It is required from the first pilot that invokes tools, and can use existing approved CI/IAM controls. An approved model endpoint alone does not authorize repository or production actions.

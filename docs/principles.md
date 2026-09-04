---
title: Principles and autonomy ladder
nav_order: 2
description: Ten operating principles for AI-assisted QE and AppSec in a regulated bank, plus the autonomy ladder used across the site.
---

# Principles and autonomy ladder
{: .no_toc }

<details open markdown="block">
  <summary>Contents</summary>
  {: .text-delta }
- TOC
{:toc}
</details>

## Ten operating principles

These principles govern every study, questionnaire, pilot and presentation on this site. They are written for an executive audience that is concerned about excessive technology and AI spending, overlapping tools, unclear return and pilots that never produce budget impact.

1. **Baseline before solutioning.** Do not propose an AI-QE platform before understanding the current SDLC maturity, testing strategy, QA operating model, workflows, tooling, quality gates, metrics and cost structure.
2. **Existing capabilities first.** Use the bank's approved enterprise AI, source-control, CI/CD, testing, observability and security platforms before recommending new products.
3. **Separate foundational automation from AI.** Stable CI/CD, API tests, service virtualization, test data, environments and deterministic release gates may need ordinary engineering improvement rather than AI.
4. **Separate AI assistance from autonomy.** Distinguish AI that recommends, generates artifacts, executes authorized tests, creates work items or pull requests, and autonomously changes or deploys software (see the ladder below).
5. **Keep early pilots low risk.** Humans approve code changes and production-impacting decisions. Deterministic systems remain the source of record for test results, approvals, code versions and release evidence.
6. **Measure net human effort.** Include prompt preparation, review, correction, rework, control activity, model cost, integration cost and support cost. Do not count only the gross time saved during content generation.
7. **Do not equate productivity with budget savings.** Released capacity becomes a hard-dollar saving only when the bank can reduce or avoid contractor capacity, managed-service scope, planned hiring, overtime, licences, infrastructure, rework or other budgeted costs.
8. **No predetermined headcount claim.** Do not assume a squad can move from a particular number of QA staff to one or two quality engineers until bank-specific evidence supports it.
9. **Protect quality and security floors.** Escaped defects, change-failure rate, release stability, security posture, privacy, audit evidence and regulatory controls must not deteriorate.
10. **Scale only after proof.** Every phase has a defined cost ceiling, success criteria and a go/no-go decision.

## The recommended executive framing

> Determine where AI can reduce repetitive QA effort, avoid future capacity growth, reduce external spend and improve delivery speed without weakening quality, security, auditability or release governance.

This wording replaces "replacing QA resources", which reads as a predetermined headcount exercise and invites resistance from the people whose data the study needs.

## The autonomy ladder

Used in questionnaires (as a single-select "highest acceptable level"), in pilot design (as the boundary statement) and in presentations (as the plain-language governance slide). Each level includes the levels above it.

| Level | AI action | System of record | Typical first-pilot position |
|---|---|---|---|
| 1 | Provides recommendations and explanations only | Unchanged | Always acceptable |
| 2 | Generates test cases, scripts, reports or evidence for human review | Human commits artifacts | Acceptable |
| 3 | Executes authorized tests in non-production environments | CI records results | Acceptable with scoped identity |
| 4 | Creates defects or work items automatically | Tracker records origin | Often acceptable with labelling |
| 5 | Creates remediation pull requests with human approval before merge | Source control records reviewer | Upper bound for most first pilots |
| 6 | Validates fixes and triggers targeted retesting | CI records trigger and result | Phase 3 or later |
| 7 | Changes or deploys software autonomously under policy | Requires policy, model-risk rating and audit design | Not in a first pilot |

## Four levels of "saving"

Every number on this site is labelled with one of these four levels. Mixing them is the most common error in AI business cases.

| Level | Definition | Who can confirm it |
|---|---|---|
| Task-level efficiency | Net time reduction for a specific activity, after review, correction and control effort | Pilot measurement |
| QA capacity released | Reduction in human QA hours across the full workflow, after adoption and eligibility | Pilot measurement plus baseline time capture |
| Hard-dollar saving | Budgeted cost that Finance can actually remove or avoid | Finance, against a named budget line |
| Total software-spend impact | A broader measure of engineering or delivery cost that must not be mislabelled as QA saving | Finance and the CIO office |

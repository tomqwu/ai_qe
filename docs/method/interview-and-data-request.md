---
title: Interview and data request
parent: Method
nav_order: 2
description: The 45-60 minute follow-up interview guide and the minimum data request that turn questionnaire ranges into a baseline.
---

# Interview and data request
{: .no_toc }

<details open markdown="block">
  <summary>Contents</summary>
  {: .text-delta }
- TOC
{:toc}
</details>

## Interview guide (45-60 minutes, engineering/QE leader and the delivery lead of the representative application)

**Delivery and maturity.** Application inventory by type; branching and pull-request practice; deployment frequency and lead time; environment provisioning; observability, API specifications and dependency maps; current use of coding assistants and any measured results.

**QA operating model.** Roles by category (manual, automation, SDET/QE, UAT, performance, accessibility, test data, environments); employee, contractor, offshore and managed-service split by headcount and by cost; how work is assigned between developers and QA; where time goes across the activity taxonomy (ask for a rough percentage split, accept "don't know").

**Testing strategy and gates.** Pyramid coverage by layer; automation share by layer and where it executes; regression volume, duration, frequency and active effort; flaky, quarantined, duplicate and obsolete tests; requirements-to-test-to-defect traceability; test-data provisioning and privacy controls in non-production; each mandatory gate with its threshold, exception frequency and approver.

**Economics and capture.** QA labour and external spend; tooling, environment and execution cost; contractor and managed-service renewal dates and flexibility; planned hiring; who owns each budget line; Finance's recognition rule; demand backlog.

**Quality baselines.** Escaped defects by severity, reopen rate, change-failure rate, rollbacks and production incidents; flaky-test frequency, quarantine age, failure-triage accuracy and test-maintenance effort.

**Controls and readiness.** Approved AI platform, model region and data-classification limits; identity model for service accounts and non-human identities; audit-logging expectations from second line; model-inventory process; change-management approval flow.

## Minimum data request (a delegate completes; ranges acceptable)

| Item | Purpose | Minimum acceptable form |
|---|---|---|
| Toolchain inventory (requirements, source control, CI/CD, test management, automation frameworks, observability, test data and environments, AI platforms) | Confirms existing-capabilities-first | List with product names and whether integrated in CI/CD |
| Activity time split for the representative squad | Feeds the capacity formula | Percentage split across the twelve-activity taxonomy, or a three-week time capture |
| Regression suite profile | Sizes triage and maintenance use cases | Test count, automated share, average run time, failure rate, flaky or quarantined count |
| Pipeline data for the last two quarters | Team-level quality baseline | Build and deployment counts, failure rate, lead time, rollbacks |
| Defect data for the last two quarters | Quality floor | Counts by severity, environment found, reopen rate, escaped to production |
| Test-maintenance data for the last two quarters | Automation reliability baseline | Flaky tests, quarantine age, repair acceptance, repeat failures and owner coverage |
| QA cost structure | Savings waterfall | Employee, contractor, offshore, managed-service, tooling and environment cost as ranges or percentages; renewal windows |
| Gate definitions | Control design | Each mandatory gate, threshold, approver, exception count |
| AI governance artefacts | Control mapping | Approved AI-use policy, model-inventory template, third-party AI vendor list, audit-logging standard |

---
title: Fintech implementation notes
nav_exclude: true
permalink: /case-studies/fintech/implementation/
description: Assumptions, integration backlog, framework examples and a measurement method for the fictional Harbor QA case.
has_toc: true
---

# Harbor: implementation and assumptions

[Open the interactive case]({{ '/case-studies/fintech/' | relative_url }}) or the [technical briefing]({{ '/briefings/fintech-technical/' | relative_url }}).

**Fictional case, edition v1.10.0.** This is a proposed delivery design and a working browser teaching simulation. It is not a deployed fintech QA platform. All company details, effort inputs, payment rules and pilot targets below are authored assumptions. The sources document technology capabilities, not the case's results.

## QE modernization before wider execution

The [modernization guide]({{ "/qe-modernization/#harbor" | relative_url }}) develops the foundation backlog behind this case. Start with one payment journey: reviewed assertions, a reproducible environment, isolated data, a versioned provider substitute and durable evidence. Compare its behavior with the real provider and settlement path. Containerize suitable components; reserve supported environments for systems that cannot be made disposable.

Reviewed AI drafts can begin where their own prerequisites are satisfied. Wider execution depends on demonstrated test reliability, environment repeatability and supported ownership. The 480-hour setup allowance below does not price this modernization backlog.

## Assumption register

| Area | Assumption to validate in discovery |
|---|---|
| Organization | 75 offshore QA staff across five application squads. Primary roles: 45 manual/domain testers, 15 automation engineers, eight data/environment engineers and seven leads/coordinators. These groups do not overlap. |
| Pilot team | Eight existing QA staff: one lead, four domain testers, two automation engineers and one data/environment engineer. Product, development and platform support are additional contributors whose effort must be recorded. |
| Application portfolio | Payments, web, mobile, onboarding and settlement. Java/Spring Boot payment services, React web, PostgreSQL journal and an existing Azure test environment. Legacy settlement shares a nightly batch environment. |
| Current delivery | Fortnightly releases. A bounded release test pack uses 300 person-hours across 10 business days; the pilot team also performs other work. This is not 10 days of full-time effort by all eight people. |
| Current automation | Some usable Java API tests, an uneven Selenium UI suite and existing Appium mobile coverage. Framework and language versions must be checked against the actual repositories. |
| Payment contract | PAY-142 transfers CAD 100.00 between synthetic accounts starting at CAD 1,000.00 and CAD 0.00. No fees, FX, overdraft, settlement timing or unrelated account activity is modeled. |
| Expected behavior | The same request key and payload return the original transfer identity. Conflicting payloads are rejected. Retries and duplicate callbacks create one journal with two balancing entries. |
| Evidence status | Hours, maturity profiles, staffing and simulated outcomes are assumptions. No client baseline or actual pilot result has been collected. |

## Client adoption assumption register

The [platform readiness hub]({{ '/platform-readiness/?preset=harbor' | relative_url }}) makes twelve prerequisites explicit. Harbor has not been assessed; the current-state statements below are hypotheses for discovery. For each one, record the evidence reference, accountable person, remediation and review date. A modern API does not establish readiness for mobile, legacy or batch applications.

| Dependency | Assumed Harbor starting point | Accountable role |
|---|---|---|
{% for dependency in site.data.adoption.dependencies %}| [{{ dependency.title }}]({{ '/platform-readiness/#dependency-' | append: dependency.id | relative_url }}) | {{ dependency.harbor }} | {{ dependency.owner }} |
{% endfor %}

No required capability can be compensated for by a higher maturity score elsewhere. The adoption worksheet applies requirements separately to each workflow; second-team rollout additionally requires supported platform operation, evidence reuse and trained handoffs. The illustrative effort profiles below are not adoption approval.

## Stack

The design extends tools that the assumed team already knows. A discovery assessment can substitute the customer's equivalents without changing the workflow responsibilities.

| Capability | Example technology | Integration to implement |
|---|---|---|
| Requirements and cases | Azure Boards and Azure Test Plans | Read approved story/test revisions, link candidates back to their source, record unresolved questions and reviewer decisions. An AI connector is proposed work. |
| Shared QA context | Repository templates, a versioned scenario catalog and a small context assembly service | Filter by application and release, attach source IDs and revision hashes, remove obsolete examples and record the model/prompt configuration used. Start with selected documents; a vector database is optional. |
| AI assistance | Approved coding assistant or model endpoint | Stage-specific prompts, structured candidate artifacts, bounded retries and reviewer feedback. The model does not set the authoritative expected financial behavior. |
| API tests | REST Assured and JUnit in the Java repository | Reuse authentication fixtures, request helpers and assertions. Add retry, concurrency and journal outcome checks around the existing service. |
| Browser tests | Playwright for the new React payment journey | Reuse a seed fixture and approved plan, review generated tests and store traces from failed CI runs. Retain existing Selenium coverage with named maintainers. |
| Mobile tests | Existing Appium suite and device pool | Keep device scheduling, app build identity, account reset and evidence collection explicit. API-level coverage does not replace mobile interaction testing. |
| Data | PostgreSQL synthetic fixtures; Testcontainers for service tests | Assign unique accounts per run, seed exact balances and validate relationships. Container tests require a supported runtime and do not provision the whole estate. |
| Provider dependency | WireMock test stub plus separate provider sandbox tests | Version timeout, delayed-callback and duplicate-event scenarios. Check the stub contract against integration behavior. |
| Execution | Existing Azure Pipelines and test runners | Pin build/test/fixture/stub revisions, run preflight checks, publish original runner evidence and retain the mandatory payment suite. |
| Reporting | Test Plans and an artifact store | Link requirement, candidate, review, manifest, result and defect disposition. AI drafts a summary with evidence links; the release owner decides. |

Primary documentation: [Azure Test Plans](https://learn.microsoft.com/en-us/azure/devops/test/overview?view=azure-devops), [REST Assured](https://rest-assured.io/), [Playwright Test Agents](https://playwright.dev/docs/test-agents), [Trace Viewer](https://playwright.dev/docs/trace-viewer), [Appium](https://appium.io/docs/en/latest/), [Testcontainers](https://java.testcontainers.org/) and [WireMock](https://wiremock.org/docs/solutions/service-virtualization/). Reviewed 7 September 2026. Product choices are examples, not procurement recommendations.

## A concrete generated-test review

The candidate should test the financial outcome independently of the success message. The following is **illustrative Java pseudocode**. `payments`, `provider` and `journal` are application-specific adapters to implement. It is not a runnable integration supplied by this site.

```java
// Fixture: payer=100000, recipient=0, amount=10000 CAD minor units.
provider.acceptThenTimeout("pay-142");
payments.submit("pay-142", 10000); // response may be unknown
Transfer retry = payments.submit("pay-142", 10000);

assertEquals(originalTransferId("pay-142"), retry.id());
assertEquals(1, journal.countForTransfer(retry.id()));
assertEquals(90000, accounts.balance(payer));
assertEquals(10000, accounts.balance(recipient));
assertEquals(0, journal.sumSignedEntries(retry.id()));
```

The product owner and domain QA define these expected outcomes before generation. The automation reviewer checks that the test fails against a deliberate duplicate-posting defect. Separately test concurrent same-key submissions, the same key with a changed amount, and repeated callbacks with the same event identity. The browser simulation simplifies these mechanisms to teach the outcome; it does not model database transactions, race timing or provider protocol guarantees.

For a real implementation, the developer must resolve request-key scope, retention, concurrent inserts, transactional posting, event identity and recovery after partial failure. The QA team needs fault-injection points and read-only observation of the journal in its test environment. A balanced journal alone is insufficient: duplicated balanced journals can still move money twice.

Playwright's documented healer may return a skipped test when it believes behavior is broken. In this proposal, an unexplained skip or weakened assertion cannot satisfy a required case. Such candidates return to review. [Playwright Test Agents](https://playwright.dev/docs/test-agents).

## Workflow artifacts and handoffs

{% for stage in site.data.fintech_case.workflow %}
### {{ forloop.index }}. {{ stage.title }}

**Input:** {{ stage.input }}.

**Assistance:** {{ stage.ai }}

**Output:** {{ stage.output }}. **Accountable reviewer:** {{ stage.owner }}.

**Acceptance check:** {{ stage.check }}

**Adoption prerequisites:** [Inspect the required foundations for {{ stage.title | downcase }}]({{ '/platform-readiness/' | relative_url }}?preset=harbor&workflow={{ stage.id }}).
{% endfor %}

A run manifest should identify the requirement revision, scenario ID, test commit, application build, fixture revision, dependency-stub revision, environment and runner result location. Candidate-generation records additionally retain prompt/model configuration and reviewer disposition. Record missing links as gaps; do not infer a passing run from an AI summary.

## Application and delivery maturity

Assess requirements, DevOps, cloud/environment readiness, application testability, automation and offshore delivery **for each application**. The case's three profiles are discussion aids, not a certified maturity score.

| Condition | First work to commission | Evidence before expanding |
|---|---|---|
| Shared environments, manual deployment and fragile scripts | Requirements clarification, reviewed scenario drafts, stable fixtures, a reproducible run and clear ownership | Another engineer can repeat the same test with the same result. |
| Usable API automation and partial CI, but shared data and noisy UI tests | The payments API pilot, one web journey, provider stubs and evidence integration | Full effort accounting and trustworthy required tests across comparable release packs. |
| Repeatable deployment, isolated data and maintained tests | Expand generation and triage, then evaluate selective regression in shadow mode | A second team reuses the pattern and selection retains important defect detection. |

Cloud hosting does not establish maturity by itself. Readiness depends on deployment reproducibility, reset speed, dependency control and observability. DORA's findings motivate attention to the surrounding delivery system; they do not supply this case's numerical assumptions. [DORA 2025 report](https://dora.dev/research/2025/dora-report/).

Offshore delivery adds practical dependencies: repository and environment access, coding skills, a shared review window, accountable next owners, training capacity and supplier incentives. Reuse requires time and ownership. Coaching and supporting-engineer effort belong in the economics.

## Measurement

The unit is **one comparable, bounded release test pack**, not a person, application portfolio or organization. Capture task-level active effort in mutually exclusive workflow stages. Use timestamps and reason codes separately for waits and elapsed release time. Do not add days of waiting to person-hours or claim that every saved task hour shortens the release's critical path.

{% assign case = site.data.fintech_case %}
| Stage | Baseline hours | Mixed-profile work | Mixed-profile review | Assisted total |
|---|---:|---:|---:|---:|
{% for stage in case.workflow %}{% assign n = forloop.index0 %}| {{ stage.title }} | {{ stage.baseline }} | {{ case.profiles[1].work[n] }} | {{ case.profiles[1].review[n] }} | {{ case.profiles[1].work[n] | plus: case.profiles[1].review[n] }} |
{% endfor %}| **Total** | **300** | **182** | **40** | **222** |

Assisted work excludes the review column. The baseline includes its ordinary review and rework. Record corrections and retests in the appropriate stage once. The target combines AI assistance with fixtures, automation and environment changes; it does not isolate AI's causal contribution.

The assumed mixed-profile calculation is:

1. 300 baseline hours − 222 assisted hours = **78 hours of gross capacity**.
2. Subtract **12 hours of recurring platform operation** per pack = **66 net hours**.
3. Redeploy an assumed **50%** to named other work = **33 usable hours**.
4. An assumed **480 person-hours of setup**, divided by 33, takes **15 comparable packs**, rounded up, to recover in capacity terms.

The twelve-dependency remediation backlog is not priced by the 480-hour setup assumption. Re-estimate infrastructure, provider virtualization, data, licenses and support effort for the actual client. Setup includes integration, initial fixtures, coaching and supporting product/development/platform effort. Avoid charging initial setup again in each assisted pack. Conversely, recurring operation must not disappear into the setup bucket. The low-maturity profile has 315 assisted hours plus 12 operating hours: **27 additional hours per pack**. The model retains that full cost even at a low capture percentage. At zero positive capacity or zero capture, there is no finite capacity payback.

Tool, cloud and vendor charges are excluded. Staff hours recovered are not automatically budget savings. Do not extrapolate the pack to all 75 people or annualize it until eligible volume, adoption, maintenance and redeployment are observed. A cash business case requires actual commercial costs and an agreed mechanism for realizing financial benefit.

## Pilot backlog and acceptance

| Phase | Deliverable | Acceptance evidence |
|---|---|---|
| Weeks 1–2: workflow assessment | Current release map, effort and wait baseline, application readiness, test intent and bounded pilot backlog | QA, product and platform leads agree on scope, the expected payment behavior and who supplies missing evidence. |
| Weeks 3–8: payment pilot | Context adapter, test matrix, synthetic fixtures, provider stub, reviewed framework changes and pipeline evidence | At least two comparable assisted packs, with matched conventional tasks as a reference. All required payment checks run; the duplicate-posting fault fails. |
| Weeks 9–12: reuse trial | Second-squad onboarding, maintained templates, operating ownership and rollout backlog | The second squad runs and maintains the pattern without its original authors. Net capacity remains positive and quality evidence remains trustworthy. |

The twelve weeks are a proposed planning sequence. Extend the measurement period if release volume, environment incidents or task differences make the evidence inconclusive. Pause expansion for an escaped money-movement defect, unreliable fixtures or a test that passes the deliberately broken variant. Small samples inform the next delivery decision with uncertainty; they do not establish an industry productivity rate.

This offers a concrete progression of work: an assessment with a usable baseline, a pilot with reviewable artifacts and measured outcomes, then a rollout tied to application readiness. It avoids a headcount-based savings promise and gives the senior director a specific delivery decision at each phase.

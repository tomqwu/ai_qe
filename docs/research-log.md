---
title: Research log
nav_order: 7
description: Dated entries recording what was verified, when, what changed, and what remains open. New research is logged here first.
---

# Research log

{: .no_toc }

Newest first. Each entry records the question, what was checked, the outcome, and what changed on the site. Add an entry before editing a topic page.


## 2026-09-08 · Manual QE baseline clarification

Source: user-provided scenario clarification. The banking starting point is a large manual QE workforce, few shared test environments, no backend service virtualization and limited vendor test environments that cap parallel execution. Preserve the existing 75-person staffing model and 45 manual/domain testers; do not invent vendor environment counts or observed improvements.

Updated the case narrative, before/after diagrams, workflow, readiness and modernization assumptions. Isolation and provider virtualization are proposed modernization work, with separate real-provider and settlement validation. Environment queue time and human effort remain separate measurements.

## 8 September 2026 — Architecture and quality outcomes beyond hours

**Question.** How does the banking target architecture change delivery capability, and what would demonstrate value beyond returned QA hours?

**Checked.** Reused the current PAY-142 scenario and modernization prerequisites. Reviewed [PIT mutation concepts](https://pitest.org/quickstart/basic_concepts/) and [Playwright retry classifications](https://playwright.dev/docs/test-retries) on 8 September 2026. They support fault-challenge and retry interpretation; the client scorecard, repeat protocol and acceptance targets are authored proposals.

**Design outcome.** Compare individual tools/shared environments with reviewed test commits, isolated execution, versioned provider models and retained evidence. Three primary measures cover critical fault detection, critical-scenario coverage and complete decision evidence. Supporting proof covers repeatability, integration fidelity and second-squad reuse. Denominators include missing/incomplete work as specified; clean controls, original failures and real-integration evidence prevent misleading success claims.

**Attribution and status.** Baseline and observed after results are not recorded. Compare existing work, modernized QE without AI and the same foundation with AI where feasible; otherwise report joint contribution. Seeded-fault detection does not establish fewer production incidents or customer losses. The case page and audience briefings link the architecture change to the proposed evidence, with source metadata in `_data/qe_outcomes.json`.

## 8 September 2026 — Banking engineering blueprint

**Question.** What must technical leads inspect beyond the executive strategic-vision story?

**Checked.** Reused the current PAY-142 scenario, modernization dependencies and source register. Rechecked [Microsoft PublishTestResults v2](https://learn.microsoft.com/en-us/azure/devops/pipelines/tasks/reference/publish-test-results-v2?view=azure-pipelines) for JUnit publication, failed tests, missing result files and publication failure settings. Cancellation can still prevent collection; `always()` is not an evidence-availability guarantee.

**Design outcome.** Banking technical slides now show separate authoring/execution planes, an authored API contract, the response-loss-after-commit sequence, concrete context and fixture manifests, ledger assertions, raw CI results, diagnosis routing, evidence records and correlation IDs. Code samples explicitly distinguish documented task syntax from proposed schemas and non-runnable pseudocode. The sequence does not infer journal success from a provider timeout. No new client outcomes or measured gains are claimed.

**Destinations.** The 28-slide banking technical briefing and PDF, its architecture-focused guided route and the presentation-room description. Executive content retains strategic vision. Financial-service evidence and original source dates remain unchanged.

## 8 September 2026 — Four layers of AI-assisted QE

**Question.** How can leadership distinguish individual test-writing assistance, AI within CI reports, bounded task agents and a shared platform without treating them as a fixed vendor maturity ladder?

**Checked.** GitHub's test-writing tutorial, Copilot cloud-agent overview and agent application card; Microsoft’s Publish Test Results v2 documentation. Reviewed on 8 September 2026. Canonical URLs and supported capability notes are recorded in `_data/ai_adoption.json`; no publisher originals were redistributed.

**Synthesis.** Use four capability layers: assist a person, connect a workflow, delegate a bounded task and scale a supported platform. Platform foundations begin at every layer and a platform can scale read-only assistance without adopting agents. Classify by delegated actions and integration, rather than product brand. The Azure result publisher supplies evidence; the AI diagnosis adapter and client agent paths are proposed integration work.

**Destinations.** `/ai-adoption/` provides a selectable PAY-142 walkthrough and evidence gates; fintech executive slide 17 and technical slide 28 explain progression and architecture. The case, navigation, modernization and readiness pages connect this roadmap to the existing dependencies. No observed client maturity, universal timeline or savings uplift is inferred from product documentation.

## 2026-09-08: Connected visual explanation (v1.12.0)

Reused the existing financial-services source register and Harbor assumptions to connect modernization, AI workflows, tool integration and daily QA artifacts. The dependency matrix derives workflow requirements from the readiness model. Diagnostic-only evidence review now has a distinct scope; execution and retest additionally require repeatable environments, controlled dependencies, fixtures and runners.

Added authored PAY-142 samples, a before/after operating model, offshore handoffs, an execution lifecycle with failure/cleanup paths and a concrete proposed tool architecture. None is a deployed client system or a measured outcome. Libra, Goldman Sachs and Fiserv visual summaries reuse their existing attributed findings and retain evidence limitations; broader modernization results are not presented as AI-attributed savings. Source-review dates and the existing research companion remain unchanged.

Guided audience routes preserve the original slide anchors and full-library order. Shared role styling distinguishes AI, human review, real software, virtual services, evidence and failure. The new views are native HTML/CSS so labels stay readable and offline editions retain the explanation.

## 2026-09-07: Explicit modernization dependencies (v1.11.1)

Clarified the fintech adoption proposal using the existing six QE modernization workstreams and readiness register. Rechecked DORA's [test automation](https://dora.dev/capabilities/test-automation/) and [test data management](https://dora.dev/capabilities/test-data-management/) guidance. The workflow mappings and readiness decisions are authored proposal rules; no additional client result or savings claim is introduced. Each trial brief now carries modernization prerequisites, a scoped assessment link and the requirement to fund unresolved execution dependencies.

## 2026-09-07: Financial-services evidence and client adoption (v1.11.0)

**Question.** Which public financial-services results justify a focused AI-assisted QE trial, and what practices make the client proposal credible?

**Evidence.** Seven cases and ten sources are recorded in the [fintech evidence library]({{ '/case-studies/fintech/evidence/#sources' | relative_url }}). Libra and Goldman Sachs provide named vendor accounts of direct AI testing. DBS reports ML change-risk outcomes and a separate unquantified JIRA Assist use case. Fiserv and Bank of Queensland report modernization results while describing AI or virtualization as pilot/future work. ANZ is a controlled coding experiment with self-reported time and excluded unsuccessful tasks. An anonymous TestingXperts case has unreconciled productivity definitions and is excluded from featured charts. KPMG provides context; METR and Diffblue documentation clarify measurement and test-validity limitations.

**Synthesis.** Public examples support scoped trials and stronger QE foundations, not a transferable bank-wide savings rate. Keep generation, reviewed acceptance, coverage, elapsed cycles, incidents and economic capture distinct. No pooled result, customer endorsement or independently audited AI-QE net benefit is asserted.

**Changed.** Added reported-outcome charts, a filterable case explorer, six adoption practices, a candidate-rejection architecture, comparison lanes and a three-workflow trial brief export. Eight new slides and refreshed PDFs carry the evidence and proposal into both audience pairs. Harbor remains fictional and its 12-week planning sequence is unchanged.

**Open evidence.** Client task mix, full effort, quality outcomes, source access, runtime and reviewer availability. Seek original denominators and reference calls before treating vendor cases as procurement evidence. Publisher PDFs were retained privately with retrieval hashes; only authored summaries and source links are published.

## 2026-09-07: QE modernization and AI enablement (v1.10.0)

**Question.** Which QE foundations enable wider AI execution, and where do service virtualization and containerization fit?

**Evidence checked.** Thirteen primary references from DORA, Docker, Testcontainers, WireMock, Pact, Kubernetes, Playwright and Appium. The [modernization source library]({{ '/qe-modernization/#evidence' | relative_url }}) records supported findings, limitations, access links and review dates. Product documentation establishes capabilities, not client benefits.

**Synthesis.** Reviewed assistance can begin while QE improves. Broader execution needs trustworthy tests, controlled state and dependencies, repeatable environments and supported ownership. Containers package runtime software, virtualization supplies selected dependency models, and contracts check interaction compatibility. Real integration and domain assertions remain necessary. Kubernetes is an optional environment choice.

**Changed.** Added a modernization hub, six workstreams, an animated proposed test architecture, application-surface examples and six slides across the audience decks. The Harbor sequence and capability progression are authored proposals with unverified client assumptions. No additional savings benchmark is claimed.

**Open evidence.** Client environment constraints, runtime and license access, current flake rates, test-data reset, dependency fidelity and platform support capacity still require discovery.

## 2026-09-06 — Deeper audience briefings (v1.2.0)

Expanded the EVP strategic-vision deck from 10 to 18 slides and the technical architecture deck from 11 to 26. Added 17 native diagrams with source findings, design implications and accessible descriptions. The new material covers portfolio choices, operating ownership, skills, investment, leadership measures, context and configuration boundaries, test oracles, mutation, diagnosis, repair, corpus design, agent enforcement, isolation, release, recovery and telemetry. New tables cover analyst signals, industrial cases, judge calibration and integration contracts.

Rechecked the primary Meta ACH report, Google diagnosis and FlakyGuard papers, LangSmith evaluation documentation, McKinsey’s survey and OSFI’s AI bulletin and E-23 page while developing these walkthroughs. The diagnosis accuracy sample remains separate from its deployment population. Proposed architectures and exercise scenarios are labeled as synthesis. No new bank results, savings rate or proprietary analyst model is asserted.

The source register remains the 30-source September research base; the original 13-page research PDF is a companion brief, not an export of the expanded decks. Chapter navigation and direct links expose the added material on the site.

## 2026-09-05 — Industry synthesis and source library

Added an independent AI × QE review covering AI-assisted testing and assurance of AI applications, with 30 source records, a dated [document library]({{ '/docs/industry/library/' | relative_url }}), public document links and original visual briefings. The review includes public Gartner material, McKinsey research, WQR, DORA, experimental and enterprise evidence, NIST, OWASP, OSFI and representative product documentation.

Public abstracts are distinguished from full documents. Surveys, forecasts, experiments, cases and product capabilities retain separate labels. New research covers the July 2026 OSFI AI bulletin and the linked OWASP LLM 2026 edition and ACS. E-23's May 2027 effective date remains explicit. Original publisher PDFs are gathered locally with provenance and hashes; the public site hosts only our synthesis and links to originals.

The [research overview]({{ '/docs/industry/' | relative_url }}) explains the method, scope and evidence gaps. Native diagrams represent proposed designs; generated illustrations are conceptual. No vendor ranking, bank deployment result or enterprise savings benchmark is implied.

## 2026-09-04: Review corrections and usability fixes

**Checked.** METR's February 2026 follow-up and OSFI's Integrity and Security implementation letter; consistency between benchmark records and executive summaries; zero-capture savings arithmetic; published PDF field limits and response ranges; desktop and mobile evidence readability.

**Corrections.** METR's follow-up has speedup point estimates, confidence intervals crossing zero and substantial selection bias. OSFI set 31 January 2025 and 31 July 2025 deadlines for new expectations and background checks respectively. Executive summaries now distinguish surveys, telemetry and randomized studies without claiming a universal effect size. Preliminary net impact includes estimated costs even when gross captured savings are zero.

**Usability and checks.** Evidence records show findings, supported claims and caveats together, with expandable methodology. The navigation title is shortened. Questionnaire response intervals are continuous and explicitly labelled; narrative answers allow 1,000 characters. Build, internal-link and PDF-field checks run before deployment and on pull requests. The remote theme is pinned to a commit.

**Sources.** [METR follow-up](https://metr.org/blog/2026-02-24-uplift-update/); [OSFI implementation letter](https://www.osfi-bsif.gc.ca/en/guidance/guidance-library/integrity-security-letter).

Earlier entries below record the initial review; this entry supersedes their statements about the METR follow-up, evidence synthesis and closed questionnaire ranges.

## 2026-09-04: Initial evidence base

**Question.** Are the planning ranges commonly used in AI-QE business cases (10-20% productivity, 20-35% targeted task, 5-10% capacity, 3-7% first-year hard-dollar, 8-15% mature) defensible?

**Checked.** METR 2025 RCT and 2026 follow-ups; DORA 2024, 2025 and the 2026 ROI framework; World Quality Report 2024-25 and 2025-26 press releases; GitHub/Microsoft studies (Peng 2023, Cui et al. 2024/2026, Accenture 2024, code-quality RCT 2024); Uplevel; Faros 2025 and 2026; Bain 2024 and 2025; McKinsey 2023 and 2026; Deloitte 2024 and 2025; Gartner public press releases 2024-2026; Atlassian 2025; Stack Overflow 2025; MIT NANDA 2025; BCG 2025 and 2026; Meta TestGen-LLM; Uber FlakyGuard; Google integration-test diagnosis (ICSE 2026); CATGen; Google AI patching; GitHub Copilot Autofix; Semgrep Assistant; ZeroFalse; "Sifting the Noise".

**Outcome.** Task-level gains exist in vendor and lab studies; the only independent RCT is negative; telemetry shows stability and defect-rate degradation; consultancies report 10-15% and say it is rarely monetized. No source supports a QA capacity figure or an audited hard-dollar saving. Restated ranges: pilot target 15-35% net effort on selected activities (stop below 10%); year-one capacity base 3-5%, upside 8-10%; year-one net hard-dollar base 0-2%; mature capacity 8-15%, mature hard-dollar 4-10%.

**Not verified.** World Quality Report cost-of-quality share; any Gartner AI-testing productivity figure; Snyk DeepCode AI Fix accuracy; full DORA 2026 ROI PDF; Stack Overflow 2026 survey; a Bain or Deloitte 2026 quantified testing gain.

**Pages created.** Productivity benchmarks; Testing studies; What the evidence supports; Savings model; Slide language.

## 2026-09-04: Canadian governance context

**Question.** Which supervisory instruments govern AI-assisted delivery and testing in a federally regulated bank, and what is their current status?

**Checked against primary sources.** OSFI B-13, B-10, E-21, E-23 (2027), Integrity and Security Guideline, incident reporting advisory; OSFI Technology Risk Bulletins on generative and agentic AI (July 2026) and frontier AI (April 2026); FIFAI II (March 2026); Annual Risk Outlook 2026-27; OSFI-FCAC AI risk report (2024); OPC generative-AI principles; Bill C-36; Quebec Law 25; "AI for All" strategy; FSB consultation on sound practices for AI (June 2026); US SR 26-2 and OCC 2026-13; EU AI omnibus and DORA.

**Outcome.** All eighteen instruments exist. Corrections applied during verification: E-21 milestones (critical-operations identification, mapping and tolerances by 1 Sep 2026; scenario testing by 1 Sep 2027); the EU omnibus is in force since 27 Jul 2026, not merely agreed; the frontier-AI bulletin frames supply-chain exposure as a risk, not a prescribed remediation control; the Annual Risk Outlook commits to targeted technology reviews and assessing AI implications rather than literally "assessing AI governance"; the OPC principles page was modified in May 2025 but no substantive revision is documented; the incident reporting advisory's current version dates from 13 Aug 2021; Bill C-36 offence fines reach the higher of $25 million or 5% of global revenue.

**Pages created.** Canadian banking context; Pilot control mapping.

## 2026-09-04: Questionnaire design review

**Question.** Can a 29-question, six-section executive questionnaire be completed in 15 minutes, and does it collect what a defensible savings hypothesis needs?

**Outcome.** No and no: 20-30 minutes for one knowledgeable respondent, and the financial-capture question set was missing. Nine targeted edits produced a role-routed v2 (36 questions, each route 10-18 minutes) with a Finance section, single-select success and autonomy questions, a three-column baseline grid and closed range gaps.

**Pages created.** Discovery questionnaire (with fillable PDF v2); Interview and data request; Phased pilot design; Executive presentation.

## Open questions for future entries

- Does any 2026 randomized study measure AI-assisted test generation or triage on enterprise code with net effort (including review) as the outcome?
- What do the final FSB sound practices (expected late 2026) add to prompt versioning, rollback and agent logging expectations?
- Will OSFI issue guidance specific to agentic AI beyond the July 2026 bulletin, and will E-23 proportionality be clarified for human-reviewed assistants?
- What does Bill C-36 look like after second reading, and does the automated-decision explanation duty reach AI-generated test evidence?
- Do any banks publish measured results (not case-study claims) for AI-QE pilots with a stated capture mechanism?


## 9 September 2026 — Banking AI contribution through the release

Rechecked GitHub Copilot test-generation guidance, WireMock service virtualization and Azure Pipelines Publish Test Results documentation. The in-place banking walkthrough maps these mechanisms to approved inputs, AI candidates, engineer review, deterministic execution and retained evidence. PAY-142 artifacts and failure/repair results are authored illustrations; no client execution or measured outcome is claimed. The comparison separates modernization from incremental AI assistance. Existing eight-stage QA effort assumptions remain unchanged.

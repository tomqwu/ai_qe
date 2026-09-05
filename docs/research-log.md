---
title: Research log
nav_order: 7
description: Dated entries recording what was verified, when, what changed, and what remains open. New research is logged here first.
---

# Research log
{: .no_toc }

Newest first. Each entry records the question, what was checked, the outcome, and what changed on the site. Add an entry before editing a topic page.

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

**Pages created.** Productivity benchmarks; Testing and AppSec studies; What the evidence supports; Savings model; Slide language.

## 2026-09-04: Canadian governance context

**Question.** Which supervisory instruments govern AI-assisted delivery, testing and AppSec in a federally regulated bank, and what is their current status?

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

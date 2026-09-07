---
title: Canadian banking context
parent: Governance
nav_order: 1
description: OSFI guidelines and bulletins, privacy law and international analogues relevant to AI-assisted software delivery and testing in federally regulated banks, verified against primary sources.
---

# Canadian banking context
{: .no_toc }

Verified against primary sources on 4 September 2026. Not legal advice.
{: .fs-5 .fw-300 }

<details open markdown="block">
  <summary>Contents</summary>
  {: .text-delta }
- TOC
{:toc}
</details>

## OSFI guidelines (binding expectations)

| Instrument | Status and dates | Relevance to AI-QE pilots |
|---|---|---|
| [Guideline B-13, Technology and Cyber Risk Management](https://www.osfi-bsif.gc.ca/en/guidance/guidance-library/technology-cyber-risk-management) | Final Jul 2022; effective 1 Jan 2024 | "system and service accounts are securely authenticated, managed and monitored"; "continuous security logging for technology assets"; a "current and comprehensive" asset inventory (AI tools, model endpoints and pipelines are assets); controlled change with segregation of duties. AI is not mentioned. |
| [Guideline B-10, Third-Party Risk Management](https://www.osfi-bsif.gc.ca/en/guidance/guidance-library/third-party-risk-management-guideline) | Final Apr 2023; effective 1 May 2024 | LLM API vendors, cloud AI platforms and consulting firms are third-party arrangements: audit rights, subcontractor (embedded model) management and notification, concentration risk "including geography, supplier, and subcontractor", contingency and exit plans, third parties held to the bank's access-management and data-security standards. OSFI's 2026-27 outlook announces a fourth third-party data call. |
| [Guideline E-21, Operational Risk Management and Resilience](https://www.osfi-bsif.gc.ca/en/guidance/guidance-library/operational-risk-management-resilience-guideline) | Final 22 Aug 2024; s.4 full adherence 1 Sep 2025; critical-operations identification, mapping and tolerances by 1 Sep 2026; scenario testing complete by 1 Sep 2027 | Change management (s.4.4) must "govern the risks introduced by change", with "implementing new technological systems" named as a significant change; critical operations are mapped end to end across "people, technology, processes, information, facilities, third parties" (CI/CD and test pipelines that support critical operations are in that map); "severe but plausible" scenario testing should include AI-capability failure and manual fallback. |
| [Guideline E-23, Model Risk Management (2027)](https://www.osfi-bsif.gc.ca/en/guidance/guidance-library/guideline-e-23-model-risk-management-2027) | Final 11 Sep 2025; effective 1 May 2027; replaces the 2017 guideline | A model is any "application of theoretical, empirical, judgmental assumptions or statistical techniques, including AI/ML methods, which processes input data to generate results"; inventory must be "accurate, evergreen, and subject to robust controls"; proportionality applies "on a risk-basis"; explainability expectations vary with "level of autonomy", with "alternative controls" for black-box or autonomous models; externally sourced models are rated on a standalone basis under B-10. Does not specifically address generative or agentic AI. Pilot models and agents should be registered now with a documented risk rating. |
| [Integrity and Security Guideline](https://www.osfi-bsif.gc.ca/en/guidance/guidance-library/integrity-security-guideline) | Final 31 Jan 2024; new or expanded expectations by 31 Jan 2025, except background checks by 31 Jul 2025; action plan due 31 Jul 2024 ([implementation letter](https://www.osfi-bsif.gc.ca/en/guidance/guidance-library/integrity-security-letter)) | Screening of contractors on a pilot; data controls "at rest, in transit, and in use"; limits on access to information; defers to B-13 for electronic security. |
| [Technology and Cyber Security Incident Reporting Advisory](https://www.osfi-bsif.gc.ca/en/guidance/guidance-library/technology-cyber-security-incident-reporting) | Current version effective 13 Aug 2021 | Initial report "within 24 hours, or sooner if possible"; triggers include impact on critical systems or customer data and a material third-party breach. An AI-caused defective deployment or data exposure that meets the triggers is reportable. |

## OSFI bulletins and reports (sound practices, non-binding)

| Instrument | Date | Relevance |
|---|---|---|
| [Technology Risk Bulletin: Generative and Agentic Artificial Intelligence](https://www.osfi-bsif.gc.ca/en/risks/technology-cyber-risk-management/technology-risk-bulletin/generative-agentic-artificial-intelligence-implications-technology-cyber-security-operational) | July 2026 | Discretionary sound practices that map almost exactly to a conservative pilot's control boundary: "assign unique non-human identities, enforce least privilege, apply scoped permissions, and use just-in-time access with short-lived credentials"; "log and review agent activity and tool usage along with periodic access recertification"; "ensure human oversight with accountability for material or high-impact decisions, with clear and auditable documentation"; "apply enterprise secure development and change management controls to AI components"; "enforce an obligation on third parties to notify if and how they are using AI to deliver services". Refers to E-23 for model risk. |
| [FIFAI II: AI Risks and Opportunities: Adopting an AGILE Framework in Canadian Financial Services](https://www.osfi-bsif.gc.ca/en/about-osfi/reports-publications/fifai-ii-ai-risks-opportunities-adopting-agile-framework-canadian-financial-services) | 23 Mar 2026 (OSFI and Global Risk Institute with Finance Canada, Bank of Canada, FCAC, FINTRAC) | "Human oversight of material decisions made by AI-assisted tools, agents and services"; set "clear governance guidelines for agentic AI, defining where human approval is required and where autonomous agents can operate safely"; map "fourth, fifth, and 'nth party' dependencies" in the AI supply chain. |
| [OSFI-FCAC Risk Report: AI Uses and Risks at Federally Regulated Financial Institutions](https://www.osfi-bsif.gc.ca/en/about-osfi/reports-publications/osfi-fcac-risk-report-ai-uses-risks-federally-regulated-financial-institutions) | 24 Sep 2024 | Names "coding assistance" among generative-AI uses; controls include "human-in-the-loop, performance monitoring, back-up systems, alerts"; "financial institutions are responsible for the results of third-party AI systems"; customized LLMs carry "heightened risks for unintended release of consumer data or trade secrets". |

## Privacy

| Instrument | Status | Relevance |
|---|---|---|
| PIPEDA and the [OPC principles for responsible, trustworthy and privacy-protective generative AI](https://www.priv.gc.ca/en/privacy-topics/technology/artificial-intelligence/gd_principles_ai/) | PIPEDA in force; principles published 7 Dec 2023 (page modified May 2025, no substantive revision documented) | Personal information in test environments and prompts; "accountability for decisions rests with the organization, and not with any kind of automated system"; traceability as "a complete account of how the system works"; independent auditing of validity and reliability. |
| [Bill C-36, Protecting Privacy and Consumer Data Act](https://www.parl.ca/legisinfo/en/bill/45-1/c-36) | First reading 15 Jun 2026; no further stage; House resumes 21 Sep 2026 | Would replace PIPEDA Part 1; permits de-identification without consent and use of de-identified information for "internal research, analysis and development purposes"; explanation duties for automated decision systems; administrative penalties up to the higher of $10 million or 3% of global revenue, offences up to $25 million or 5%. No standalone AI statute is proposed. |
| Quebec Law 25 | Fully in force since 22 Sep 2024 | Privacy impact assessment for any project to "acquire, develop, or overhaul an information system" involving personal information and for transfers outside Quebec; relevant where AI tooling processes Quebec personal information or uses cross-border vendors. |
| [Canada's National AI Strategy, "AI for All"](https://ised-isde.canada.ca/site/ised/en/canadas-national-artificial-intelligence-strategy-ai-all) | Launched 4 Jun 2026 | Sectoral approach; commits to modernizing privacy and online-safety law; no new binding obligations for banks; OSFI remains the primary AI supervisor for federally regulated institutions. |

## International analogues worth one line

| Instrument | Status | Why it matters |
|---|---|---|
| [FSB, Sound Practices for Responsible Adoption of AI (consultation)](https://www.fsb.org/2026/06/fsb-consults-on-sound-practices-for-the-responsible-adoption-of-artificial-intelligence-ai/) | Published 10 Jun 2026; consultation closed 22 Jul 2026; final expected in the coming months | Twelve practices including "prompt versioning and version control to enable rollback", activity logging and monitoring, a "centralised, organisation-wide AI inventory", human oversight scaled to "materiality, risk, autonomy, complexity"; names coding assistants explicitly. |
| [Federal Reserve SR 26-2](https://www.federalreserve.gov/supervisionreg/srletters/SR2602.htm) and [OCC Bulletin 2026-13](https://www.occ.gov/news-issuances/bulletins/2026/bulletin-2026-13.html), Revised Guidance on Model Risk Management | 17 Apr 2026; supersedes SR 11-7 | "Generative AI and agentic AI models are novel and rapidly evolving. As such, they are not within the scope of this guidance"; a request for information on AI model risk is planned. Contrast: Canada's E-23 keeps AI/ML in scope. |
| [EU Digital Omnibus on AI](https://digital-strategy.ec.europa.eu/en/news/ai-omnibus-enters-force) amending the AI Act; [EU DORA](https://www.eiopa.europa.eu/digital-operational-resilience-act-dora_en) | Omnibus in force 27 Jul 2026; Annex III high-risk obligations apply 2 Dec 2027, Annex I 2 Aug 2028; DORA applying since 17 Jan 2025 | Relevant to banks with EU operations; DORA's ICT third-party oversight and incident reporting parallel B-10 and the OSFI advisory. |

## How to use this page in a proposal

Present the control design as alignment with published supervisory expectations rather than as self-imposed caution. A one-page mapping from pilot controls to these instruments (see [Pilot control mapping](../control-mapping/)) reassures the sponsor, pre-empts second-line objections and differentiates the proposal from vendor pitches that treat governance as an afterthought.

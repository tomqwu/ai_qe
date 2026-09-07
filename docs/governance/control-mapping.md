---
title: Pilot control mapping
parent: Governance
nav_order: 2
description: One-page mapping from the controls of a conservative AI-QE pilot to the supervisory instruments that expect them.
---

# Pilot control mapping
{: .no_toc }

Each row is a control a low-risk pilot adopts anyway; the right-hand column shows which published expectation it satisfies. Use it as the governance slide and as the second-line briefing note.

| Pilot control | Instrument and expectation |
|---|---|
| AI-generated tests are reviewed by a human and run through existing CI and change approvals | B-13 development and change controls; July 2026 bulletin on human oversight and applying enterprise change controls to AI components |
| Unique service identity per AI integration; least privilege; short-lived, just-in-time credentials; periodic access recertification | B-13 identity and access ("system and service accounts are securely authenticated, managed and monitored"); July 2026 bulletin (non-human identities, scoped permissions, just-in-time access) |
| Prompt, response, model-version and approval logging retained under the enterprise logging standard | B-13 security logging; July 2026 bulletin ("log and review agent activity and tool usage"); FSB consultation (prompt versioning and rollback); OPC principles (traceability, demonstrable compliance) |
| Pilot models and agents entered in the model inventory with a documented, proportionate risk rating | E-23 (effective 1 May 2027; AI/ML within the model definition; inventory "accurate, evergreen"; proportionality) |
| Pilot changes flow through existing change management; AI components are treated as technology assets | B-13 asset inventory and change control; E-21 s.4.4 change management; July 2026 bulletin (enterprise SDLC and change controls applied to AI components) |
| Approved enterprise AI platform only; vendor AI-use disclosure and embedded-model terms checked; exit and portability recorded | B-10 (third-party arrangements, subcontractors, concentration, exit); July 2026 bulletin (third parties notify "if and how they are using AI") |
| Non-production environments with de-identified or synthetic data only; no personal information in prompts, verified by log review | PIPEDA safeguards and limiting use; OPC generative-AI principles; Quebec Law 25 privacy impact assessment where applicable; Bill C-36 direction on de-identified data for internal development |
| Incident runbook links AI-caused defects or data exposure to the incident classification and reporting clock | OSFI incident reporting advisory (24-hour initial report) |
| Manual fallback documented for every AI capability; AI-capability outage included in the application's resilience scenarios | E-21 critical-operations mapping and scenario testing |
| Human approval for any AI action at autonomy level 5 or above; no autonomous merge or deploy in a first pilot | FIFAI II ("defining where human approval is required and where autonomous agents can operate safely"); July 2026 bulletin (human oversight for material decisions) |

{: .caution }
The instruments cited are a mix of binding guidelines (B-10, B-13, E-21, E-23), an advisory, and discretionary sound practices (the 2026 bulletins, FIFAI II, the FSB consultation). Label them accordingly on the slide; a second-line reader will notice if a bulletin is presented as a requirement.

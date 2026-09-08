---
title: Industry outlook
parent: Industry research
nav_order: 1
permalink: /docs/industry/outlook/
---
# Industry outlook

The direction of travel is broader AI participation in delivery. The execution problem is making that participation reliable, integrated and economically useful.

## Analyst perspectives: strategy and organizational change

Gartner's public forecasts anticipate much wider assistant use and changes in team structure. Its public testing research abstracts emphasize platform choice and continuous quality. These indicate where the analyst sees demand; they do not establish adoption outcomes or reproduce the licensed research. {% include industry/cite.html ids="G01,G02,G03,G04" %}

McKinsey's software-development research places AI within the wider product lifecycle and operating model. Its 2026 bank example illustrates an ambitious implementation direction, but the public account does not supply enough independent detail to make the claimed gains a planning baseline. {% include industry/cite.html ids="M01,M02" %}

**Implication for an executive:** define the future capability and how it changes delivery. A license rollout alone leaves the integration, verification and ownership work unresolved.

## Experimentation is ahead of enterprise scale

The World Quality Report reports **89% piloting or deploying** GenAI-enabled QE. In a separate maturity breakdown, **15% report enterprise-wide deployment**. These are answers to different questions and should not be joined into a single conversion funnel. {% include industry/cite.html ids="W01" %}

{% include industry/barriers.html %}

The barriers suggest a practical investment agenda: approved data access, delivery-system integration, evidence of reliability and staff capability. Buying a more capable model does not itself complete that agenda.

## Quality work extends beyond test execution

DORA describes AI as interacting with the surrounding engineering system. Its 2026 qualitative study also draws attention to the effort required to understand, verify and correct generated work. {% include industry/cite.html ids="D01,D02" %}

For QE, our synthesis is a shift in emphasis:

| Existing capability | Added AI-era responsibility |
|---|---|
| Requirements and acceptance tests | Explicit task contracts and machine-checkable expectations |
| Test automation | Evaluate generated artifacts and protect test validity |
| Defect triage | Diagnose failures with traceable context and calibrated uncertainty |
| Release assurance | Assess model, prompt, retrieval and tool changes together |
| Production quality | Curate failures and drift into repeatable evaluations |

This is an expansion of engineering responsibility. Staffing decisions should follow measured changes to work, service levels and risk, with a deliberate plan to develop less-experienced engineers.

**Read next:** [Evidence and economics]({{ '/docs/industry/evidence/' | relative_url }}) explains why reported benefits differ.

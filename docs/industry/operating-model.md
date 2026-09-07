---
title: Operating model
parent: Industry research
nav_order: 4
permalink: /docs/industry/operating-model/
---
# Operating model

A shared platform can reduce repeated integration work. Quality and value still require named owners close to the product and its users.

{% include industry/operating-model.html %}

This proposed allocation draws on the broader organizational emphasis in DORA and McKinsey, combined with the institution's existing delivery and control responsibilities. It is not a reproduction of either publisher's proprietary operating model. {% include industry/cite.html ids="D01,M01" %}

## Capabilities to develop

QE teams need skills in evaluation design, meaningful assertions, data curation, failure analysis and AI-assisted workflow integration. Platform teams need stable identity, context, model routing and observability services. Delivery and risk owners need exception handling, recovery exercises and ways to challenge the evidence independently.

Preserve learning opportunities for junior engineers. Reviewing an AI-generated change requires enough understanding to recognize omissions and weak reasoning; a workflow that hides that reasoning can erode the skills it depends on. Team design is a strategic choice, not an automatic consequence of assistant adoption. {% include industry/cite.html ids="G04,D02" %}

## A staged capability roadmap

| Stage | Visible capability | Evidence needed for expansion |
|---|---|---|
| Establish foundations | Classified inputs, repeatable tests, task baseline and accountable owner | Known workflow volume, effort and failure modes |
| Assist bounded work | Test drafts or failure diagnosis inside an existing workflow | Net effort improvement with quality and security floors intact |
| Connect assurance | Versioned evaluations, traceable decisions and tested fallback | Results repeat across teams and releases |
| Expand agent authority | More complex tasks within explicit permissions | Action-level safety evidence, operational resilience and a capture route |

The stages are an authored roadmap, not a survey-derived maturity score. Timelines depend on the starting engineering system and the consequences of failure. See the existing [phased pilot]({{ '/docs/method/phased-pilot/' | relative_url }}) for concrete discovery and promotion criteria.

## A balanced measurement contract

| Dimension | Primary question | Example measures |
|---|---|---|
| Quality | Does the workflow produce trustworthy results? | Fault detection, escaped defects, rework, false dismissals |
| Effort and flow | Does it improve end-to-end delivery? | Active effort per task, review time, queue time, lead time |
| Adoption | Does it fit actual work? | Eligible-task use, accepted artifacts, abandonment reasons |
| Control | Does it operate within its boundary? | Denied-action behavior, evidence completeness, fallback tests |
| Economics | Is the benefit captured after total cost? | Platform and inference cost, control effort, validated capacity use |

Do not substitute token volume, generated test counts or accepted suggestions for quality outcomes. Report the sample, period, complexity and uncertainty with each result.

## Strategic visual briefings

The expanded EVP briefing makes the operating choices explicit: [workflow portfolio]({{ '/briefings/evp/' | relative_url }}#slide-8), [ownership model]({{ '/briefings/evp/' | relative_url }}#slide-11), [skills agenda]({{ '/briefings/evp/' | relative_url }}#slide-12), [shared investment architecture]({{ '/briefings/evp/' | relative_url }}#slide-14) and [leadership evidence contract]({{ '/briefings/evp/' | relative_url }}#slide-16). Each separates the source findings from the proposed organizational response.

## Strategic choices for leadership

Choose which quality constraints matter most, which capabilities belong in the shared platform and which decisions stay with delivery teams. Fund the measurement and evaluation work as part of implementation. Expand when value and control evidence hold together; redesign or stop workflows that merely move effort into review.

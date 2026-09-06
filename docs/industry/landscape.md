---
title: Technology landscape
parent: Industry research
nav_order: 5
permalink: /docs/industry/landscape/
---
# Technology landscape

Products address different parts of AI × QE. Use the workflow and assurance requirements to define a shortlist before comparing features.

This is a **representative capability map**, not a market-share analysis, Magic Quadrant, vendor ranking or product recommendation. Documentation was reviewed on 5 September 2026; packaging and capabilities can change.

| Capability layer | Representative example | What the documentation supports | Local evaluation question |
|---|---|---|---|
| Test authoring and asset navigation | Tricentis Tosca | Natural-language assistance with test assets and generation | Can it preserve existing test conventions and evidence? {% include industry/cite.html ids="T01" %} |
| Visual regression | Applitools | Visual comparison against approved baselines | What are missed changes and false alerts on dynamic UI? {% include industry/cite.html ids="T02" %} |
| Change review | GitHub Copilot | AI review suggestions in developer workflows | Which issues are found or missed after human review? {% include industry/cite.html ids="T04" %} |
| AI application evaluation | LangSmith | Datasets, evaluators and offline/online feedback | Are scores calibrated and traceable to business tasks? {% include industry/cite.html ids="T03" %} |
| Adversarial agent testing | Promptfoo | Test scenarios for tools, permissions and agent context | Does the suite cover the application's actual authority? {% include industry/cite.html ids="T05" %} |
| Managed evaluation and observability | Microsoft Foundry | Run and example-level evaluation comparison | Can results, versions and operating cost be joined and exported? {% include industry/cite.html ids="T06" %} |

These layers can overlap. A platform may provide several, while a specialist tool may go deeper in one. A documented capability does not demonstrate superior effectiveness.

## A practical selection brief

Compare candidates on the same representative tasks and dataset. Keep the baseline workflow available. Include difficult cases and record reviewer effort as well as output quality.

| Evaluation area | Evidence to request |
|---|---|
| Data and deployment | Data flow, retention, training use, region, subprocessors and deletion behavior |
| Integration | Supported repositories, CI systems, test frameworks, issue trackers and identity model |
| Quality validity | Independent oracles, repeatability, judge calibration and protection against weakened assertions |
| Agent authority | Tool allowlists, resource scope, approvals, credentials and denied-action tests |
| Audit and portability | Exportable traces, version history, dataset ownership and reproducible evaluations |
| Resilience | Rate-limit behavior, timeouts, fallback, rollback and vendor exit tests |
| Total economics | Licensing, inference, integration, evaluation, review and ongoing support costs |

The criteria above are our synthesis. Gartner's platform-selection document is included as a licensed research follow-up; its proprietary criteria were not accessible and are not attributed here. {% include industry/cite.html ids="G02" %}

## Build, buy and integrate

Buy commodity services when their controls and integration meet requirements. Build the task-specific contracts, evaluation cases and ownership model that express institutional needs. Integrate around portable evidence and versioned interfaces so that switching a model does not require abandoning the quality system.

The most durable asset is often the curated evaluation set and the workflow evidence around it. Treat those as maintained engineering assets, with owners and change history.

## Coverage and comparable deployment requirements

See the [research coverage matrix]({{ "/docs/industry/coverage/" | relative_url }}) for eight quality workflows, supported and weak evidence, inclusion/exclusion decisions, and comparison requirements for existing CI, managed platforms and institution-operated runners. No vendor score is implied by a documented capability.

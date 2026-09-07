---
title: Assurance architecture
parent: Industry research
nav_order: 3
permalink: /docs/industry/architecture/
---
# Assurance architecture

The proposed architecture separates generation, permission to act and verification. This supports both AI-assisted QE workflows and the testing of AI applications.

[**Explore the architecture in 3D →**]({{ '/demos/architecture/' | relative_url }}) · Orbit the model and compare generated-test verification, AI evaluation, denied actions and failed quality checks. A [49-second film]({{ '/assets/video/assurance-architecture.mp4' | relative_url }}?v={{ site.data.release.version }}) and [editable Blender scene]({{ '/assets/models/assurance-platform.blend' | relative_url }}?v={{ site.data.release.version }}) are also available. These are authored illustrations of this logical architecture, not a live system or a performance simulation.

<img class="industry-cover" src="{{ '/assets/images/industry/assurance-lab.webp' | relative_url }}" alt="Conceptual AI assurance laboratory with a model engine, test specimens, controlled test chamber and human review station" width="1536" height="1024" loading="lazy">

## A control boundary around agent actions

{% include diagrams/figure.html name="platform" label="Enterprise assurance platform" %}

An agent may suggest a tool call, but a separate enforcement point decides whether that identity can perform the action on the specified resource. Prompt instructions are not an access-control mechanism. Retrieved documents, repository text and tool results should be treated as untrusted content.

For the initial QE pilot, use scoped non-production context, a sandbox and draft artifacts. More consequential actions require a separate design review of authority, approvals, recovery and evidence. The detailed [pilot control mapping]({{ '/docs/governance/control-mapping/' | relative_url }}) remains applicable.

## A workflow through the architecture

{% include diagrams/figure.html name="test-sequence" label="Payment API test generation sequence" %}

## Evaluation extends across the lifecycle

{% include diagrams/figure.html name="evaluation-system" label="Evaluation and release lifecycle" %}

A useful evaluation contract identifies the user task, representative populations, important failure modes, expected behavior, scoring rules and release thresholds. Split development examples from a held-out evaluation set, and preserve a history of model, prompt, retrieval, dataset and tool versions.

| What is evaluated | Example evidence | Important limitation |
|---|---|---|
| Task outcome | Correct result against an independent expected outcome | Fluency is not correctness |
| Retrieval and grounding | Relevant evidence; correct attribution; permission-aware retrieval | A citation can point to an irrelevant or inaccessible source |
| Agent trajectory | Correct tool, arguments, scope and termination | A successful final answer can hide an unsafe action |
| Adversarial resilience | Injection, data disclosure and denied-action scenarios | A finite suite does not prove absence of other failure modes |
| Operational behavior | Latency, cost, escalation, drift and fallback success | Average performance can hide rare severe failures |

LLM judges can help scale assessment, but they need calibration against expert labels and checks for inconsistency and bias. Deterministic contracts and human review still have distinct roles. {% include industry/cite.html ids="A01,A02,T03,T06" %}

## The release decision includes the AI configuration

Re-run relevant evaluations when changing prompts, models, retrieval indexes, tool schemas, permissions or memory behavior. Maintain bounded retries, budget limits and a tested fallback. Curate incidents into regression cases without copying sensitive production content into broadly accessible datasets.

OWASP's 2026 LLM guidance covers the model as an application component; its agentic guidance extends the threat model to actors with tools and memory. The newly introduced ACS proposes common runtime control hooks. Its implementation maturity should be evaluated before relying on framework portability. {% include industry/cite.html ids="A03,A04,A05" %}

## Verify the authority boundary

{% include diagrams/figure.html name="threat-boundary" label="Agent threat model" %}

## Detailed architecture walkthroughs

The expanded technical briefing develops the logical platform into concrete boundaries and failure paths. These are authored designs informed by the source library, not claims that a publisher or institution uses this exact architecture.

| Architecture concern | Visual walkthrough |
|---|---|
| Context and reproducibility | [Permission-aware retrieval]({{ '/briefings/technical/' | relative_url }}#slide-7) and [versioned release manifest]({{ '/briefings/technical/' | relative_url }}#slide-8) |
| Generated-test validity | [Independent expected behavior]({{ '/briefings/technical/' | relative_url }}#slide-9) and [mutation-guided tests]({{ '/briefings/technical/' | relative_url }}#slide-10) |
| Test operations | [Evidence-linked failure diagnosis]({{ '/briefings/technical/' | relative_url }}#slide-11) and [flaky-test repair]({{ '/briefings/technical/' | relative_url }}#slide-12) |
| Evaluation assets | [Corpus lifecycle]({{ '/briefings/technical/' | relative_url }}#slide-13) and [judge calibration]({{ '/briefings/technical/' | relative_url }}#slide-14) |
| Agent authority | [Denied-action sequence]({{ '/briefings/technical/' | relative_url }}#slide-16) and [execution zones]({{ '/briefings/technical/' | relative_url }}#slide-17) |
| Release and resilience | [Release decision logic]({{ '/briefings/technical/' | relative_url }}#slide-18) and [fallback state machine]({{ '/briefings/technical/' | relative_url }}#slide-19) |
| Operational evidence | [Telemetry pipeline]({{ '/briefings/technical/' | relative_url }}#slide-20) and [integration contracts]({{ '/briefings/technical/' | relative_url }}#slide-23) |

## Financial-services context

OSFI's July 2026 Technology Risk Bulletin discusses identity, tool restrictions, testing, traceability and resilience for generative and agentic AI. It complements existing guidelines with sound practices. E-23's revised model-risk guideline is **effective 1 May 2027**; determine system applicability with the institution's model-risk function. {% include industry/cite.html ids="R01,R02" %}

These references inform the design. They do not establish that the proposed architecture, or any named product, complies with every applicable requirement.

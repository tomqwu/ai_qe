---
title: Payment API reference contracts
parent: Industry research
nav_order: 9
permalink: /docs/industry/reference-contracts/
---
# A payment test from task to reviewable evidence

This synthetic, runnable contract example connects the platform, sequence, isolation and recovery diagrams. It is a reference design, not a production gateway or a claim about bank infrastructure. The approved rule is: **a negative payment amount returns HTTP 422 and creates no payment**.

{% include diagrams/figure.html name="contract-chain" label="Joined payment test artifacts" %}

## Download and exercise the artifacts

- [Complete example bundle]({{ '/assets/examples/payments/bundle.json' | relative_url }}) and [JSON Schema]({{ '/assets/examples/payments/bundle.schema.json' | relative_url }}).
- [Task envelope]({{ '/assets/examples/payments/task.json' | relative_url }}): PAY-042, allowed resource, contract digest, context references, deadline and budget.
- [Policy decision]({{ '/assets/examples/payments/policy.json' | relative_url }}): DEC-042, identity, policy version, scoped action, expiry and idempotency key.
- [Evaluation manifest]({{ '/assets/examples/payments/evaluation.json' | relative_url }}): EVAL-042, artifact and oracle digests, configuration, corpus, runner and independent checks.
- [Evidence record]({{ '/assets/examples/payments/evidence.json' | relative_url }}): REC-042 joins every ID and remains held for human review.
- [Approved contract]({{ '/assets/examples/payments/approved-contract.txt' | relative_url }}) and [illustrative candidate assertions]({{ '/assets/examples/payments/candidate-test.txt' | relative_url }}).

In the repository, run `python tools/validate_contracts.py` after installing `tools/requirements.txt`. It checks the schema plus joins, artifact digests, identity, scope, time validity, idempotency binding, independent checks and separation of approval. Ten negative fixtures exercise denial, wrong resources, stale policy, expiry, mismatched artifacts, failed mutation checks, missing evidence and self-approval. Example timestamps are evaluated against the recorded request time, not the reader’s current clock.

## The same case across architectural views

| View | Payment case mapping | Boundary assertion |
|---|---|---|
| Component platform | Context → runtime → action gateway → sandbox/evaluation → release owner | Every consequential action passes an independent authorization boundary |
| Runtime sequence | PAY-042 → DEC-042 → EVAL-042 → REC-042 | The artifact reviewed is the artifact that was evaluated |
| Deployment | Runtime identity outside ephemeral sandbox; no production credentials | The negative-amount test cannot access production payment systems |
| Evidence | Immutable content digests plus joined IDs and durable receipt | Missing or inconsistent evidence holds promotion |
| Recovery | Disable new actions, route to manual review, validate fix, owner resumes | Previous side effects require reconciliation; model rollback cannot undo them |

## Failure and retry semantics

| Condition | Required behavior | Observable acceptance test |
|---|---|---|
| Runner timeout with unknown completion | Stop issuing actions. Query execution status using the same idempotency key. Retry only an idempotent operation after its outcome is resolved | One logical RUN-042 produces no duplicate execution or side effect |
| Transient read failure | At most two retries with bounded backoff, still within the task deadline and budget | Third failure or expired deadline enters manual queue |
| Expired decision or changed policy version | Deny execution; obtain a fresh decision from the current authority | DEC-042 cannot be replayed after expiry or a policy revision |
| Authorization service unavailable | Fail closed for tool execution; retain a local denial event where possible | No tool invocation and an explicit unavailable reason |
| Evidence store unavailable | Hold promotion. If a configured durable outbox exists, retain a bounded event and reconcile; otherwise halt new actions | No review-ready status without a durable receipt; full outbox stops intake |
| Artifact, oracle or configuration changed | Invalidate prior evaluation and regenerate the evidence | A changed digest cannot reuse EVAL-042 |
| Confirmed control breach | Revoke the task’s execution authority, retain minimal incident evidence and invoke the manual runbook | No automated resumption without owner approval and a passing replay |

The JSON checks demonstrate local contract consistency. Production identity verification, signed decisions, clock handling, secrets, concurrency, durable storage and actual payment behavior require integration tests and platform implementations. The policy version and identity in this fixture are allowlisted examples, not a substitute for an authorization service. {% include industry/cite.html ids="A01,A03,R01" %}

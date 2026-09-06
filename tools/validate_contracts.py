"""Reference contract checks, not a runtime authorization service."""
import copy, hashlib, json
from datetime import datetime
from pathlib import Path
from jsonschema import Draft202012Validator, FormatChecker
ROOT=Path(__file__).resolve().parents[1]/'assets/examples/payments'
SCHEMA=json.loads((ROOT/'bundle.schema.json').read_text())
def validate(bundle):
    Draft202012Validator(SCHEMA, format_checker=FormatChecker()).validate(bundle)
    task,policy,evaluation,evidence=(bundle[k] for k in ('task','policy','evaluation','evidence'))
    def require(condition, reason):
        if not condition: raise ValueError(reason)
    for obj in (policy,evaluation,evidence):
        require(obj['task_id']==task['task_id'] and obj['run_id']==task['run_id'], 'Broken task/run join')
    now=datetime.fromisoformat(bundle['request_time'])
    require(datetime.fromisoformat(policy['issued_at'])<=now<datetime.fromisoformat(policy['expires_at']), 'Expired or future authorization')
    require(now<datetime.fromisoformat(task['deadline']), 'Task deadline exceeded')
    require(policy['resource']==task['resource']=='repo:payments-api/tests', 'Resource outside allowed scope')
    require(policy['policy_version']=='7' and policy['identity']=='qe-payments-sandbox', 'Stale policy or wrong identity')
    require(policy['decision']=='allow', 'Denied action cannot execute')
    require(policy['idempotency_key']==task['run_id']+':sandbox.test:1', 'Invalid idempotency binding')
    require(evaluation['configuration']==task['configuration'], 'Configuration mismatch')
    require(evaluation['contract_sha256']==task['contract_sha256']==hashlib.sha256((ROOT/'approved-contract.txt').read_bytes()).hexdigest(), 'Oracle mismatch')
    require(evaluation['artifact_sha256']==evidence['artifact_sha256']==hashlib.sha256((ROOT/'candidate-test.txt').read_bytes()).hexdigest(), 'Artifact mismatch')
    require(evaluation['original_pass'] and evaluation['mutant_killed'] and evaluation['security_pass'] and evaluation['repeat_runs']>=3, 'Independent quality gate failed')
    require(evidence['decision_id']==policy['decision_id'] and evidence['evaluation_id']==evaluation['evaluation_id'], 'Broken evidence join')
    require(bool(evidence['durable_receipt']), 'Evidence unavailable: hold')
    if evidence['status']=='approved': require(evidence['reviewer'] and evidence['reviewer']!=policy['identity'], 'Independent human approval required')
    return evidence['status']
if __name__=='__main__':
    b=json.loads((ROOT/'bundle.json').read_text());assert validate(b)=='held-for-human-review'
    failures=[('policy','resource','production:payments'),('policy','decision','deny'),('policy','expires_at','2026-09-06T11:59:59Z'),('policy','policy_version','6'),('policy','idempotency_key','duplicate-run'),('evaluation','artifact_sha256','0'*64),('evaluation','mutant_killed',False),('evidence','durable_receipt',''),('evidence','status','approved'),('evidence','run_id','wrong-run')]
    for group,key,value in failures:
        candidate=copy.deepcopy(b);candidate[group][key]=value
        try:validate(candidate)
        except Exception:pass
        else:raise AssertionError(f'Accepted invalid {group}.{key}')
    print(f'Passed: valid held-for-review bundle and {len(failures)} negative contract cases')

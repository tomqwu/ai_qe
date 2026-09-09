// Applies a sponsor-agreed protocol to supplied evidence; it does not estimate
// uncertainty, verify approvals or turn discussion inputs into authorization.
const g = require('../_data/pilot_gates.json');
const text = value => typeof value === 'string' && Boolean(value.trim());
const sample = (c, minimum) => c && Number.isInteger(c.baselineTasks) && Number.isInteger(c.pilotTasks) && c.baselineTasks >= minimum && c.pilotTasks >= minimum && Number.isFinite(c.low) && Number.isFinite(c.high) && c.low <= c.high;
function decide({charter, breach=false, cases, outcome, cashClaim, adoption, withinCostCap, complete=true}) {
 if (breach) return 'stop/hold';
 if (!complete || !charter || !g.objectives.includes(charter.objective) || !text(charter.owner) || !text(charter.valueRationale) || charter.approved !== true || charter.fundedCostCeiling !== true || !Number.isFinite(adoption) || adoption < 0 || adoption > 100 || typeof withinCostCap !== 'boolean') return 'insufficient evidence';
 if (charter.objective === 'cash' && (!cashClaim || cashClaim.financeValidated !== true || !text(cashClaim.reference) || !Number.isFinite(cashClaim.netSaving))) return 'insufficient evidence';
 if (!['effort','cash'].includes(charter.objective)) {
  const criterion = charter.criterion;
  if (!criterion || !text(criterion.metric) || !text(criterion.unit) || !text(criterion.reference) || !Number.isFinite(criterion.target) || !['at-least','at-most'].includes(criterion.direction) || !Number.isInteger(criterion.minTasksPerArm) || criterion.minTasksPerArm < 1 || !sample(outcome, criterion.minTasksPerArm) || !text(outcome.reference)) return 'insufficient evidence';
  const met = criterion.direction === 'at-least' ? outcome.low >= criterion.target : outcome.high <= criterion.target;
  const missed = criterion.direction === 'at-least' ? outcome.high < criterion.target : outcome.low > criterion.target;
  if (!met && !missed) return 'insufficient evidence';
  return met && adoption >= g.adoption && withinCostCap ? 'go, limited scope' : 'extend/redesign';
 }
 if (!Array.isArray(cases) || cases.length < 1 || cases.length > 2 || cases.some(c=>!sample(c,g.min_tasks_per_arm))) return 'insufficient evidence';
 if (charter.objective === 'cash' && cashClaim.netSaving <= 0) return 'extend/redesign';
 if (cases.every(c=>c.high<g.review_saving)) return 'stop/hold';
 if (cases.some(c=>c.low>=g.go_saving)) return adoption>=g.adoption && withinCostCap ? 'go, limited scope' : 'extend/redesign';
 if (cases.some(c=>c.low>=g.review_saving && c.high<g.go_saving) && cases.every(c=>c.high<g.go_saving)) return 'extend/redesign';
 return 'insufficient evidence';
}
module.exports={decide};

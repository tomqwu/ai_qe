// Applies the proposed management protocol; it does not estimate uncertainty.
const g = require('../_data/pilot_gates.json');
function decide({breach=false, cases, adoption, withinCostCap, complete=true}) {
 if (breach) return 'stop/hold';
 if (!complete || !Array.isArray(cases) || cases.length!==2 || cases.some(c=>!Number.isInteger(c.baselineTasks) || !Number.isInteger(c.pilotTasks) || c.baselineTasks<g.min_tasks_per_arm || c.pilotTasks<g.min_tasks_per_arm || !Number.isFinite(c.low) || !Number.isFinite(c.high) || c.low>c.high)) return 'insufficient evidence';
 if (cases.every(c=>c.high<g.review_saving)) return 'stop/hold';
 if (cases.some(c=>c.low>=g.go_saving)) return adoption>=g.adoption && withinCostCap ? 'go, limited scope' : 'extend/redesign';
 if (cases.some(c=>c.low>=g.review_saving && c.high<g.go_saving) && cases.every(c=>c.high<g.go_saving)) return 'extend/redesign';
 return 'insufficient evidence';
}
module.exports={decide};

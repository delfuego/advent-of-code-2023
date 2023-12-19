const utils = require('../lib/utils')();

function parseInput(path) {
	const [ workflowsLines, partsLines ] = utils.getInputLines(path, true);
	let workflows = {},
		parts = [];
	workflowsLines.forEach(function (line) {
		const p = line.split('{');
		const c = p[1].substring(0, p[1].length - 1).split(',');
		const rules = [];
		c.forEach(function (x) {
			const n = x.split(':');
			let test = null,
				dest;
			if (n.length === 2) {
				const testStr = n[0];
				if (testStr.indexOf('>') > -1) {
					// greater-than test
					const p = testStr.split('>');
					test = {
						type: 'gt',
						a: p[0],
						val: Number(p[1]),
					};
				} else {
					// less-than test
					const p = testStr.split('<');
					test = {
						type: 'lt',
						a: p[0],
						val: Number(p[1]),
					};
				}
				dest = n[1];
			} else {
				dest = n[0];
			}
			rules.push({ test, dest });
		});
		workflows[p[0]] = { rules };
	});
	partsLines.forEach(function (line) {
		const o = {};
		line.substring(1, line.length - 1).split(',').forEach(function (x) { const p = x.split('='); o[p[0]] = Number(p[1]); });
		parts.push(o);
	});
	return { workflows, parts };
}

function performTest(test, part) {
	if (test.type === 'gt') {
		// greater-than test
		return (part[test.a] > test.val);
	}
	// less-than test
	return (part[test.a] < test.val);
}

function getPaths(rules, workflows) {
	const staticDests = { 'A': true, 'R': true };
	let paths = [];
	let rulesCopy = [...rules];
	const rule = rulesCopy.shift();
	const t = rule.test;
	if (t === null) {
		if (staticDests[rule.dest]) {
			return rule.dest;
		}
		return getPaths(workflows[rule.dest].rules, workflows);
	}
	if (t.type === 'gt') {
		// greater-than test
		paths.push({
			a: t.a,
			min: t.val + 1,
			max: 4000,
			dest: (staticDests[rule.dest] ? rule.dest : getPaths(workflows[rule.dest].rules, workflows)),
		});
		paths.push({
			a: t.a,
			min: 1,
			max: t.val,
			dest: getPaths(rulesCopy, workflows),
		});
	} else {
		// less-than test
		paths.push({
			a: t.a,
			min: 1,
			max: t.val - 1,
			dest: (staticDests[rule.dest] ? rule.dest : getPaths(workflows[rule.dest].rules, workflows)),
		});
		paths.push({
			a: t.a,
			min: t.val,
			max: 4000,
			dest: getPaths(rulesCopy, workflows),
		});
	}
	return paths;
}

function getBaseLimitsObject() {
	return {
		a: { min: 1, max: 4000 },
		m: { min: 1, max: 4000 },
		s: { min: 1, max: 4000 },
		x: { min: 1, max: 4000 },
	};
}

function clone(obj) {
	return JSON.parse(JSON.stringify(obj));
}

function workPaths(paths, limitsObjects) {
	let finals = [];
	const pathA = paths[0],
		pathB = paths[1];

	let limitsA = limitsObjects[0],
		limitsB = limitsObjects[1];
	if (!limitsA) {
		limitsA = getBaseLimitsObject();
	}
	if (!limitsB) {
		limitsB = getBaseLimitsObject();
	}

	if (limitsA[pathA.a].min < pathA.min) {
		limitsA[pathA.a].min = pathA.min;
	}
	if (limitsA[pathA.a].max > pathA.max) {
		limitsA[pathA.a].max = pathA.max;
	}
	if (pathA.dest === 'R') {
		// ignore
	} else if (pathA.dest === 'A') {
		finals.push(limitsA);
	} else {
		const j = workPaths(pathA.dest, [ limitsA, clone(limitsA) ]);
		finals = [...finals, ...j];
	}

	if (limitsB[pathB.a].min < pathB.min) {
		limitsB[pathB.a].min = pathB.min;
	}
	if (limitsB[pathB.a].max > pathB.max) {
		limitsB[pathB.a].max = pathB.max;
	}
	if (pathB.dest === 'R') {
		// ignore
	} else if (pathB.dest === 'A') {
		finals.push(limitsB);
	} else {
		const j = workPaths(pathB.dest, [ limitsB, clone(limitsB) ]);
		finals = [...finals, ...j];
	}
	return finals;
}

function dayNineteenPartOne() {
	let rejected = [],
		accepted = [];
	for (const p of parts) {
		let nextWorkflow = 'in';
		while (nextWorkflow !== null) {
			const rules = workflows[nextWorkflow].rules;
			let dest = null;
			for (const r of rules) {
				if (r.test === null) {
					dest = r.dest;
					break;
				}
				const testResult = performTest(r.test, p);
				if (testResult) {
					dest = r.dest;
				}
				if (dest !== null) {
					break;
				}
			}
			// should always have a destination now
			if (dest === 'A') {
				// part accepted
				accepted.push(p);
				nextWorkflow = null;
			} else if (dest === 'R') {
				// part rejected
				rejected.push(p);
				nextWorkflow = null;
			} else {
				// other destination
				nextWorkflow = dest;
			}
		}
	}
	let totalRatings = 0;
	for (const p of accepted) {
		totalRatings += p.x + p.m + p.a + p.s;
	}
	console.log(`day nineteen part one: total ratings ${totalRatings}`);
}

function dayNineteenPartTwo() {
	const allPaths = getPaths(workflows.in.rules, workflows);
	const allAcceptedLimits = workPaths(allPaths, []);
	let total = 0;
	for (const limits of allAcceptedLimits) {
		const totalAcceptable = (limits.a.max - limits.a.min + 1) * (limits.m.max - limits.m.min + 1) * (limits.s.max - limits.s.min + 1) * (limits.x.max - limits.x.min + 1);
		total += totalAcceptable;
	}
	console.log(`day nineteen part two: total acceptable combinations ${total}`);
}

const input = parseInput('data/day19/input.txt');
const workflows = input.workflows;
const parts = input.parts;

dayNineteenPartOne();
dayNineteenPartTwo();

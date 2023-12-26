const utils = require('../lib/utils')();

function parseInput(path) {
	const lines = utils.getInputLines(path);
	const info = lines.map(function (line) { return line.split(' @ '); });
	let hailstones = [];
	for (const i of info) {
		const [px, py, pz] = i[0].split(', ').map(utils.toNumber);
		const [vx, vy, vz] = i[1].split(', ').map(utils.toNumber);
		const xyM = vy/vx;
		const xyB = py - (xyM * px); // y = mx + b --> b = y - mx
		hailstones.push({
			px, py, pz, vx, vy, vz, xyM, xyB,
		});
	}
	return hailstones;
}

function getHailstonePosStr(h) {
	return [h.px, h.py, h.pz].join(',');
}

function testForIntersection(h1, h2, minXY, maxXY) {
	// m1*x + b1 = m2*x + b2 -> (m1 - m2) * x = b2 - b1 -> x = (b2 - b1) / (m1 - m2)
	const x = (h2.xyB - h1.xyB) / (h1.xyM - h2.xyM),
		y = (h1.xyM * x) + h1.xyB;
	if (x === Infinity) {
		return false; // paths are parallel
	}
	// see if the intersection happened in the past for either
	if ((x < h1.px && h1.vx > 0) || (x > h1.px && h1.vx < 0)) {
		return false; // intersection in past for h1
	}
	if ((x < h2.px && h2.vx > 0) || (x > h2.px && h2.vx < 0)) {
		return false; // intersection in past for h2
	}
	return (x >= minXY && y >= minXY && x <= maxXY && y <= maxXY);
}

function dayTwentyFourPartOne() {
	const hailstones = parseInput('data/day24/input.txt');
	const minXY = 200000000000000,
		maxXY = 400000000000000;
	let futurePathsCross = 0;
	while (hailstones.length > 0) {
		const h1 = hailstones.shift();
		for (const h2 of hailstones) {
			const i = testForIntersection(h1, h2, minXY, maxXY);
			if (i) {
				futurePathsCross++;
			}
		}
	}
	console.log(`day twenty four part one: ${futurePathsCross} future paths cross`);
}

function dayTwentyFourPartTwo() {

}

dayTwentyFourPartOne();
dayTwentyFourPartTwo();

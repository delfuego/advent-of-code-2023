const utils = require('../lib/utils')();
const hashCache = {};

function parseInput(path) {
	const lines = utils.getInputLines(path);
	return lines[0].split(',');
}

function hash(str) {
	if (hashCache[str]) {
		return hashCache[str];
	}
	let h = 0;
	for (const c of str) {
		const a = c.charCodeAt(0);
		h += a;
		h = 17 * h;
		h = h % 256;
	}
	hashCache[str] = h;
	return h;
}

function parseStep(step) {
	const p = step.split('=');
	if (p.length === 2) {
		return { op: 'add', l: p[0], h: hash(p[0]), fl: Number(p[1]) };
	}
	const lensLabel = p[0].substring(0, p[0].length - 1);
	return { op: 'remove', l: lensLabel, h: hash(lensLabel) };
}

function getInitializedBoxes() {
	let boxes = Array(256);
	for (let i = 0; i < 256; i++) {
		boxes[i] = [];
	}
	return boxes;
}

function addLensToBox(box, lensLabel, lensFocalLength) {
	let numToDelete = 0,
		indexToInsert = box.length;
	for (let i = 0; i < box.length; i++) {
		if (box[i][0] === lensLabel) {
			indexToInsert = i;
			numToDelete = 1;
			break;
		}
	}
	box.splice(indexToInsert, numToDelete, [ lensLabel, lensFocalLength ]);
}

function removeLensFromBox(box, lensLabel) {
	let lensIndex = null;
	for (let i = 0; i < box.length; i++) {
		if (box[i][0] === lensLabel) {
			lensIndex = i;
			break;
		}
	}
	if (lensIndex !== null) {
		box.splice(lensIndex, 1);
	}
}

function calculateFocusingPower(boxes) {
	let totalPower = 0;
	for (let b = 0; b < boxes.length; b++) {
		const box = boxes[b];
		for (let i = 0; i < box.length; i++) {
			const power = (b+1) * (i+1) * box[i][1];
			totalPower += power;
		}
	}
	return totalPower;
}

function dayFifteenPartOne() {
	let t = 0;
	for (const i of input) {
		const h = hash(i);
		t += h;
	}
	console.log(`day fifteen part one: total ${t}`);
}

function printBoxContents(boxes) {
	for (let i = 0; i < boxes.length; i++) {
		if (boxes[i].length > 0) {
			console.dir({ i, contents: boxes[i] });
		}
	}
}

function dayFifteenPartTwo() {
	const boxes = getInitializedBoxes();
	for (const i of input) {
		const s = parseStep(i);
		if (s.op === 'add') {
			addLensToBox(boxes[s.h], s.l, s.fl);
		} else if (s.op === 'remove') {
			removeLensFromBox(boxes[s.h], s.l);
		}
	}
	const power = calculateFocusingPower(boxes);
	console.log(`day fifteen part two: total power ${power}`);
}

const input = parseInput('data/day15/input.txt');
dayFifteenPartOne();
dayFifteenPartTwo();

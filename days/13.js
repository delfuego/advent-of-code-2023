const utils = require('../lib/utils')();

function parseInput(path) {
	const parts = utils.getInputLines(path, true);
	return parts.map(function (part) { return part.map(function (line) { return line.split(''); });});
}

function checkPartForVerticalMirror(part, ignore = null) {
	let candidate = 1;
	while (candidate <= part[0].length) {
		if (ignore !== null && candidate === ignore) {
			candidate++;
			continue;
		}
		let candidateFail = false;
		for (const line of part) {
			if (line[candidate - 1] !== line[candidate]) {
				candidateFail = true;
				break;
			}
		}
		if (candidateFail) {
			candidate++;
			continue;
		}
		// if we get here, our candidate is good thus far
		for (let o = 1; o <= Math.min(candidate - 1, part[0].length - candidate - 1); o++) {
			for (const line of part) {
				if (line[candidate - 1 - o] !== line[candidate + o]) {
					candidateFail = true;
					break;
				}
			}
			if (candidateFail) {
				break;
			}
		}
		if (candidateFail) {
			candidate++;
			continue;
		}
		return candidate;
	}
	return null;
}

function checkPartForHorizontalMirror(part, ignore = null) {
	const transposedPart = utils.transposeMatrix(part);
	return checkPartForVerticalMirror(transposedPart, ignore);
}

function fixSmudge(part, c, r) {
	const newPart = [];
	for (let rowNum = 0; rowNum < part.length; rowNum++) {
		const row = part[rowNum];
		if (rowNum !== (r - 1)) {
			newPart.push([...row]);
		} else {
			let newRow = [...row];
			newRow[c-1] = newRow[c-1] === '#' ? '.' : '#';
			newPart.push(newRow);
		}
	}
	return newPart;
}

function dayThirteenPartOne() {
	let total = 0;
	for (let i = 0; i < parts.length; i++) {
		const part = parts[i];
		const vMirror = checkPartForVerticalMirror(part);
		if (vMirror) {
			partOneMirrors[i] = { vMirror, hMirror: null };
			total += vMirror;
		} else {
			const hMirror = checkPartForHorizontalMirror(part);
			if (hMirror) {
				partOneMirrors[i] = { vMirror: null, hMirror };
				total += (100 * hMirror);
			} else {
				partOneMirrors[i] = { vMirror: null, hMirror: null };
			}
		}
	}
	console.log('day thirteen part one: total ' + total);
}

function dayThirteenPartTwo() {
	// we're just gonna brute-force this
	let total = 0;
	for (let i = 0; i < parts.length; i++) {
		const part = parts[i];
		let foundReflection = false;
		const rows = part.length,
			cols = part[0].length;
		for (let c = 1; c <= cols; c++) {
			for (let r = 1; r <= rows; r++) {
				const fixedPart = fixSmudge(part, c, r);
				const vMirror = checkPartForVerticalMirror(fixedPart, partOneMirrors[i].vMirror);
				if (vMirror) {
					foundReflection = true;
					total += vMirror;
					break;
				} else {
					const hMirror = checkPartForHorizontalMirror(fixedPart, partOneMirrors[i].hMirror);
					if (hMirror) {
						foundReflection = true;
						total += (100 * hMirror);
						break;
					}
				}
			}
			if (foundReflection) {
				break;
			}
		}
	}
	console.log('day thirteen part two: total ' + total);
}

const parts = parseInput('data/day13/input.txt');
const partOneMirrors = [];
dayThirteenPartOne();
dayThirteenPartTwo();

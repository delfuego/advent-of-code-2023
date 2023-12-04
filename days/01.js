// The trick to part two of this day is that overlapping text number strings like "twone"
// need to be interpreted differently depending on whether you're looking for the FIRST
// number in the line or the LAST one. If looking for the FIRST one, then "twone" means
// "2ne"; if looking for the LAST one, then "twone" means "tw1".

const utils = require('../lib/utils')();

const textNums = {
	'one': 1,
	'two': 2,
	'three': 3,
	'four': 4,
	'five': 5,
	'six': 6,
	'seven': 7,
	'eight': 8,
	'nine': 9,
};

function getFirstNumber(line, dayTwo = false) {
	const textNumKeys = Object.keys(textNums);
	let first = null, firstPos = Infinity;
	for (let i = 0; i < line.length; i++) {
		const char = line.substr(i, 1);
		if (utils.isNumber(char)) {
			if (i < firstPos) {
				first = Number(char);
				firstPos = i;
			}
		}
	}
	if (dayTwo) {
		for (const textNumKey of textNumKeys) {
			const textNumPos = line.indexOf(textNumKey);
			if (textNumPos !== -1 && textNumPos < firstPos) {
				first = textNums[textNumKey];
				firstPos = textNumPos;
			}
		}
	}
	return first;
}

function getLastNumber(line, dayTwo = false) {
	const textNumKeys = Object.keys(textNums);
	let last = null, lastPos = -Infinity;
	for (let i = line.length - 1; i >= 0; i--) {
		const char = line.substr(i, 1);
		if (utils.isNumber(char)) {
			if (i > lastPos) {
				last = Number(char);
				lastPos = i;
			}
		}
	}
	if (dayTwo) {
		// here, have to search for the LAST instance of a test number, so have to iterate
		// until we don't see any more. Example for relevance: threekv33eightninethree
		for (const textNumKey of textNumKeys) {
			const textNumPos = line.lastIndexOf(textNumKey);
			if (textNumPos > lastPos) {
				last = textNums[textNumKey];
				lastPos = textNumPos;
			}
		}
	}
	return last;
}

function dayOnePartOne() {
	const dataLines = utils.getInputLines('data/day01/input.txt');
	let total = 0;
	dataLines.forEach(function (line) {
		const first = getFirstNumber(line, false);
		const last = getLastNumber(line, false);
		const calibrationValue = first * 10 + last;
		total += calibrationValue;
	});
	console.log('day one part one total: ' + total);
}

function dayOnePartTwo() {
	const dataLines = utils.getInputLines('data/day01/input.txt');
	let total = 0;
	dataLines.forEach(function (line) {
		const first = getFirstNumber(line, true);
		const last = getLastNumber(line, true);
		const calibrationValue = first * 10 + last;
		total += calibrationValue;
	});
	console.log('day one part two total: ' + total);
}

dayOnePartOne();
dayOnePartTwo();

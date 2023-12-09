const utils = require('../lib/utils')();

function parseInput(path) {
	const lines = utils.getInputLines(path);
	return lines.map(function (line) { return line.split(' ').map(utils.toNumber); });
}

function calculateDifferences(sequence) {
	const reduction = sequence.reduce(function (diffs, num, i) {
		if (diffs[0] === null) {
			return [ num, [ ] ];
		}
		let d = diffs[1];
		d.push(num - diffs[0]);
		return [num, d];
	}, [ null, [] ]);
	return reduction[1];
}

function isAllZeros(arr) {
	return arr.every(function (num) { return num === 0; });
}

function extrapolateSequencesFromEnd(sequences) {
	for (let i = sequences.length - 1; i--; i >= 0) {
		if (i === sequences.length - 1) {
			sequences[i].push(0);
			continue;
		}
		sequences[i].push(sequences[i][sequences[i].length - 1] + sequences[i+1][sequences[i+1].length - 1]);
	}
	return sequences;
}

function extrapolateSequencesFromStart(sequences) {
	for (let i = sequences.length - 1; i--; i >= 0) {
		if (i === sequences.length - 1) {
			sequences[i].unshift(0);
			continue;
		}
		sequences[i].unshift(sequences[i][0] - sequences[i+1][0]);
	}
	return sequences;
}

function dayNinePartOne() {
	const sequences = parseInput('data/day09/input.txt');
	let nextValuesSum = 0;
	for (const sequence of sequences) {
		let allZeros = false,
			allSequences = [ sequence ],
			seqToTest = sequence;
		while (!allZeros) {
			const diffs = calculateDifferences(seqToTest);
			allSequences.push(diffs);
			allZeros = isAllZeros(diffs);
			seqToTest = diffs;
		}
		const extrapolatedSequences = extrapolateSequencesFromEnd(allSequences);
		nextValuesSum += extrapolatedSequences[0][extrapolatedSequences[0].length - 1];
	}
	console.log(`day nine part one: next value sum ${nextValuesSum}`);
}

function dayNinePartTwo() {
	const sequences = parseInput('data/day09/input.txt');
	let prevValuesSum = 0;
	for (const sequence of sequences) {
		let allZeros = false,
			allSequences = [ sequence ],
			seqToTest = sequence;
		while (!allZeros) {
			const diffs = calculateDifferences(seqToTest);
			allSequences.push(diffs);
			allZeros = isAllZeros(diffs);
			seqToTest = diffs;
		}
		const extrapolatedSequences = extrapolateSequencesFromStart(allSequences);
		prevValuesSum += extrapolatedSequences[0][0];
	}
	console.log(`day nine part one: prev value sum ${prevValuesSum}`);
}

dayNinePartOne();
dayNinePartTwo();

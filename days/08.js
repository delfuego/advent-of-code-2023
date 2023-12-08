const utils = require('../lib/utils')();

function parseInput(path) {
	const lines = utils.getInputLines(path);
	const instructions = lines[0];
	const firstElement = lines[1].split(' = ')[0];
	const map = {};
	for (let i = 1; i < lines.length; i++) {
		const regex = /^(.{3}) = \((.{3}), (.{3})\)$/;
		const [ _, element, L, R ] = lines[i].match(regex);
		map[element] = { i, L, R };
	}
	return { instructions, firstElement, map };
}

function navigateMap(startElements, map, instructions) {
	let finished = false;
	let currentElements = startElements;
	let numSteps = 1;
	const splitInstructions = instructions.split('');
	let start = Date.now();
	while (!finished) {
		const localInstructions = [...splitInstructions];
		while (localInstructions.length > 0) {
			const stepInstruction = localInstructions.shift();
			const nextElements = currentElements.map(function (e) { return map[e][stepInstruction]; });
			if (nextElements.filter(function (e) { return e[2] === 'Z'; }).length === startElements.length) {
				finished = true;
				break;
			}
			if (numSteps % 10000000 === 0) {
				const now = Date.now();
				console.log('10000000 steps: ' + (now - start) + 'ms (' + numSteps + ' total so far)');
				start = now;
			}
			currentElements = nextElements;
			numSteps++;
		}
	}
	return numSteps;
}

function navigateMapToEnd(start, map, splitInstructions) {
	let finished = false;
	let numSteps = 1;
	let currentElement = start;
	while (!finished) {
		const localInstructions = [...splitInstructions];
		while (localInstructions.length > 0) {
			const stepInstruction = localInstructions.shift();
			currentElement = map[currentElement][stepInstruction];
			if (currentElement[2] === 'Z') {
				finished = true;
				break;
			}
			numSteps++;
		}
	}
	return [ numSteps, currentElement ];
}

function navigateMapPartTwo(startElements, map, instructions) {
	const splitInstructions = instructions.split('');
	const numStepsToZ = startElements.map(function (element) { return navigateMapToEnd(element, map, splitInstructions)[0]; });
	return numStepsToZ;
}

function primeFactors(n) {
	const factors = [];
	let divisor = 2;
	while (n >= 2) {
		if (n % divisor == 0) {
			factors.push(divisor);
			n = n / divisor;
		} else {
			divisor++;
		}
	}
	return factors;
}

function dayEightPartOne() {
	const input = parseInput('data/day08/input.txt');
	const numSteps = navigateMap(['AAA'], input.map, input.instructions);
	console.log(`day eight part one: steps ${numSteps}`);
}

function dayEightPartTwo() {
	const input = parseInput('data/day08/input.txt');
	const startElements = Object.keys(input.map).filter(function (e) { return e.endsWith('A'); });
	const numSteps = navigateMapPartTwo(startElements, input.map, input.instructions);
	const factors = numSteps.map(function (num) { return primeFactors(num); });
	let finalFactors = factors.shift();
	while (factors.length > 0) {
		let testingFactors = factors.shift();
		for (const factor of finalFactors) {
			const factorLoc = testingFactors.indexOf(factor);
			if (factorLoc > -1) {
				testingFactors.splice(factorLoc, 1);
			}
		}
		finalFactors = [...finalFactors, ...testingFactors];
	}
	let finalRounds = 1;
	for (const factor of finalFactors) {
		finalRounds = finalRounds * factor;
	}

	console.log(`day eight part two: steps ${finalRounds}`);
}

dayEightPartOne();
dayEightPartTwo();

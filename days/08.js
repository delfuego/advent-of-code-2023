const utils = require('../lib/utils')();

function parseInput(path) {
	const lines = utils.getInputLines(path),
		instructions = lines[0],
		firstElement = lines[1].split(' = ')[0],
		map = {};
	for (let i = 1; i < lines.length; i++) {
		const regex = /^(.{3}) = \((.{3}), (.{3})\)$/,
			[ _, element, L, R ] = lines[i].match(regex);
		map[element] = { i, L, R };
	}
	return { instructions, firstElement, map };
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

function lowestCommonMultiple(nums) {
	const factors = nums.map(function (num) { return primeFactors(num); });
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
	let lcm = 1;
	for (const factor of finalFactors) {
		lcm = lcm * factor;
	}
	return lcm;
}

function getNumStepsToEnd(start, map, splitInstructions, partTwo = false) {
	let finished = false,
		numSteps = 1,
		currentElement = start;
	while (!finished) {
		const localInstructions = [...splitInstructions];
		while (localInstructions.length > 0) {
			const stepInstruction = localInstructions.shift();
			currentElement = map[currentElement][stepInstruction];
			if ((partTwo && currentElement[2] === 'Z') || currentElement === 'ZZZ') {
				finished = true;
				break;
			}
			numSteps++;
		}
	}
	return numSteps;
}

function navigateMap(startElements, map, splitInstructions, partTwo) {
	const numSteps = startElements.map(function (element) { return getNumStepsToEnd(element, map, splitInstructions, partTwo); });
	return numSteps;
}

function dayEightPartOne(map, splitInstructions) {
	const numSteps = navigateMap(['AAA'], map, splitInstructions);
	console.log(`day eight part one: steps ${numSteps[0]}`);
}

// Note that part two is simpler in this exercise than it could be. The input appears to have been
// kindly crafted such that each of the multiple paths forms a complete loop -- as in, the step after
// you get to the final element (the one that ends with Z) is the first element with the same next
// direction. SO, that makes this into a challenge where you just have to find the lowest common
// multiple of all the number of steps that each path requires to get to the final element.
function dayEightPartTwo(map, splitInstructions) {
	const startElements = Object.keys(input.map).filter(function (e) { return e.endsWith('A'); }),
		numSteps = navigateMap(startElements, map, splitInstructions, true),
		lcm = lowestCommonMultiple(numSteps);
	console.log(`day eight part two: steps ${lcm}`);
}

const input = parseInput('data/day08/input.txt');
const splitInstructions = input.instructions.split('');
dayEightPartOne(input.map, splitInstructions);
dayEightPartTwo(input.map, splitInstructions);

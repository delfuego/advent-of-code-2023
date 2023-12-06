const utils = require('../lib/utils')();

function parseInputForPartOne(path) {
	const lines = utils.getInputLines(path);
	const times = lines[0].split(':')[1].trimStart().split(/ +/).map(utils.toNumber);
	const distances = lines[1].split(':')[1].trimStart().split(/ +/).map(utils.toNumber);
	return({ times, distances });
}

function parseInputForPartTwo(path) {
	const lines = utils.getInputLines(path);
	const time = Number(lines[0].split(':')[1].trimStart().replaceAll(/ +/g, ''));
	const distance = Number(lines[1].split(':')[1].trimStart().replaceAll(/ +/g, ''));
	return({ time, distance });
}

function getNumberOfWinningOptions(time, record) {
	// This is based on:
	//	1. There are always (time + 1) number of different [ time button pushed, distance boat traveled ] permutations
	//	2. The distance always starts at 0 and goes up through the midpoint of the times, and then comes back down
	//	3. The distances are always mirrored, e.g., the first and last option always have the same distance traveled,
	//			the second and second-to-last always have the same distance traveled, etc.
	//	4. This means that you can start calculating distances traveled from the beginning, and count up the number of
	//			non-winning distances until you hit a winning distance. Then, you can double the number of non-winning
	//			distances, subtract it from the total number of possible permutations, and you have your number of winning
	//			distances.
	let numLosingOptions = 0;
	let foundWinningOption = false,
		i = 0;
	while (foundWinningOption === false) {
		const speed = i;
		const duration = time - i;
		const distance = duration * speed;
		if (distance <= record) {
			numLosingOptions++;
			i++;
			continue;
		}
		foundWinningOption = true;
	}
	return (time + 1) - (numLosingOptions * 2);
}

function daySixPartOne() {
	const inputData = parseInputForPartOne('data/day06/input.txt');
	let marginOfError = 1;
	for (let i = 0; i < inputData.times.length; i++) {
		const time = inputData.times[i],
			record = inputData.distances[i];
		const numberOfWinningOptions = getNumberOfWinningOptions(time, record);
		marginOfError = marginOfError * numberOfWinningOptions;
	}
	console.log(`day six part one: margin of error ${marginOfError}`);
}

function daySixPartTwo() {
	const inputData = parseInputForPartTwo('data/day06/input.txt');
	const numWinningOptions = getNumberOfWinningOptions(inputData.time, inputData.distance);
	console.log(`day six part two: number of options ${numWinningOptions}`);
}

daySixPartOne();
daySixPartTwo();

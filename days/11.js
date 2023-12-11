const utils = require('../lib/utils')();

function parseInput(path) {
	const lines = utils.getInputLines(path);
	return lines.map(function (line) { return line.split(''); });
}

function findEmptyRowsAndColumns(universe) {
	let r = [],
		c = [];
	universe.forEach(function (line, i) {
		if (line.every(function (char) { return char === '.'; })) {
			r.push(i); // push an extra copy of this line
		}
	});
	const transposedUniverse = utils.transposeMatrix(universe);
	transposedUniverse.forEach(function (line, i) {
		if (line.every(function (char) { return char === '.'; })) {
			c.push(i);
		}
	});
	return [r, c];
}

function findGalaxies(universe) {
	let galaxies = [];
	universe.forEach(function (line, r) {
		line.forEach(function (char, c) {
			if (char === '#') {
				galaxies.push([r, c]);
			}
		});
	});
	return galaxies;
}

function expandGalaxies(galaxies, emptyRows, emptyCols, rowAdditive, colAdditive) {
	return galaxies.map(function (galaxy) {
		const [ r, c ] = galaxy;
		let newRow = r,
			newCol = c;
		for (const row of emptyRows) {
			if (r > row) {
				newRow+= rowAdditive;
			}
		}
		for (const col of emptyCols) {
			if (c > col) {
				newCol+= colAdditive;
			}
		}
		return [ newRow, newCol ];
	});
}

function getGalaxyPairs(galaxies) {
	let pairs = [];
	for (let f = 0; f < galaxies.length; f++) {
		for (let s = f+1; s < galaxies.length; s++) {
			pairs.push([ galaxies[f], galaxies[s] ]);
		}
	}
	return pairs;
}

function getPairDistance(pair) {
	return (Math.abs(pair[1][1] - pair[0][1]) + Math.abs(pair[1][0] - pair[0][0]));
}

function dayElevenPartOne() {
	const [ emptyRows, emptyCols ] = findEmptyRowsAndColumns(universe);
	const galaxies = findGalaxies(universe);
	const expandedGalaxies = expandGalaxies(galaxies, emptyRows, emptyCols, 1, 1);
	const pairs = getGalaxyPairs(expandedGalaxies);
	let totalDistance = 0;
	pairs.forEach(function (pair) {
		const distance = getPairDistance(pair);
		totalDistance += distance;
	});
	console.log(`day eleven part one: total distance ${totalDistance}`);
}

function dayElevenPartTwo() {
	const [ emptyRows, emptyCols ] = findEmptyRowsAndColumns(universe);
	const galaxies = findGalaxies(universe);
	const expandedGalaxies = expandGalaxies(galaxies, emptyRows, emptyCols, 999999, 999999);
	const pairs = getGalaxyPairs(expandedGalaxies);
	let totalDistance = 0;
	pairs.forEach(function (pair) {
		let distance = getPairDistance(pair);
		totalDistance += distance;
	});
	console.log(`day eleven part two: total distance ${totalDistance}`);
}

let universe = parseInput('data/day11/input.txt');
dayElevenPartOne();
dayElevenPartTwo();

const utils = require('../lib/utils')();

function parseInput(path) {
	const lines = utils.getInputLines(path);
	return lines.map(function (line) { return line.split(''); });
}

class GardenMap {

	constructor(input) {
		this.gardenPlots = [];
		this.rocks = [];
		this.startingPosition = null;
		this.mapMaxRowIndex = null;
		this.mapMaxColIndex = null;
		this.possibilitiesCache = {};
		this.parseInputIntoMap(input);
	}

	getDiamondPositions(centerPos, steps) {
		let positions = [];
		for (let i = steps; i > 0; i--) {
			if (i === steps) {
				positions.push([ centerPos[0] - i,  centerPos[1] ]);
			} else {
				positions.push([ centerPos[0] - i, centerPos[1] - (steps - i) ]);
				positions.push([ centerPos[0] - i, centerPos[1] + (steps - i) ]);
			}
		}
		positions.push([ centerPos[0], centerPos[1] - steps ]);
		positions.push([ centerPos[0], centerPos[1] + steps ]);
		for (let i = 0; i < steps; i++) {
			if (i === steps - 1) {
				positions.push([ centerPos[0] + i + 1,  centerPos[1] ]);
			} else {
				positions.push([ centerPos[0] + i + 1, centerPos[1] - (steps - i - 1) ]);
				positions.push([ centerPos[0] + i + 1, centerPos[1] + (steps - i - 1) ]);
			}
		}
		return positions;
	}

	getNumRocks(centerPos, steps) {
		const positions = this.getDiamondPositions(centerPos, steps);
		let numRocks = 0;
		for (const pos of positions) {
			const [ r, c ] = pos;
			let equivR = r % (this.mapMaxRowIndex + 1);
			if (equivR < 0) {
				equivR = equivR + this.mapMaxRowIndex + 1;
			}
			let equivC = c % (this.mapMaxColIndex + 1);
			if (equivC < 0) {
				equivC = equivC + this.mapMaxColIndex + 1;
			}
			if (this.rocks[equivR].has(equivC)) {
				numRocks++;
			}
		}
		return numRocks;
	}

	parseInputIntoMap(input) {
		this.mapMaxRowIndex = input.length - 1;
		for (let r = 0; r < input.length; r++) {
			this.mapMaxRowIndex = r;
			const row = input[r];
			if (this.gardenPlots[r] === undefined) {
				this.gardenPlots[r] = new Set();
			}
			if (this.rocks[r] === undefined) {
				this.rocks[r] = new Set();
			}
			if (row.length - 1 > this.mapMaxColIndex) {
				this.mapMaxColIndex = row.length - 1;
			}
			for (let c = 0; c < row.length; c++) {
				const char = row[c];
				switch (char) {
					case '.':
						this.gardenPlots[r].add(c);
						break;
					case '#':
						this.rocks[r].add(c);
						break;
					case 'S':
						this.startingPosition = [ r, c ];
						this.gardenPlots[r].add(c);
						break;
				}
			}
		}
	}

	getStartingPosition() {
		return this.startingPosition;
	}

	getMapMaxRowIndex() {
		return this.mapMaxRowIndex;
	}

	getMapMaxColIndex() {
		return this.mapMaxColIndex;
	}

	get(pos) {
		const [ r, c ] = pos;
		if (this.gardenPlots[r].has(c)) {
			return '.';
		} else if (this.rocks[r].has(c)) {
			return '#';
		}
		return null;
	}

	getStepPossibilitiesFiniteMap(pos) {
		const [ r, c ] = pos;
		if (this.possibilitiesCache[r] && this.possibilitiesCache[r][c]) {
			return this.possibilitiesCache[r][c];
		}
		let possibilities = [];
		// up
		if (r > 0 && this.gardenPlots[r-1].has(c)) {
			possibilities.push([ r-1, c ]);
		}
		// down
		if (r < this.mapMaxRowIndex && this.gardenPlots[r+1].has(c)) {
			possibilities.push([ r+1, c ]);
		}
		// left
		if (c > 0 && this.gardenPlots[r].has(c-1)) {
			possibilities.push([ r, c-1 ]);
		}
		// right
		if (c < this.mapMaxColIndex && this.gardenPlots[r].has(c+1)) {
			possibilities.push([ r, c+1 ]);
		}
		if (!this.possibilitiesCache[r]) {
			this.possibilitiesCache[r] = [];
		}
		this.possibilitiesCache[r][c] = possibilities;
		return possibilities;
	}

	getStepPossibilitiesInfiniteMap(pos) {
		const [ r, c ] = pos;

		// check cache
		let equivR = r % (this.mapMaxRowIndex + 1);
		if (equivR < 0) {
			equivR = equivR + this.mapMaxRowIndex + 1;
		}
		let equivC = c % (this.mapMaxColIndex + 1);
		if (equivC < 0) {
			equivC = equivC + this.mapMaxColIndex + 1;
		}
		let cachedPossibilities = this.possibilitiesCache[equivR] ? this.possibilitiesCache[equivR][equivC] : null;
		let transformedCachedPossibilities;
		if (cachedPossibilities) {
			let rChg = 0,
				cChg = 0;
			if (r < 0 || r > this.mapMaxRowIndex) {
				rChg = r - equivR;
			}
			if (c < 0 || c > this.mapMaxColIndex) {
				cChg = c - equivC;
			}
			if (rChg !== 0 || cChg !== 0) {
				transformedCachedPossibilities = cachedPossibilities.map(function (pos) { return [ pos[0] + rChg, pos[1] + cChg ]; });
				return transformedCachedPossibilities;
				// console.dir({ r, c, equivR, equivC, cachedPossibilities, transformedCachedPossibilities: tc, possibilities });
			}
			return cachedPossibilities;
		}

		// NOTE that after about 15 steps, we never hit this code again; everything is cached. So all optimizations
		// need to be above.
		let possibilities = [];

		// up
		let uRow = equivR - 1;
		if (uRow < 0) {
			uRow = this.mapMaxRowIndex;
		}
		if (this.gardenPlots[uRow].has(equivC)) {
			possibilities.push([ r-1, c ]);
		}

		// down
		let dRow = equivR + 1;
		if (dRow > this.mapMaxRowIndex) {
			dRow = 0;
		}
		if (this.gardenPlots[dRow].has(equivC)) {
			possibilities.push([ r+1, c ]);
		}

		// left
		let lCol = equivC - 1;
		if (lCol < 0) {
			lCol = this.mapMaxColIndex;
		}
		if (this.gardenPlots[equivR].has(lCol)) {
			possibilities.push([ r, c-1 ]);
		}

		// right
		let rCol = equivC + 1;
		if (rCol > this.mapMaxColIndex) {
			rCol = 0;
		}
		if (this.gardenPlots[equivR].has(rCol)) {
			possibilities.push([ r, c+1 ]);
		}

		if (!this.possibilitiesCache[r]) {
			this.possibilitiesCache[r] = [];
		}
		this.possibilitiesCache[r][c] = possibilities;
		return possibilities;
	}
}

class PossibilitiesMap {

	constructor() {
		this.map = {};
	}

	add(pos) {
		if (!this.map[pos[0]]) {
			this.map[pos[0]] = new Set();
		}
		this.map[pos[0]].add(pos[1]);
	}

	addAll(allPos) {
		for (const pos of allPos) {
			this.add(pos);
		}
	}

	size() {
		let p = 0;
		Object.values(this.map).forEach(function (r) {
			p += r.size;
		});
		return p;
	}

	has(pos) {
		// console.dir({ pos, mapR: this.map[pos[0]] })
		return (this.map[pos[0]] && this.map[pos[0]].has(pos[1]));
	}

	getRowKeys() {
		return Object.keys(this.map).map(function (k) { return Number(k); });
	}

	getRow(key) {
		return this.map[key];
	}
}

function dayTwentyOnePartOne() {
	const numSteps = 64;
	const gardenMap = new GardenMap(input);
	const startingPosition = gardenMap.getStartingPosition();
	let currentPossibilitiesMap = new PossibilitiesMap();
	currentPossibilitiesMap.add(startingPosition);
	for (let s = 0; s < numSteps; s++) {
		let newPossibilities = [],
			newPossibilitiesMap = new PossibilitiesMap();
		currentPossibilitiesMap.getRowKeys().forEach(function (cpr) {
			const row = currentPossibilitiesMap.getRow(cpr);
			if (row) {
				row.forEach(function (cpc) {
					const p = gardenMap.getStepPossibilitiesFiniteMap([ Number(cpr), cpc ]);
					newPossibilities = [...newPossibilities, ...p];
				});
			}
		});
		newPossibilitiesMap.addAll(newPossibilities);
		currentPossibilitiesMap = newPossibilitiesMap;
	}
	console.log(`day twenty one part one: ${currentPossibilitiesMap.size()} possibilities after ${numSteps} steps`);
}

function dayTwentyOnePartTwo() {
	const numSteps = 500;
	const gardenMap = new GardenMap(input);
	const startingPosition = gardenMap.getStartingPosition();
	let currentPossibilitiesMap = new PossibilitiesMap();
	currentPossibilitiesMap.add(startingPosition);
	let start = Date.now();
	for (let s = 0; s < numSteps; s++) {
		if (s % 20 === 19) {
			let dur = Date.now() - start;
			console.log(`taking step ${(s+1).toLocaleString()}... (last duration ${dur}ms)`);
			start = Date.now();
		}
		let newPossibilitiesMap = new PossibilitiesMap();
		currentPossibilitiesMap.getRowKeys().forEach(function (cpr) {
			const row = currentPossibilitiesMap.getRow(cpr);
			row.forEach(function (cpc) {
				const possibilities = gardenMap.getStepPossibilitiesInfiniteMap([ cpr, cpc ]);
				newPossibilitiesMap.addAll(possibilities);
			});
		});
		console.dir({ step: s+1 });
		currentPossibilitiesMap = newPossibilitiesMap;
	}
	console.log(`day twenty one part two: ${currentPossibilitiesMap.size()} possibilities after ${numSteps} steps`);
}

const input = parseInput('data/day21/input-test.txt');
// dayTwentyOnePartOne();
dayTwentyOnePartTwo();

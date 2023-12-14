const utils = require('../lib/utils')();

class PermMap {

	constructor() {
		this.map = {};
	}

	objectToKey(group, amount) {
		return '' + group + '|' + amount;
	}

	keyToObject(key) {
		return key.split('|').map(utils.toNumber);
	}

	add(group, amount, permutations) {
		const h = this.objectToKey(group, amount);
		this.map[h] = permutations;
	}

	increment(group, amount, permutations) {
		let t = this.get(group, amount);
		if (!t) {
			this.add(group, amount, permutations);
		} else {
			this.add(group, amount, t + permutations);
		}
	}

	get(group, amount) {
		return this.map[this.objectToKey(group, amount)];
	}

	getAllKeys() {
		return Object.keys(this.map).map(this.keyToObject);
	}

	clear() {
		this.map = {};
	}
}

function parseInput(path) {
	const lines = utils.getInputLines(path);
	return lines.map(function (line) { return line.split(' '); }).map(function (parts) { return [ parts[0], parts[1].split(',').map(utils.toNumber) ]; });
}

function expandInputForPartTwo(rowsInfo) {
	const newRowsInfo = rowsInfo.map(function (ri) {
		return [
			ri[0] + '?' + ri[0] + '?' + ri[0] + '?' + ri[0] + '?' + ri[0],
			[...ri[1], ...ri[1], ...ri[1], ...ri[1], ...ri[1]],
		];
	});
	return newRowsInfo;
}

function compute(map, allGroups) {

	// OMFG this was impossible to figure out without wracking my brain in knots. This helped a LOT:
	// https://www.reddit.com/r/adventofcode/comments/18hbjdi/2023_day_12_part_2_this_image_helped_a_few_people/

	function isValid(g, a) {
		return g === allGroups.length || (g === (allGroups.length - 1) && a === allGroups[g]);
	}

	const permMap = new PermMap();
	permMap.add(0, 0, 1);
	for (const c of map) {
		let next = [];
		const permMapKeys = permMap.getAllKeys();
		for (const permMapKey of permMapKeys) {
			const g = permMapKey[0],
				a = permMapKey[1],
				p = permMap.get(g, a);
			if (c !== '#') {
				if (a === 0) {
					next.push([g, a, p]);
				} else if (a === allGroups[g]) {
					next.push([g+1, 0, p]);
				}
			}
			if (c !== '.') {
				if (g < allGroups.length && a < allGroups[g]) {
					next.push([g, a+1, p]);
				}
			}
		}
		permMap.clear();
		for (const gap of next) {
			const [ g, a, p ] = gap;
			permMap.increment(g, a, p);
		}
	}
	let sum = 0;
	const permMapKeys = permMap.getAllKeys();
	for (const permMapKey of permMapKeys) {
		if (isValid(permMapKey[0], permMapKey[1])) {
			sum += permMap.get(permMapKey[0], permMapKey[1]);
		}
	}
	return sum;
}

function dayTwelvePartOne() {
	let totalCount = 0;
	for (const rowInfo of rowsInfo) {
		let [ map, dLens ] = rowInfo;
		const matchingMaps = compute(map, dLens);
		totalCount += matchingMaps;
	}
	console.log('day twelve part one: ' + totalCount);
}

function dayTwelvePartTwo() {
	let totalCount = 0;
	const expandedRowsInfo = expandInputForPartTwo(rowsInfo);
	for (const rowInfo of expandedRowsInfo) {
		let [ map, dLens ] = rowInfo;
		const j = compute(map, dLens);
		totalCount += j;
	}
	console.log('day twelve part two: ' + totalCount);
}

const rowsInfo = parseInput('data/day12/input.txt');
dayTwelvePartOne();
dayTwelvePartTwo();

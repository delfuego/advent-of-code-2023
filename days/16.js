const utils = require('../lib/utils')();

class PathCache {

	constructor() {
		this.cache = {};
		this.posSet = new Set();
	}

	add(pos, dirFrom) {
		this.cache[this.objectToKey(pos, dirFrom)] = true;
		this.posSet.add(pos.join(','));
	}

	objectToKey(pos, dirFrom) {
		return pos.join(',') + dirFrom;
	}

	has(pos, dirFrom) {
		const k = this.objectToKey(pos, dirFrom);
		return this.cache[k] ? true : false;
	}

	positionCount() {
		return this.posSet.size;
	}
}

function parseInput(path) {
	const lines = utils.getInputLines(path);
	return lines.map(function (line) { return line.split(''); });
}

function c(pos) {
	return map[pos[0]][pos[1]];
}

function npos(pos, dirFrom, cache) {
	// console.dir({ pos, dirFrom });
	if (cache.has(pos, dirFrom)) {
		return [];
	}
	cache.add(pos, dirFrom);
	const ch = c(pos);
	let nextPos = [];
	switch (ch) {
		case '.':
			if (dirFrom === 'l') {
				nextPos.push([0, 1]);
			} else if (dirFrom === 'r') {
				nextPos.push([0, -1]);
			} else if (dirFrom === 'u') {
				nextPos.push([1, 0]);
			} else {
				nextPos.push([-1, 0]);
			}
			break;
		case '|':
			if (dirFrom === 'l' || dirFrom === 'r') {
				nextPos.push([-1, 0]);
				nextPos.push([1, 0]);
			} else if (dirFrom === 'u') {
				nextPos.push([1, 0]);
			} else {
				nextPos.push([-1, 0]);
			}
			break;
		case '-':
			if (dirFrom === 'l') {
				nextPos.push([0, 1]);
			} else if (dirFrom === 'r') {
				nextPos.push([0, -1]);
			} else {
				nextPos.push([0, 1]);
				nextPos.push([0, -1]);
			}
			break;
		case '/':
			if (dirFrom === 'l') {
				nextPos.push([-1, 0]);
			} else if (dirFrom === 'r') {
				nextPos.push([1, 0]);
			} else if (dirFrom === 'u') {
				nextPos.push([0, -1]);
			} else {
				nextPos.push([0, 1]);
			}
			break;
		case '\\':
			if (dirFrom === 'l') {
				nextPos.push([1, 0]);
			} else if (dirFrom === 'r') {
				nextPos.push([-1, 0]);
			} else if (dirFrom === 'u') {
				nextPos.push([0, 1]);
			} else {
				nextPos.push([0, -1]);
			}
			break;
	}
	let info = [];
	for (const np of nextPos) {
		let dirFrom;
		if (np[0] === 0) {
			if (np[1] === 1) {
				dirFrom = 'l';
			} else {
				dirFrom = 'r';
			}
		} else if (np[0] === 1) {
			dirFrom = 'u';
		} else {
			dirFrom = 'd';
		}
		const row = pos[0] + np[0],
			col = pos[1] + np[1];
		if (row >= 0 && col >= 0 && row <= map.length - 1 && col <= map[0].length - 1) {
			const ch = c([row, col]);
			info.push({ ch, np: [ row, col ], dirFrom });
		}
	}
	return info;
}

function daySixteenPartOne() {
	const cache = new PathCache();
	let nextInfo = npos([ 0, 0 ], 'l', cache);
	while (nextInfo.length > 0) {
		let nextNextInfo = [];
		for (const info of nextInfo) {
			const n = npos(info.np, info.dirFrom, cache);
			nextNextInfo = [...nextNextInfo, ...n];
		}
		nextInfo = nextNextInfo;
	}
	console.log(`day sixteen part one: ${cache.positionCount()} energized tiles`);
}

function daySixteenPartTwo() {
	let maxEnergizedTiles = 0,
		maxInfo;
	for (let r = 0; r < map.length; r++) {
		for (let c = 0; c < map[0].length; c++) {
			let dirsFrom = [];
			if (r > 0 && r < map.length - 1 && c !== 0 && c !== map[0].length - 1) {
				continue;
			}
			if (r === 0) {
				dirsFrom.push('u');
				if (c === 0) {
					dirsFrom.push('l');
				} else if (c === map[0].length - 1) {
					dirsFrom.push('r');
				}
			} else if (r === map.length - 1) {
				dirsFrom.push('d');
				if (c === 0) {
					dirsFrom.push('l');
				} else if (c === map[0].length - 1) {
					dirsFrom.push('r');
				}
			} else if (c === 0) {
				dirsFrom.push('l');
			} else if (c === map[0].length - 1) {
				dirsFrom.push('r');
			}
			for (const df of dirsFrom) {
				const cache = new PathCache();
				let nextInfo = npos([ r, c ], df, cache);
				while (nextInfo.length > 0) {
					let nextNextInfo = [];
					for (const info of nextInfo) {
						const n = npos(info.np, info.dirFrom, cache);
						nextNextInfo = [...nextNextInfo, ...n];
					}
					nextInfo = nextNextInfo;
				}
				const energizedTiles = cache.positionCount();
				if (energizedTiles > maxEnergizedTiles) {
					maxEnergizedTiles = energizedTiles;
					maxInfo = { r, c, df, energizedTiles };
				}
			}
		}
	}
	console.log(`day sixteen part two: ${maxEnergizedTiles} energized tiles starting at [ ${maxInfo.r}, ${maxInfo.c} ]`);
}

const map = parseInput('data/day16/input.txt');
daySixteenPartOne();
daySixteenPartTwo();

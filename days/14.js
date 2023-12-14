const utils = require('../lib/utils')();

function parseInput(path) {
	const lines = utils.getInputLines(path);
	return lines.map(function (line) { return line.split(''); });
}

function dumpLines(lines) {
	lines.forEach(function (line) { console.log(line.join('')); });
	console.log('');
}

function tiltPlatform(lines, dir) {
	if (dir === 'north') {
		const transposedLines = utils.transposeMatrix(lines);
		const newLines = transposedLines.map(function (line) { return shiftRocksInLine(line, 0); });
		return utils.transposeMatrix(newLines);
	} else if (dir === 'south') {
		const transposedLines = utils.transposeMatrix(lines);
		const newLines = transposedLines.map(function (line) { return shiftRocksInLine(line, 1); });
		return utils.transposeMatrix(newLines);
	} else if (dir === 'east') {
		const newLines = lines.map(function (line) { return shiftRocksInLine(line, 1); });
		return newLines;
	} else if (dir === 'west') {
		const newLines = lines.map(function (line) { return shiftRocksInLine(line, 0); });
		return newLines;
	}
	return null;
}

function shiftRocksInLine(line, dir) {
	// dir = 0 (to the start of the line) or 1 (to the end of the line)
	let finalLine = [];
	let lineToTest = line;
	for (let run = 0; run < line.length - 1; run++) {
		let runLine = [];
		let i = lineToTest.length;
		let c1 = lineToTest[0];
		while (i >= 2) {
			const c2 = lineToTest[lineToTest.length - i + 1],
				slice = c1 + c2;
			let newSlice = slice;
			if (dir === 0 && slice === '.O') {
				newSlice = 'O.';
			} else if (dir === 1 && slice === 'O.') {
				newSlice = '.O';
			}
			runLine.push(newSlice[0]);
			c1 = newSlice[1];
			i--;
			if (i === 1) {
				runLine.push(newSlice[1]);
			}
		}
		if (run === line.length - 2) {
			finalLine = [...runLine, ...finalLine];
		} else {
			finalLine.unshift(runLine[runLine.length - 1]);
			lineToTest = runLine.slice(0, runLine.length - 1);
		}
	}
	return finalLine;
}

function runCycle(lines) {
	let newLines = lines;
	newLines = tiltPlatform(newLines, 'north');
	newLines = tiltPlatform(newLines, 'west');
	newLines = tiltPlatform(newLines, 'south');
	newLines = tiltPlatform(newLines, 'east');
	return newLines;
}

function getMapAsString(lines) {
	let r = '';
	for (const l of lines) {
		r += l.join('') + '|';
	}
	r = r.substring(0, r.length - 1);
	const regex = /\.+/g;
	r = r.replaceAll(regex, function (match) { return match.length; });
	return r;
}

function getStringAsMap(str) {
	const lines = str.split('|');
	const regex = /\d+/g;
	return lines.map(function (l) { return l.replaceAll(regex, function (match) { const n = Number(match); return Array(n+1).join('.'); }).split(''); });
}

function dayFourteenPartOne() {
	const tiltedLines = tiltPlatform(lines, 'north');
	const numLines = tiltedLines.length;
	let total = 0;
	for (let i = 0; i < numLines; i++) {
		const rocks = tiltedLines[i].filter(function (c) { return c === 'O'; });
		total += (numLines - i) * rocks.length;
	}
	console.log('day fourteen part one: total ' + total);
}

function dayFourteenPartTwo() {
	// runs in 4.9s on my M1 Max
	let cycledLines = lines;
	let cache = {};
	let figuredOutCache = false;
	const numRounds = 1000000000;
	for (let i = 0; i < numRounds; i++) {
		cycledLines = runCycle(cycledLines);
		const cacheKey = getMapAsString(cycledLines);
		if (! figuredOutCache && cache[cacheKey]) {
			figuredOutCache = true;
			const startOfRepeat = cache[cacheKey];
			const sizeOfRepeat = i - startOfRepeat;
			const j = (numRounds - startOfRepeat) % sizeOfRepeat;
			let theoreticalEnd;
			for (const k of Object.keys(cache)) {
				if (cache[k] === startOfRepeat + j - 1) {
					theoreticalEnd = k;
					break;
				}
			}
			if (theoreticalEnd) {
				cycledLines = getStringAsMap(theoreticalEnd);
				break;
			}
		}
		cache[cacheKey] = i;
	}
	const numLines = cycledLines.length;
	let total = 0;
	for (let i = 0; i < numLines; i++) {
		const rocks = cycledLines[i].filter(function (c) { return c === 'O'; });
		total += (numLines - i) * rocks.length;
	}
	console.log('day fourteen part two: total ' + total);
}

const lines = parseInput('data/day14/input.txt');
let d = Date.now();
dayFourteenPartOne();
console.log('time: ' + (Date.now() - d) + 'ms');
d = Date.now();
dayFourteenPartTwo();
console.log('time: ' + (Date.now() - d) + 'ms');

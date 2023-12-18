const utils = require('../lib/utils')();
const dirNumMap = {
	0: 'R',
	1: 'D',
	2: 'L',
	3: 'U',
};

function parseInput(path) {
	const lines = utils.getInputLines(path);
	return lines.map(function (line) { return line.split(' '); }).map(function (parts) { return { dir: parts[0], len: Number(parts[1]), color: parts[2].substr(2, parts[2].length - 3) }; });
}

function convertInstructionsForPartTwo(instructions) {
	return instructions.map(function (instruction) {
		const hexNum = instruction.color.substring(0, 5),
			directionNum = instruction.color.substring(5);
		return {
			dir: dirNumMap[directionNum],
			len: Number('0x' + hexNum),
		};
	});
}

function initializeMaps() {
	const vertices = [ [0, 0] ];
	const rows = 1;
	const cols = 1;
	return { vertices, rows, cols };
}

function makeEdges(vertices) {
	let edges = [];
	for (let i = 0; i < vertices.length - 1; i++) {
		const a = vertices[i],
			b = vertices[i+1];
		if (a[0] < b[0]) {
			edges.push([a, b]);
		} else if (a[0] > b[0]) {
			edges.push([b, a]);
		} else if (a[1] < b[1]) {
			edges.push([a, b]);
		} else {
			edges.push([b, a]);
		}
	}
	return edges;
}

function shiftVertices(vertices, rowsAbove, colsLeft) {
	if (rowsAbove || colsLeft) {
		vertices.forEach(function (v) {
			v[0] += rowsAbove;
			v[1] += colsLeft;
		});
	}
}

function executeInstruction(instruction, maps, currLoc) {
	let rows = maps.rows,
		cols = maps.cols,
		vertices = maps.vertices;
	let endRow,
		endCol,
		addlRowsNeeded = 0,
		addlColsNeeded = 0;
	switch (instruction.dir) {
		case 'R':
			endCol = currLoc[1] + instruction.len;
			if (endCol + 1 > cols) {
				cols = endCol + 1;
			}
			currLoc[1] = currLoc[1] + instruction.len;
			break;
		case 'L':
			addlColsNeeded = instruction.len - currLoc[1];
			if (addlColsNeeded > 0) {
				cols += addlColsNeeded;
				shiftVertices(vertices, 0, addlColsNeeded);
				currLoc[1] = currLoc[1] + addlColsNeeded;
			}
			currLoc[1] = currLoc[1] - instruction.len;
			break;
		case 'U':
			addlRowsNeeded = instruction.len - currLoc[0];
			if (addlRowsNeeded > 0) {
				rows += addlRowsNeeded;
				shiftVertices(vertices, addlRowsNeeded, 0);
				currLoc[0] = currLoc[0] + addlRowsNeeded;
			}
			currLoc[0] = currLoc[0] - instruction.len;
			break;
		case 'D':
			endRow = currLoc[0] + instruction.len;
			if (endRow + 1 > rows) {
				rows = endRow + 1;
			}
			currLoc[0] = currLoc[0] + instruction.len;
			break;
	}
	vertices.push([ currLoc[0], currLoc[1] ]);
	return { vertices, rows, cols };
}

function compareNums(a, b) {
	return a - b;
}

function comparePositions(a, b) {
	return a[0] - b[0];
}

function getHoleCount(r, edges) {
	const debugRow = -1;
	let ixns = [],
		paths = [];
	for (const edge of edges) {
		if (edge[0][0] == edge[1][0]) {
			paths.push([edge[0][1], edge[1][1]]);
		} else if (edge[0][0] <= r && edge[1][0] > r) {
			ixns.push(edge[0][1]);
		}
	}
	ixns.sort(compareNums);
	paths.sort(comparePositions);
	let n = 0;
	for (let i = 0; i < ixns.length; i = i + 2) {
		n += (ixns[i+1] - ixns[i] + 1);
	}

	if (r === debugRow) {
		console.dir({ ixns, paths, n });
	}

	for (const p of paths) {
		const pStart = p[0],
			pEnd = p[1],
			ixnLoc = ixns.indexOf(pStart);
		if (ixnLoc === -1) {
			// path starts off an intersection, so check to see if it's inside or outside
			const pInside = isPosInside(pStart, ixns);
			if (!pInside) {
				if (ixns.indexOf(pEnd) === -1) {
					n += (p[1] - p[0] + 1);
				} else {
					n += (p[1] - p[0]);
				}
			}
			if (r === debugRow) {
				console.dir({ p, pStart, ixns, ixnLoc, pInside, n });
			}
		} else if (ixnLoc % 2 === 0) {
			// path starts on an even-numbered intersection, so it should be accounted for by the intersection-to-intersection counting
		} else {
			// path starts on an odd-numbered intersection, so we need to account for it
			if (ixns.indexOf(pEnd) === -1) {
				n += (p[1] - p[0]);
			} else {
				n += (p[1] - p[0] - 1);
			}
		}
		if (r === debugRow) {
			console.dir({ p, ixnLoc, n });
		}
	}

	if (r === debugRow) {
		console.dir({ r, ixns, paths, n });
	}

	return n;
}

function isPosInside(pos, ixns) {
	if (ixns.length === 0 || pos < ixns[0]) {
		return false;
	}
	let inside = false;
	for (const i of ixns) {
		if (pos > i) {
			inside = !inside;
		} else {
			return inside;
		}
	}
	return inside;
}

function countHoles(maps) {
	let j = 0;
	const vertices = maps.vertices;
	const edges = makeEdges(vertices);
	let start = Date.now();
	for (let r = 0; r < maps.rows; r++) {
		if (r % 1000000 === 0) {
			const dur = Date.now() - start;
			console.log(`row ${r} (duration ${dur}ms)`);
			start = Date.now();
		} else if (r % 10000 === 0) {
			console.log(`row ${r}`);
		}
		const edgesToCheck = edges.filter(function (e) { return e[0][0] <= r && e[1][0] >= r; }); // have to include edges we might be on
		const holeCount = getHoleCount(r, edgesToCheck);
		j += holeCount;
		// console.log((h !== j ? 'DIFFERENT ' : '') + 'cumulatives: h -> ' + h + ', j -> ' + j);
	}
	return j;
}

function dayEighteenPartOne() {
	let maps = initializeMaps();
	let currLoc = [ 0, 0 ];
	const start = Date.now();
	for (const instruction of plan) {
		maps = executeInstruction(instruction, maps, currLoc);
	}
	const holes = countHoles(maps);
	const dur = Date.now() - start;
	console.log(`day eighteen part one: ${holes} holes (${dur} ms)`);
}

function dayEighteenPartTwo() {
	const partTwoPlan = convertInstructionsForPartTwo(plan);
	let maps = initializeMaps();
	let currLoc = [ 0, 0 ];
	const start = Date.now();
	for (const instruction of partTwoPlan) {
		maps = executeInstruction(instruction, maps, currLoc);
	}
	console.dir(maps);
	const holes = countHoles(maps);
	const dur = Date.now() - start;
	console.log(`day eighteen part two: ${holes} holes (${dur} ms)`);
}

const plan = parseInput('data/day18/input.txt');
dayEighteenPartOne();
dayEighteenPartTwo();

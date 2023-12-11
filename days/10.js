const utils = require('../lib/utils')();

const pipeConnectionMap = {
	'|': [ [ -1, 0 ], [ 1, 0] ],
	'-': [ [ 0, -1 ], [ 0, 1 ] ],
	'L': [ [ -1, 0 ], [ 0, 1 ] ],
	'J': [ [ -1, 0 ], [ 0, -1 ] ],
	'7': [ [ 0, -1 ], [ 1, 0 ] ],
	'F': [ [ 0, 1 ], [ 1, 0 ] ],
	'.': [],
	'S': [],
};

function parseInput(path) {
	const lines = utils.getInputLines(path);
	return lines.map(function (line) { return line.split(''); });
}

function findStart(map) {
	for (let row = 0; row < map.length; row++) {
		for (let col = 0; col < map[row].length; col++) {
			if (map[row][col] === 'S') {
				return [row, col];
			}
		}
	}
}

function calculatePosition(init, offset) {
	return [ init[0] + offset[0], init[1] + offset[1] ];
}

function findStartConnectors(startPos, map) {
	let neighbors = [];
	if (startPos[0] > 0) {
		neighbors.push([ startPos[0] - 1, startPos[1] ]);
	}
	if (startPos[0] < map.length - 1) {
		neighbors.push([ startPos[0], startPos[1] + 1 ]);
	}
	if (startPos[1] < map[0].length - 1) {
		neighbors.push([ startPos[0] + 1, startPos[1] ]);
	}
	if (startPos[1] > 0) {
		neighbors.push([ startPos[0], startPos[1] - 1 ]);
	}
	let connectors = [];
	for (const neighbor of neighbors) {
		const connectingOffsets = pipeConnectionMap[map[neighbor[0]][neighbor[1]]];
		const connectingSpaces = connectingOffsets.map(function (offset) { return calculatePosition(neighbor, offset); });
		if (connectingSpaces.some(function (space) { return space[0] === startPos[0] && space[1] === startPos[1]; })) {
			connectors.push(neighbor);
		}
	}
	return connectors;
}

function getStartPipe(startPos, connectors) {
	let potentialStarts1 = [],
		potentialStarts2 = [];
	if (connectors[0][0] === startPos[0]) {
		// first connector on same row as start
		potentialStarts1 = [ '-' ];
		if (connectors[0][1] < startPos[1]) { // connector 1 is left of start
			potentialStarts1 = [...potentialStarts1, '7', 'J' ];
		} else {
			potentialStarts1 = [...potentialStarts1, 'L', 'F' ];
		}
	} else {
		potentialStarts1 = [ '|' ];
		if (connectors[0][0] < startPos[0]) {
			potentialStarts1 = [...potentialStarts1, 'L', 'J' ];
		} else {
			potentialStarts1 = [...potentialStarts1, '7', 'F' ];
		}
	}
	if (connectors[1][0] === startPos[0]) {
		// second connector on same row as start
		potentialStarts2 = [ '-' ];
		if (connectors[1][1] < startPos[1]) { // connector 2 is left of start
			potentialStarts2 = [...potentialStarts2, '7', 'J' ];
		} else {
			potentialStarts2 = [...potentialStarts2, 'L', 'F' ];
		}
	} else {
		potentialStarts2 = [ '|' ];
		if (connectors[1][0] < startPos[0]) {
			potentialStarts2 = [...potentialStarts2, 'L', 'J' ];
		} else {
			potentialStarts2 = [...potentialStarts2, 'F', '7' ];
		}
	}
	return potentialStarts1.filter(function (c) { return (potentialStarts2.indexOf(c) > -1); })[0];
}

function getNextStep(pos, lastPos, map) {
	const pipe = map[pos[0]][pos[1]],
		offsets = pipeConnectionMap[pipe],
		offsetPositions = offsets.map(function (offset) { return calculatePosition(pos, offset); });
	for (const offsetPos of offsetPositions) {
		if (offsetPos[0] !== lastPos[0] || offsetPos[1] !== lastPos[1]) {
			return offsetPos;
		}
	}
	return null;
}

function printMap(map) {
	map.forEach(function (line) {
		console.log(line.map(function (c) { return (c === null ? ' ' : c); }).join(''));
	});
}

function dayTenPartOne() {
	const start = findStart(map);
	const connectors = findStartConnectors(start, map);
	const startPipe = getStartPipe(start, connectors);
	mappedPath[start[0]][start[1]] = startPipe;
	mappedPath[connectors[0][0]][connectors[0][1]] = map[connectors[0][0]][connectors[0][1]];
	mappedPath[connectors[1][0]][connectors[1][1]] = map[connectors[1][0]][connectors[1][1]];
	let foundMatch = false,
		path1 = [start, connectors[0]],
		path2 = [start, connectors[1]],
		i = 1;
	while (!foundMatch) {
		const nextPath1Pos = getNextStep(path1[path1.length - 1], path1[path1.length - 2], map),
			nextPath2Pos = getNextStep(path2[path2.length - 1], path2[path2.length - 2], map);
		path1.push(nextPath1Pos);
		path2.push(nextPath2Pos);
		mappedPath[nextPath1Pos[0]][nextPath1Pos[1]] = map[nextPath1Pos[0]][nextPath1Pos[1]];
		mappedPath[nextPath2Pos[0]][nextPath2Pos[1]] = map[nextPath2Pos[0]][nextPath2Pos[1]];
		i++;
		if (nextPath1Pos[0] === nextPath2Pos[0] && nextPath1Pos[1] === nextPath2Pos[1]) {
			foundMatch = true;
		}
	}
	console.log('day ten part one: steps to farthest point ' + i);
}

function dayTenPartTwo() {
	let insideCount = 0;
	mappedPath.forEach(function (row, r) {
		let onPath = false,
			isInside = false,
			fromTop = null;
		row.forEach(function (char, c) {
			if (char === null) {
				if (isInside) {
					insideCount++;
					mappedPath[r][c] = 'I';
				}
				return;
			} else if (!onPath) {
				if (char === '|') {
					// cross a vertical line, so flip inside/outside
					isInside = !isInside;
					return;
				}
				if (char === 'F') {
					// starting a path from the bottom
					onPath = true;
					fromTop = false;
				} else if (char === 'L') {
					// starting a path from the top
					onPath = true;
					fromTop = true;
				}
			} else { // on a path
				if (char === '-') {
					// kept going straight
					return;
				}
				if (char === 'J') {
					// end the path, turning up
					onPath = false;
					if (!fromTop) {
						isInside = !isInside;
					}
					fromTop = null;
				} else if (char === '7') {
					// end the path, turning down
					onPath = false;
					if (fromTop) {
						isInside = !isInside;
					}
					fromTop = null;
				}
			}
		});
	});
	console.log('day ten part two: inside cells ' + insideCount);
}

const map = parseInput('data/day10/input.txt');
let mappedPath = map.map(function (line) { return line.map(function () { return null; }); });
dayTenPartOne();
dayTenPartTwo();

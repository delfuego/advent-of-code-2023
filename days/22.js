const utils = require('../lib/utils')();

class Brick {

	constructor(def) {
		const coords = def.split('~');
		const startCoords = coords[0].split(',').map(function (n) { return Number(n); });
		const endCoords = coords[1].split(',').map(function (n) { return Number(n); });
		this.start = { x: startCoords[0], y: startCoords[1], z: startCoords[2] };
		this.end = { x: endCoords[0], y: endCoords[1], z: endCoords[2] };
		if (this.start.x !== this.end.x) {
			this.orientation = 'x';
		} else if (this.start.y !== this.end.y) {
			this.orientation = 'y';
		} else if (this.start.z !== this.end.z) {
			this.orientation = 'z';
		}
	}

	getStart() {
		return this.start;
	}
	getEnd() {
		return this.end;
	}
	getPositionInfo() {
		return this.start.x + ',' + this.start.y + ',' + this.start.z + '~' + this.end.x + ',' + this.end.y + ',' + this.end.z;
	}

	occupiesPos(pos) {
		return (this.start.x <= pos.x && this.end.x >= pos.x && this.start.y <= pos.y && this.end.y >= pos.y && this.start.z <= pos.z && this.end.z >= pos.z);
	}

	canFall(bricksUnderneath) {
		const myZ = this.start.z;
		if (myZ === 1) {
			return false;
		}
		for (let myX = this.start.x; myX <= this.end.x; myX++) {
			for (let myY = this.start.y; myY <= this.end.y; myY++) {
				const brickUnder = bricksUnderneath.some(function (brick) {
					return brick.occupiesPos({ x: myX, y: myY, z: myZ - 1});
				});
				if (brickUnder) {
					return false;
				}
			}
		}
		return true;
	}

	dropBrick(bricksUnderneath) {
		let iCanFall = this.canFall(bricksUnderneath);
		const iDropped = iCanFall;
		while (iCanFall) {
			// console.log(`dropping brick ${this.getPositionInfo()} one level`);
			this.start.z--;
			this.end.z--;
			iCanFall = this.canFall(bricksUnderneath);
		}
		return iDropped;
	}

	isCritical(relevantBricks) {
		const myTopZ = this.end.z;

		// get a list of the bricks I support
		const bricksStartingRightAbove = relevantBricks.filter(function (b) { return b.getStart().z === myTopZ + 1; });
		let bricksISupport = [];
		for (const b of bricksStartingRightAbove) {
			let brickSupported = false;
			for (let myX = this.start.x; myX <= this.end.x; myX++) {
				for (let myY = this.start.y; myY <= this.end.y; myY++) {
					if (b.occupiesPos({ x: myX, y: myY, z: myTopZ + 1 })) {
						bricksISupport.push(b);
						brickSupported = true;
						break;
					}
				}
				if (brickSupported) {
					break;
				}
			}
		}
		// now see if any of them are also supported by another brick
		const bricksEndingOnMyZ = relevantBricks.filter(function (b) { return b.getEnd().z === myTopZ; });
		for (const b of bricksISupport) {
			let brickSupportedByAnotherBrick = false;
			for (const lowerB of bricksEndingOnMyZ) {
				if (this.isEqual(lowerB)) {
					// this is me; ignore me
					continue;
				}
				for (let bX = b.getStart().x; bX <= b.getEnd().x; bX++) {
					for (let bY = b.getStart().y; bY <= b.getEnd().y; bY++) {
						if (lowerB.occupiesPos({ x: bX, y: bY, z: myTopZ })) {
							brickSupportedByAnotherBrick = true;
							break;
						}
					}
					if (brickSupportedByAnotherBrick) {
						break;
					}
				}
			}
			if (!brickSupportedByAnotherBrick) {
				return true;
			}
		}
		return false;
	}

	static compareZ(a, b) {
		return a.getStart().z - b.getStart().z;
	}

	isEqual(brick) {
		return (this.start.x === brick.getStart().x && this.end.x === brick.getEnd().x && this.start.y === brick.getStart().y && this.end.y === brick.getEnd().y && this.start.z === brick.getStart().z && this.end.z === brick.getEnd().z);
	}
}

function copyBricks(bricks) {
	return bricks.map(function (b) { return new Brick(b.getPositionInfo()); });
}

function letBricksFall(bricks) {
	let bricksFromBottom = [];
	let numBricksFallen = 0;
	for (const brick of bricks) {
		const brickDropped = brick.dropBrick(bricksFromBottom);
		if (brickDropped) {
			numBricksFallen++;
		}
		bricksFromBottom.push(brick);
	}
	return numBricksFallen;
}

function parseInput(path) {
	const lines = utils.getInputLines(path);
	let bricks = lines.map(function (line) { return new Brick(line); });
	return bricks;
}

function dayTwentyTwoPartOne() {
	const bricks = parseInput('data/day22/input-test.txt');
	bricks.sort(Brick.compareZ); // sort to get in order from bottom to top
	letBricksFall(bricks);
	let numSafeToDisintegrate = 0;
	for (const b of bricks) {
		const isCritical = b.isCritical(bricks);
		if (!isCritical) {
			numSafeToDisintegrate++;
		}
	}
	console.log(`Day twenty two part one: can safely disintegrate ${numSafeToDisintegrate} bricks`);
}

// This takes about 30 seconds to run, and I'm sure it can be optimized, but it works for
// my purposes!
function dayTwentyTwoPartTwo() {
	const bricks = parseInput('data/day22/input.txt');
	bricks.sort(Brick.compareZ); // sort to get in order from bottom to top
	letBricksFall(bricks);
	let totalNumFallen = 0;
	const start = Date.now();
	for (let i = 0; i < bricks.length; i++) {
		const testBricks = copyBricks(bricks);
		testBricks.splice(i, 1);
		const numFallenBricks = letBricksFall(testBricks);
		// console.log(`${i.toLocaleString()} -> ${numFallenBricks}`);
		totalNumFallen += numFallenBricks;
	}
	const dur = Date.now() - start;
	console.log(`Day twenty two part two: total number fallen is ${totalNumFallen} bricks (${dur} ms)`);
}

dayTwentyTwoPartOne();
dayTwentyTwoPartTwo();

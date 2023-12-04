const fs = require('fs');

function getInputLines() {
	const allLines = fs.readFileSync('data/day03/input.txt', 'utf-8');
	return allLines.split(/\r?\n/).filter(function (line) {
		return (line !== '');
	});
}

function getAllSymbols(lines) {
	const re = /[\d.]/g;
	let chars = '';
	lines.forEach(function (line) {
		chars += line.replaceAll(re, '');
	});
	return [... new Set(chars)];
}

function isNumber(str) {
	return /^\d$/.test(str);
}

function getNumberLocations(line) {
	let locations = [];
	let inNum = false,
		numStartPos = null,
		currNum = '';
	for (let i = 0; i < line.length; i++) {
		const char = line.charAt(i);
		if (isNumber(char)) {
			if (!inNum) {
				inNum = true;
				numStartPos = i;
			}
			currNum += char;
		}
		if (inNum && (!isNumber(char) || i === line.length - 1)) {
			inNum = false;
			const fullNum = Number(currNum);
			currNum = '';
			locations.push({
				num: fullNum,
				startPos: numStartPos,
				endPos: i - 1,
			});
			numStartPos = null;
		}
	}
	return locations;
}

function getAsteriskLocations(line) {
	let locations = [];
	let foundPos = line.indexOf('*');
	while (foundPos !== -1) {
		locations.push(foundPos);
		foundPos = line.indexOf('*', foundPos + 1);
	}
	return locations;
}

function isPartNum(startPos, endPos, lineAbove, line, lineBelow, symbols) {
	function isCharSymbol(char) {
		return (symbols.indexOf(char) !== -1);
	}
	let allSurroundingChars = [];
	if (lineAbove) {
		const aboveSubstring = lineAbove.substring(startPos === 0 ? 0 : startPos - 1, endPos === lineAbove.length - 1 ? endPos + 1: endPos + 2);
		allSurroundingChars = [...allSurroundingChars, ...aboveSubstring.split('')];
	}
	if (startPos !== 0) {
		allSurroundingChars.push(line[startPos - 1]);
	}
	if (endPos !== line.length - 1) {
		allSurroundingChars.push(line[endPos + 1]);
	}
	if (lineBelow) {
		const belowSubstring = lineBelow.substring(startPos === 0 ? 0 : startPos - 1, endPos === lineBelow.length - 1 ? endPos + 1: endPos + 2);
		allSurroundingChars = [...allSurroundingChars, ...belowSubstring.split('')];
	}
	return allSurroundingChars.some(function (char) {
		return isCharSymbol(char);
	});
}

function getGearPartNums(asteriskPosition, lineAbove, line, lineBelow) {
	let adjacentPartNums = [];
	if (lineAbove) {
		lineAbove.forEach(function (num) {
			if ((num.startPos >= asteriskPosition - 1 && num.startPos <= asteriskPosition + 1) || (num.endPos >= asteriskPosition - 1 && num.endPos <= asteriskPosition + 1)) {
				adjacentPartNums.push(num.num);
			}
		});
	}
	line.forEach(function (num) {
		if (num.startPos === asteriskPosition + 1 || num.endPos === asteriskPosition - 1) {
			adjacentPartNums.push(num.num);
		}
	});
	if (lineBelow) {
		lineBelow.forEach(function (num) {
			if ((num.startPos >= asteriskPosition - 1 && num.startPos <= asteriskPosition + 1) || (num.endPos >= asteriskPosition - 1 && num.endPos <= asteriskPosition + 1)) {
				adjacentPartNums.push(num.num);
			}
		});
	}
	if (adjacentPartNums.length === 2) {
		return adjacentPartNums;
	}
	return [];
}

function dayThreePartOne() {
	const lines = getInputLines();
	const symbols = getAllSymbols(lines);
	const allLocations = lines.map(function (line, i) {
		const numLocations = getNumberLocations(line);
		return numLocations;
	});
	let total = 0;
	allLocations.forEach(function (lineLocations, i) {
		lineLocations.forEach(function (numLocation) {
			const num = numLocation.num;
			const isNumAPartNum = isPartNum(numLocation.startPos, numLocation.endPos, lines[i - 1], lines[i], lines[i + 1], symbols);
			// console.log('line ' + i + ', number ' + num + ', isPartNum: ' + isNumAPartNum);
			if (isNumAPartNum) {
				total+= num;
			}
		});
	});
	console.log('day three part one: total ' + total);
}

function dayThreePartTwo() {
	const lines = getInputLines();
	const allLocations = lines.map(function (line, i) {
		const numLocations = getNumberLocations(line);
		return numLocations;
	});
	const asteriskLocations = lines.map(function (line) {
		const locations = getAsteriskLocations(line);
		return locations;
	});
	let total = 0;
	asteriskLocations.forEach(function (locations, i) {
		locations.forEach(function (asteriskLocation) {
			const gearPartNums = getGearPartNums(asteriskLocation, allLocations[i-1], allLocations[i], allLocations[i+1]);
			if (gearPartNums.length === 2) {
				// console.log('found gear: line ' + i + ', asterisk location ' + asteriskLocation + ', gear part numbers: ' + gearPartNums.join(', '));
				total += (gearPartNums[0] * gearPartNums[1]);
			}
		});
	});
	console.log('day three part two: total ' + total);
}

dayThreePartOne();
dayThreePartTwo();

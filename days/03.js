const utils = require('../lib/utils')();

function getAllSymbols(lines) {
	const symbolRegex = /[\d.]/g;
	let chars = '';
	lines.forEach(function (line) {
		chars += line.replaceAll(symbolRegex, '');
	});
	return [... new Set(chars)]; // reduce to unique characters
}

function getNumberLocations(line) {
	let locations = [];
	let inNum = false,
		numStartPos = null,
		currNum = '';
	for (let i = 0; i < line.length; i++) {
		const char = line.charAt(i);
		if (utils.isNumber(char)) {
			if (!inNum) {
				inNum = true;
				numStartPos = i;
			}
			currNum += char;
		}
		if (inNum && (!utils.isNumber(char) || i === line.length - 1)) {
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

function getGearPartNums(asteriskPosition, lineAboveLocations, lineLocations, lineBelowLocations) {
	let adjacentPartNums = [];
	// check the numbers in the lines above and below the line with the asterisk
	let aboveBelowLocations = [...lineAboveLocations, ...lineBelowLocations];
	aboveBelowLocations.forEach(function (location) {
		if ((location.startPos >= asteriskPosition - 1 && location.startPos <= asteriskPosition + 1) || (location.endPos >= asteriskPosition - 1 && location.endPos <= asteriskPosition + 1)) {
			adjacentPartNums.push(location.num);
		}
	});
	// check the numbers in the line with the asterisk, which is much simpler
	lineLocations.forEach(function (num) {
		if (num.startPos === asteriskPosition + 1 || num.endPos === asteriskPosition - 1) {
			adjacentPartNums.push(num.num);
		}
	});
	if (adjacentPartNums.length === 2) {
		// only return adjacent part numbers if there are two of them; otherwise, the asterisk doesn't signify a gear
		return adjacentPartNums;
	}
	return [];
}

function dayThreePartOne() {
	const lines = utils.getInputLines('data/day03/input.txt');
	const symbols = getAllSymbols(lines); // make sure we know all the symbols that are in the input
	// get the location info for all numbers in the input lines
	const allLocations = lines.map(function (line, i) {
		return getNumberLocations(line);
	});
	let total = 0;
	allLocations.forEach(function (lineLocations, i) {
		lineLocations.forEach(function (numLocation) {
			const num = numLocation.num;
			if (isPartNum(numLocation.startPos, numLocation.endPos, lines[i - 1], lines[i], lines[i + 1], symbols)) {
				total+= num;
			}
		});
	});
	console.log('day three part one: total ' + total);
}

function dayThreePartTwo() {
	const lines = utils.getInputLines('data/day03/input.txt');
	// get the location info for all numbers in the input lines
	const allLocations = lines.map(function (line, i) {
		return getNumberLocations(line);
	});
	// get the location of all the asterisks in the input lines
	const asteriskLocations = lines.map(function (line) {
		return getAsteriskLocations(line);
	});
	let total = 0;
	asteriskLocations.forEach(function (locations, i) {
		locations.forEach(function (asteriskLocation) {
			const gearPartNums = getGearPartNums(asteriskLocation, allLocations[i-1], allLocations[i], allLocations[i+1]);
			if (gearPartNums.length === 2) {
				total += (gearPartNums[0] * gearPartNums[1]);
			}
		});
	});
	console.log('day three part two: total ' + total);
}

dayThreePartOne();
dayThreePartTwo();

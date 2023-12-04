const utils = require('../lib/utils')();

function parseInputLine(line) {
	const fullLineRegex = /^Game (\d+): (.*$)/;
	const lineMatches = line.match(fullLineRegex);
	const diceSets = lineMatches[2].split('; ').map(function (set) {
		const colors = set.split(', ');
		const colorRegex = /^(\d+) (.*)$/;
		let rtn = {};
		colors.forEach(function (color) {
			const colorMatches = color.match(colorRegex);
			rtn[colorMatches[2]] = Number(colorMatches[1]);
		});
		return rtn;
	});
	let redMax = 0, greenMax = 0, blueMax = 0;
	diceSets.forEach(function (set) {
		if (set.red && set.red > redMax) {
			redMax = set.red;
		}
		if (set.green && set.green > greenMax) {
			greenMax = set.green;
		}
		if (set.blue && set.blue > blueMax) {
			blueMax = set.blue;
		}
	});

	return {
		gameNum: Number(lineMatches[1]),
		diceSets: diceSets,
		redMax,
		greenMax,
		blueMax,
		gamePower: redMax * greenMax * blueMax,
	};
}

function getPossibleGames(games, redNum, greenNum, blueNum) {
	const possibleGames = games.filter(function (game) {
		return game.redMax <= redNum && game.greenMax <= greenNum && game.blueMax <= blueNum;
	});
	return possibleGames;
}


function dayTwoPartOne() {
	const lines = utils.getInputLines('data/day02/input.txt');
	const games = lines.map(function (line) {
		return parseInputLine(line);
	});
	const possibleGames = getPossibleGames(games, 12, 13, 14);
	let total = 0;
	possibleGames.forEach(function (game) {
		total += game.gameNum;
	});
	console.log('day two part one: total ' + total);
}

function dayTwoPartTwo() {
	const lines = utils.getInputLines('data/day02/input.txt');
	const games = lines.map(function (line) {
		return parseInputLine(line);
	});
	let total = 0;
	games.forEach(function (game) {
		total += game.gamePower;
	});
	console.log('day two part two: total ' + total);
}

dayTwoPartOne();
dayTwoPartTwo();

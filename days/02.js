const fs = require('fs');

function getInputLines() {
	const allLines = fs.readFileSync('data/day02/input.txt', 'utf-8');
	return allLines.split(/\r?\n/).filter(function (line) {
		return (line !== '');
	});
}

function parseInputLine(line) {
	const re = /^Game (\d+): (.*$)/;
	const matches = line.match(re);
	const sets = matches[2].split('; ').map(function (set) {
		const colors = set.split(', ');
		const colorRe = /^(\d+) (.*)$/;
		let rtn = {};
		colors.forEach(function (color) {
			const colorMatches = color.match(colorRe);
			rtn[colorMatches[2]] = Number(colorMatches[1]);
		});
		return rtn;
	});
	let redMax = 0, greenMax = 0, blueMax = 0;
	sets.forEach(function (set) {
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
		gameNum: Number(matches[1]),
		sets: sets,
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
	const lines = getInputLines();
	const games = lines.map(function (line) {
		const p = parseInputLine(line);
		return p;
	});
	const possibleGames = getPossibleGames(games, 12, 13, 14);
	let total = 0;
	possibleGames.forEach(function (game) {
		total += game.gameNum;
	});
	console.log('day two part one: ' + possibleGames.length + ' possibleGames, total ' + total);
}

function dayTwoPartTwo() {
	const lines = getInputLines();
	const games = lines.map(function (line) {
		const p = parseInputLine(line);
		return p;
	});
	let total = 0;
	games.forEach(function (game) {
		total += game.gamePower;
	});
	console.log('day two part two: total ' + total);
}

dayTwoPartOne();
dayTwoPartTwo();

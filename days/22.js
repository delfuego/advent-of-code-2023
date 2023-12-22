const utils = require('../lib/utils')();

function parseInput(path) {
	const lines = utils.getInputLines(path);
	return lines.map(function (line) { return line.split(''); });
}

function dayTwentyTwoPartOne() {

}

function dayTwentyTwoPartTwo() {

}

dayTwentyTwoPartOne();
dayTwentyTwoPartTwo();

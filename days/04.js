const utils = require('../lib/utils')();

function checkCardLine(line) {
	// This regex is slightly tricky since the numbers are all space-padded
	const cardRegex = /^Card +(\d+): +(.*) \| +(.*)$/;
	const cardMatches = line.match(cardRegex);
	const winningNumbers = cardMatches[2].split(/ +/).map(utils.toNumber);
	const cardNumbers = cardMatches[3].split(/ +/).map(utils.toNumber);
	let matches = 0;
	cardNumbers.forEach(function (num) {
		if (winningNumbers.indexOf(num) !== -1) {
			matches++;
		}
	});
	const value = (matches === 0 ? 0 : 2 ** (matches - 1));
	return {
		num: utils.toNumber(cardMatches[1]),
		winningNumbers,
		cardNumbers,
		matches,
		value,
	};
}

function processCardsForPartTwo(cards) {
	const cardMap = {},
		totalCards = cards.length;
	// first, build a map with the number of each card, which starts at one for each
	cards.forEach(function (card) {
		cardMap[card.num] = 1;
	});
	// now, iterate through the card list again, and for each card, add the number of
	// that card that you have to each matched subsequent card
	// e.g., if you have 5 copies of card 2, and card 2 has 3 matches, then add 5 to
	// the number of copies of cards 3, 4, and 5
	cards.forEach(function (card) {
		if (card.matches > 0) {
			for (let i = 0; i < card.matches; i++) {
				if (card.num + i + 1 <= totalCards) { // make sure we don't overflow the end!
					cardMap[card.num + i + 1] += cardMap[card.num];
				}
			}
		}
	});
	return cardMap;
}

function dayFourPartOne() {
	const lines = utils.getInputLines('data/day04/input.txt');
	const cards = lines.map(checkCardLine);
	const total = cards.reduce(function (runningTotal, card) { return runningTotal + card.value; }, 0);
	console.log('day four part one: total ' + total);
}

function dayFourPartTwo() {
	const lines = utils.getInputLines('data/day04/input.txt');
	const cards = lines.map(checkCardLine);
	const cardMap = processCardsForPartTwo(cards);
	const total = Object.values(cardMap).reduce(function (runningTotal, currNum) { return runningTotal + currNum; }, 0);
	console.log('day four part two: new total: ' + total);
}

dayFourPartOne();
dayFourPartTwo();

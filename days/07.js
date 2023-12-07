const utils = require('../lib/utils')();

const cardsPartOne = [ 'A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2' ];
const cardsPartTwo = [ 'A', 'K', 'Q', 'T', '9', '8', '7', '6', '5', '4', '3', '2', 'J' ];

function reduceHand(aggregator, card) {
	if (!aggregator[card]) {
		aggregator[card] = 1;
	} else {
		aggregator[card]++;
	}
	return aggregator;
};

function getHandTypePartOne(hand) {
	const map = hand.reduce(reduceHand, {});
	const counts = Object.values(map);
	if (counts.indexOf(5) !== -1) {
		return 6; // 6 = five of a kind)
	}
	if (counts.indexOf(4) !== -1) {
		return 5; // 5 = four of a kind
	}
	if (counts.indexOf(3) !== -1) {
		if (counts.indexOf(2) !== -1) {
			return 4; // 4 = full house
		}
		return 3; // 3 = three of a kind
	}
	if (counts.indexOf(2) !== -1) {
		if (counts.filter(function (n) { return n === 2; }).length === 2) {
			return 2; // 2 = two pairs
		}
		return 1; // 1 = one pair
	}
	return 0; // 0 = high card;
}

function getHandTypePartTwo(hand) {
	const map = hand.reduce(reduceHand, {});
	const counts = Object.values(map);
	if (counts.indexOf(5) !== -1) {
		return 6; // 6 = five of a kind)
	}
	if (counts.indexOf(4) !== -1) {
		if (map.J && map.J > 0) {
			return 6; // any J turns this into five of a kind
		}
		return 5; // 5 = four of a kind
	}
	if (counts.indexOf(3) !== -1) {
		if (counts.indexOf(2) !== -1) {
			if (map.J && map.J > 0) {
				return 6; // any J turns this into a five of a kind
			}
			return 4; // 4 = full house
		}
		if (map.J && map.J > 0) {
			return 5; // any J turns this into a four of a kind
		}
		return 3; // 3 = three of a kind
	}
	if (counts.indexOf(2) !== -1) {
		if (counts.filter(function (n) { return n === 2; }).length === 2) {
			if (map.J) {
				if (map.J === 2) {
					return 5; // two Js turns this into a four of a kind
				}
				return 4; // one J turns this into a full house
			}
			return 2; // 2 = two pairs
		}
		if (map.J && map.J > 0) {
			return 3; // any J turns this into a three of a kind
		}
		return 1; // 1 = one pair
	}
	if (map.J && map.J > 0) {
		return 1; // any J turns this into a one-pair
	}
	return 0; // 0 = high card;
}

function compareHandsPartOne(a, b) {

	const aType = getHandTypePartOne(a.cards),
		bType = getHandTypePartOne(b.cards);
	if (aType !== bType) {
		return aType - bType;
	}
	for (let i = 0; i < a.cards.length; i++) {
		const aCardRank = cardsPartOne.indexOf(a.cards[i]),
			bCardRank = cardsPartOne.indexOf(b.cards[i]);
		if (aCardRank !== bCardRank) {
			return bCardRank - aCardRank;
		}
	}
	return 0;
}

function compareHandsPartTwo(a, b) {

	const aType = getHandTypePartTwo(a.cards),
		bType = getHandTypePartTwo(b.cards);
	if (aType !== bType) {
		return aType - bType;
	}
	for (let i = 0; i < a.cards.length; i++) {
		const aCardRank = cardsPartTwo.indexOf(a.cards[i]),
			bCardRank = cardsPartTwo.indexOf(b.cards[i]);
		if (aCardRank !== bCardRank) {
			return bCardRank - aCardRank;
		}
	}
	return 0;
}

function daySevenPartOne() {
	const lines = utils.getInputLines('data/day07/input.txt');
	const hands = lines.map(function (hand) {
		const parts = hand.split(' ');
		return {
			cards: parts[0].split(''),
			bid: Number(parts[1]),
		};
	});
	hands.sort(compareHandsPartOne);
	let winnings = 0;
	hands.forEach(function (hand, i) {
		winnings += (i + 1) * hand.bid;
	});
	console.log(`day seven part one: winnings $${winnings}`);
}

function daySevenPartTwo() {
	const lines = utils.getInputLines('data/day07/input.txt');
	const hands = lines.map(function (hand) {
		const parts = hand.split(' ');
		return {
			cards: parts[0].split(''),
			bid: Number(parts[1]),
		};
	});
	hands.sort(compareHandsPartTwo);
	let winnings = 0;
	hands.forEach(function (hand, i) {
		winnings += (i + 1) * hand.bid;
	});
	console.log(`day seven part two: winnings $${winnings}`);
}

daySevenPartOne();
daySevenPartTwo();

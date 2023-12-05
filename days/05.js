const utils = require('../lib/utils')();

let seedInfo, seedSoilMap, soilFertilizerMap, fertilizerWaterMap, waterLightMap, lightTempMap, tempHumidityMap, humidityLocationMap;

function parseInput(path) {
	const lines = utils.getInputLines(path);
	const seedLine = lines.shift();
	seedInfo = parseSeedLine(seedLine);
	let maps = [],
		currMap = null;
	while (lines.length > 0) {
		const line = lines.shift();
		if (line.endsWith(':')) {
			if (currMap !== null) {
				currMap.sort(compareRanges);
				maps.push(currMap);
			}
			currMap = [];
			continue;
		}
		currMap.push(getRange(line));
	}
	currMap.sort(compareRanges);
	maps.push(currMap);
	// I could just push maps to the top level and reference each map by index, but I'm
	// setting each to its own variable to keep my own sanity as I think about this!
	seedSoilMap = maps[0];
	soilFertilizerMap = maps[1];
	fertilizerWaterMap = maps[2];
	waterLightMap = maps[3];
	lightTempMap = maps[4];
	tempHumidityMap = maps[5];
	humidityLocationMap = maps[6];
}

function parseSeedLine(line) {
	const seedRegex = /^seeds: (.*)$/;
	const [ _, seedStr ] = line.match(seedRegex);
	return seedStr.split(' ').map(utils.toNumber);
}

// turn a range string into an object with named properties
function getRange(rangeString) {
	const [ destStart, sourceStart, length ] = rangeString.split(' ').map(utils.toNumber);
	return { sourceStart, destStart, length };
}

// comparator to pass to Array.sort for sorting the ranges array by sourceStart
function compareRanges(a, b) {
	return a.sourceStart - b.sourceStart;
}

// get the destination, given a source number and a map (an array of ranges)
function getDest(source, ranges) {
	// assume ranges are already sorted by sourceStart
	let dest;
	for (const range of ranges) {
		if (source >= range.sourceStart && source < (range.sourceStart + range.length)) {
			// we're in the right range
			dest = range.destStart + (source - range.sourceStart);
			// I don't think I should break out, since there might be an overlapping range in the full input
		}
	}
	if (!dest) {
		dest = source;
	}
	return dest;
}

// walk all the maps to get from source seed to destination location
function getSeedLocation(seed) {
	const soilDest = getDest(seed, seedSoilMap);
	const fertilizerDest = getDest(soilDest, soilFertilizerMap);
	const waterDest = getDest(fertilizerDest, fertilizerWaterMap);
	const lightDest = getDest(waterDest, waterLightMap);
	const tempDest = getDest(lightDest, lightTempMap);
	const humidityDest = getDest(tempDest, tempHumidityMap);
	const locationDest = getDest(humidityDest, humidityLocationMap);
	return locationDest;
}

function dayFivePartOne() {
	let lowLoc = Infinity, lowSeed;
	seedInfo.forEach(function (seed) {
		const location = getSeedLocation(seed);
		if (location < lowLoc) {
			lowLoc = location;
			lowSeed = seed;
		}
	});
	console.log(`day five part one: lowest location ${lowLoc} (seed ${lowSeed})`);
}

// Note that this is SLOW for the real input, since at least for MY real input, there are
// a total of 1,699,478,662 seeds! It took about 7 min on my M1 Max MBP to run.
function dayFivePartTwo() {
	let lowLoc = Infinity, lowSeed;
	while (seedInfo.length > 0) {
		const start = seedInfo.shift(),
			len = seedInfo.shift();
		for (let i = 0; i < len; i++) {
			const location = getSeedLocation(start + i);
			if (location < lowLoc) {
				lowLoc = location;
				lowSeed = start + i;
			}
		}
	}
	console.log(`day five part two: lowest location: ${lowLoc} (seed ${lowSeed})`);
}

parseInput('data/day05/input.txt');
dayFivePartOne();
dayFivePartTwo();

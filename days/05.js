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
				currMap.sort(compareRangesBySourceStart);
				maps.push(currMap);
			}
			currMap = [];
			continue;
		}
		currMap.push(getRange(line));
	}
	currMap.sort(compareRangesBySourceStart);
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
function compareRangesBySourceStart(a, b) {
	return a.sourceStart - b.sourceStart;
}

// comparator to pass to Array.sort for sorting the ranges array by destStart
function compareRangesByDestStart(a, b) {
	return a.destStart - b.destStart;
}

// get the destination, given a source number and a map (an array of ranges)
function getDest(source, ranges) {
	// assume ranges are already sorted by sourceStart
	let dest;
	for (const range of ranges) {
		if (source >= range.sourceStart && source < (range.sourceStart + range.length)) {
			// we're in the right range
			dest = range.destStart + (source - range.sourceStart);
			// Note that I've tested to see if this break matters, and for my input, it does not -- but could the
			// maps contain a range that's within another range, and "re-maps" that smaller range? In theory
			// it could, and then a break here would lead to the wrong destination.
			break;
		}
	}
	if (!dest) {
		dest = source;
	}
	return dest;
}

function getSource(dest, ranges) {
	// assume ranges are already sorted by destStart;
	let source;
	for (const range of ranges) {
		if (dest >= range.destStart && dest < (range.destStart + range.length)) {
			source = range.sourceStart + (dest - range.destStart);
			break;
		}
	}
	if (!source) {
		source = dest;
	}
	return source;
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

function getSeed(location) {
	const humiditySource = getSource(location, humidityLocationMap);
	const tempSource = getSource(humiditySource, tempHumidityMap);
	const lightSource = getSource(tempSource, lightTempMap);
	const waterSource = getSource(lightSource, waterLightMap);
	const fertilizerSource = getSource(waterSource, fertilizerWaterMap);
	const soilSource = getSource(fertilizerSource, soilFertilizerMap);
	const seedSource = getSource(soilSource, seedSoilMap);
	return seedSource;
}

function hasSeed(seed) {
	let seedFound = false,
		localSeedInfo = [...seedInfo];
	while (localSeedInfo.length > 0 && seedFound === false) {
		const start = localSeedInfo.shift(),
			len = localSeedInfo.shift();
		seedFound = (seed >= start && seed < (start + len));
	}
	return seedFound;
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

// Note that this isn't fast for the real input, since at least for MY real input, there are
// a total of 1,699,478,662 seeds! It took about 3.5 min on my M1 Max MBP to run.
function dayFivePartTwoInitial() {
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
	console.log(`day five part two: lowest location ${lowLoc} (seed ${lowSeed})`);
}

// This is much faster for the real input, since I only end up having to iterate over 137
// million destinations (starting with 0) to find a seed I possess, rather than iterate over
// 1.7 billion seeds; this just takes 34 seconds.
function dayFivePartTwo() {
	// re-sort maps by destination range start
	humidityLocationMap.sort(compareRangesByDestStart);
	tempHumidityMap.sort(compareRangesByDestStart);
	lightTempMap.sort(compareRangesByDestStart);
	waterLightMap.sort(compareRangesByDestStart);
	fertilizerWaterMap.sort(compareRangesByDestStart);
	soilFertilizerMap.sort(compareRangesByDestStart);
	seedSoilMap.sort(compareRangesByDestStart);

	let foundSeed = false;
	const lastHumidityLocationMap = humidityLocationMap[humidityLocationMap.length - 1];
	const lastLocation = lastHumidityLocationMap.destStart + lastHumidityLocationMap.length - 1;
	let lowLoc, lowSeed;
	for (let i = 0; i < lastLocation; i++) {
		const seed = getSeed(i);
		foundSeed = hasSeed(seed);
		if (foundSeed) {
			lowLoc = i;
			lowSeed = seed;
			break;
		}
	}
	console.log(`day five part two: lowest location ${lowLoc} (seed ${lowSeed})`);
}

parseInput('data/day05/input.txt');
dayFivePartOne();
// dayFivePartTwoInitial();
dayFivePartTwo();

const fs = require('fs');

function initialize() {
	// code to come as module initialization is needed
}

function getInputLines(path, splitOnBlankLines = false) {
	const wholeFile = fs.readFileSync(path, 'utf-8');
	const allLines = wholeFile.split(/\r?\n/);
	if (!splitOnBlankLines) {
		return allLines.filter(function (line) { return line !== ''; });
	}
	let parts = [];
	let part = [];
	for (const line of allLines) {
		if (line === '') {
			parts.push(part);
			part = [];
		} else {
			part.push(line);
		}
	}
	return parts;
}

function writeFile(path, content) {
	fs.writeFileSync(path, content);
}

function isNumber(str) {
	return /^\d$/.test(str);
}

function toNumber(str) {
	return Number(str);
}

function transposeMatrix(matrix) {
	return matrix[0].map((col, i) => matrix.map(row => row[i]));
}

function printMatrix(matrix) {
	matrix.forEach(function (line) {
		console.log(line.join(''));
	});
}

module.exports = function () {

	initialize();

	return {
		getInputLines,
		writeFile,
		isNumber,
		toNumber,
		transposeMatrix,
		printMatrix,
	};
};

const fs = require('fs');

function initialize() {
	// code to come as module initialization is needed
}

function getInputLines(path) {
	const allLines = fs.readFileSync(path, 'utf-8');
	return allLines.split(/\r?\n/).filter(function (line) { return line !== ''});
}

function isNumber(str) {
	return /^\d$/.test(str);
}

module.exports = function () {

	initialize();

	return {
		getInputLines,
		isNumber,
	};
};

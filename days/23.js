const utils = require('../lib/utils')();

class Graph {
	constructor(lines, stepTwo = false) {
		this.lines = lines;
		this.stepTwo = stepTwo;
		this.vertices = [];
		this.startingPosition = [ 0, lines[0].indexOf('.') ];
		this.startingVertex = new Vertex(this.startingPosition);
		this.lastRowIndex = lines.length - 1;
		this.lastColIndex = lines[0].length - 1;
		this.endingPosition = [ this.lastRowIndex, lines[this.lastRowIndex].indexOf('.') ];
		this.endingVertex = new Vertex(this.endingPosition);
	}

	getStartingPosition() {
		return this.startingPosition;
	}

	getStartingVertex() {
		return this.startingVertex;
	}

	getEndingPosition() {
		return this.endingPosition;
	}

	getEndingVertex() {
		return this.endingVertex;
	}

	getVertex(pos) {
		for (const v of this.vertices) {
			const vPos = v.getPos();
			if (pos[0] === vPos[0] && pos[1] === vPos[1]) {
				return v;
			}
		}
		return null;
	}

	addVertex(v) {
		this.vertices.push(v);
	}

	getVertices() {
		return this.vertices;
	}

	isValidNextStep(pos, lastPos) {
		const c = this.lines[pos[0]][pos[1]];
		if (c === '#') {
			return false;
		}
		if (c === '.') {
			return true;
		}
		if (this.stepTwo || (c === 'v' && pos[0] > lastPos[0])) {
			return true;
		}
		if (this.stepTwo || (c === '^' && pos[0] < lastPos[0])) {
			return true;
		}
		if (this.stepTwo || (c === '<' && pos[1] < lastPos[1])) {
			return true;
		}
		if (this.stepTwo || (c === '>' && pos[1] > lastPos[1])) {
			return true;
		}
		return false;
	}

	getNextSteps(pos, lastDir) {
		let nextSteps = [],
			testPos;
		// down
		testPos = [pos[0] + 1, pos[1]];
		if (lastDir !== 'u' && pos[0] !== this.lastRowIndex && this.isValidNextStep(testPos, pos)) {
			nextSteps.push(testPos);
		}
		// up
		testPos = [pos[0] - 1, pos[1]];
		if (lastDir !== 'd' && pos[0] !== 0 && this.isValidNextStep(testPos, pos)) {
			nextSteps.push(testPos);
		}
		// left
		testPos = [pos[0], pos[1] - 1];
		if (lastDir !== 'r' && pos[1] !== 0 && this.isValidNextStep(testPos, pos)) {
			nextSteps.push(testPos);
		}
		// right
		testPos = [pos[0], pos[1] + 1];
		if (lastDir !== 'l' && pos[1] !== this.lastColIndex && this.isValidNextStep(testPos, pos)) {
			nextSteps.push(testPos);
		}
		return nextSteps;
	}

	getNextDir(pos, nextPos) {
		if (nextPos[0] > pos[0]) {
			return 'd';
		} else if (nextPos[0] < pos[0]) {
			return 'u';
		} else if (nextPos[1] > pos[1]) {
			return 'r';
		}
		return 'l';
	}

	mapPaths(pos, sourceVertex, lastDir) {
		const _this = this;
		let toVisitStack = new VertexStack();
		let visitedStack = new VertexStack();
		const startVertex = _this.getStartingVertex();
		this.addVertex(startVertex);
		toVisitStack.push(startVertex);
		while (toVisitStack.size() > 0) {
			const toVisit = toVisitStack.shift();
			if (visitedStack.has(toVisit.getPos())) {
				continue;
			}
			visitedStack.push(toVisit);
			const startPos = toVisit.getPos();
			const nextSteps = _this.getNextSteps(startPos);
			nextSteps.forEach(function (nextPos) {
				const edgeDir = _this.getNextDir(startPos, nextPos);
				let length = 1,
					posToTest = nextPos,
					edgeNextSteps = _this.getNextSteps(posToTest, edgeDir);
				while (edgeNextSteps.length < 2) {
					if (edgeNextSteps.length === 0) {
						// end of the path!
						const endVertex = visitedStack.has(posToTest) ? visitedStack.get(posToTest) : new Vertex(posToTest);
						toVisit.addEdge(edgeDir, length, endVertex);
						return;
					}
					length++;
					const edgeNextDir = _this.getNextDir(posToTest, edgeNextSteps[0]);
					posToTest = edgeNextSteps[0];
					edgeNextSteps = _this.getNextSteps(posToTest, edgeNextDir);
				}
				// at the next vertex
				let nextVertex = _this.getVertex(posToTest);
				if (!nextVertex) {
					nextVertex = new Vertex(posToTest);
					_this.addVertex(nextVertex);
				}
				toVisit.addEdge(edgeDir, length, nextVertex);
				toVisitStack.push(nextVertex);
			});
		}
	}

	getPathLengths(startingLength, startingVertex, visitedVertices) {
		if (startingVertex.isEqual(this.getEndingVertex())) {
			return [ startingLength ];
		}
		let lengths = [];
		let nextVisitedVertices = new VertexStack();
		if (visitedVertices !== null) {
			nextVisitedVertices.pushAll(visitedVertices);
		}
		nextVisitedVertices.push(startingVertex);
		const edges = startingVertex.getEdges();
		for (const edge of Object.values(edges)) {
			const edgeEndVertex = edge[1];
			if (!visitedVertices.has(edgeEndVertex.getPos())) {
				const newLengths = this.getPathLengths(startingLength + edge[0], edge[1], nextVisitedVertices);
				lengths = [...lengths, ...newLengths];
			}
		}
		return lengths;
	}

}

class Vertex {
	constructor(pos) {
		this.pos = pos;
		this.edges = {};
	}

	getPos() {
		return this.pos;
	}

	addEdge(dir, length, endVertex) {
		this.edges[dir] = [ length, endVertex ];
	}

	getEdges() {
		return this.edges;
	}

	isEqual(v) {
		const [ myR, myC ] = this.pos;
		const [ vR, vC ] = v.getPos();
		return (myR === vR && myC === vC);
	}
}

class VertexStack {
	constructor() {
		this.stack = [];
	}

	has(vertexPos) {
		const [ vr, vc ] = vertexPos;
		return this.stack.some(function (sv) {
			const [ svr, svc ] = sv.getPos();
			return vr === svr && vc === svc;
		});
	}

	shift() {
		const sv = this.stack.shift();
		return sv;
	}

	push(vertex) {
		this.stack.push(vertex);
	}

	get(vertexPos) {
		const [ vr, vc ] = vertexPos;
		for (const sv of this.stack) {
			const [ svr, svc ] = sv.getPos();
			if (svr === vr && svc === vc) {
				return sv;
			}
		}
		return null;
	}

	size() {
		return this.stack.length;
	}

	getStack() {
		return this.stack;
	}

	pushAll(vertexStack) {
		this.stack = [ ...this.stack, ...vertexStack.getStack() ];
	}

	getPathString() {
		return this.stack.map(function (v) { return '[' + v.getPos().join(',') + ']'; }).join(' > ');
	}
}

function parseInput(path) {
	const lines = utils.getInputLines(path);
	return lines.map(function (line) { return line.split(''); });
}

function dayTwentyThreePartOne() {
	const mapLines = parseInput('data/day23/input.txt');
	const graph = new Graph(mapLines);
	graph.mapPaths(graph.getStartingPosition(), graph.getStartingVertex(), 'd');
	const lengths = graph.getPathLengths(0, graph.getStartingVertex(), new VertexStack());
	console.log(`day twenty three part one: longest path ${Math.max(...lengths)}`);
}

// takes about 20 seconds — good enough for me!
function dayTwentyThreePartTwo() {
	const mapLines = parseInput('data/day23/input.txt');
	const graph = new Graph(mapLines, true);
	const start = Date.now();
	graph.mapPaths(graph.getStartingPosition(), graph.getStartingVertex(), 'd');
	const lengths = graph.getPathLengths(0, graph.getStartingVertex(), new VertexStack());
	let maxLength = -Infinity;
	for (const length of lengths) {
		if (length > maxLength) {
			maxLength = length;
		}
	}
	const dur = Date.now() - start;
	console.log(`day twenty three part two: longest path ${maxLength} (duration ${dur}ms)`);
}

dayTwentyThreePartOne();
dayTwentyThreePartTwo();

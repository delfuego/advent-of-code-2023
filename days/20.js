const utils = require('../lib/utils')();
const Pulse = {
	low: 0,
	high: 1,
};

class Module {

	constructor(name, modType) {
		this.name = name;
		this.type = modType;
		this.destinationModNames = [];
		this.lowPulses = 0;
		this.highPulses = 0;
		this.buttonPress = 0;
		this.criticalValue = false;
		if (this.type === Module.type.conjunction) {
			this.rememberedInputs = {};
		} else if (this.type === Module.type.flipflop) {
			this.input = null;
			this.state = Module.state.off;
		} else if (this.type === Module.type.broadcaster) {
			this.input = null;
		} else if (this.type === Module.type.output) {
			this.input = null;
		}
	}

	static type = {
		'flipflop': '%',
		'conjunction': '&',
		'broadcaster': '#', // invented by me
		'output': '>', // also invented by me
	};

	static state = {
		'on': 1,
		'off': 0,
	};

	getName() {
		return this.name;
	}

	getType() {
		return this.type;
	}

	getInput() {
		return this.input;
	}

	getPulseCount() {
		return [ this.lowPulses, this.highPulses ];
	}

	isCriticalValue() {
		return this.criticalValue;
	}

	setButtonPress(buttonPressNum) {
		this.buttonPress = buttonPressNum;
	}

	getButtonPress() {
		return this.buttonPress;
	}

	addDestinationModule(moduleName) {
		this.destinationModNames.push(moduleName);
	}

	getDestinationModuleNames() {
		return this.destinationModNames;
	}

	getDestinationModules(modules) {
		return this.destinationModNames.map(function (n) { return modules[n]; });
	}

	addConjunctionInput(module) {
		if (this.type === Module.type.conjunction) {
			this.rememberedInputs[module.name] = Pulse.low;
		}
	}

	handleInput(pulse, moduleName) {
		if (this.type === Module.type.flipflop) {
			this.input = pulse;
			if (this.input === Pulse.low) {
				this.state = !this.state ? Module.state.on : Module.state.off;
			}
		} else if (this.type === Module.type.conjunction) {
			this.rememberedInputs[moduleName] = pulse;
		} else if (this.type === Module.type.broadcaster) {
			this.input = pulse;
		} else if (this.type === Module.type.output) {
			this.input = pulse;
		}
		if (pulse === Pulse.low) {
			this.lowPulses++;
		} else if (pulse === Pulse.high) {
			this.highPulses++;
		}
		if ('rx' === this.getName() && pulse === Pulse.low) {
			console.log(`pulse ${pulse} sent into ${this.getName()} by ${moduleName}`);
		}
		const output = this.getOutput();
		if (['nx','sp','cc','jq'].indexOf(this.getName()) > -1 && output === Pulse.high) {
			this.criticalValue = true;
		}
		return output;
	}

	getOutput() {
		if (this.type === Module.type.flipflop) {
			if (this.input === Pulse.low) {
				return this.state; // now on = 1 => high pulse = 1; now off = 0 => low pulse = 0
			}
			return null;
		} else if (this.type === Module.type.conjunction) {
			if (Object.values(this.rememberedInputs).every(function (v) { return v === Pulse.high; })) {
				return Pulse.low;
			}
			return Pulse.high;
		} else if (this.type === Module.type.broadcaster) {
			return this.input;
		}
	}

	getState() {
		let state = [ this.getName() ];
		function getInput(mod) {
			return (mod.getInput() === null ? 0 : mod.getInput());
		}
		if (this.type === Module.type.broadcaster) {
			state.push('i:' + getInput(this));
		} else if (this.type === Module.type.flipflop) {
			// state.push('i:' + getInput(this));
			state.push('s:' + this.state);
		} else if (this.type === Module.type.conjunction) {
			let ri = [];
			let ks = Object.keys(this.rememberedInputs);
			for (const k of ks) {
				ri.push('ri.' + k + ':' + this.rememberedInputs[k]);
			}
			state = [...state, ...ri];
		}
		return state.join('|');
	}

}

function mapConjunctionInputs(modules) {
	for (const k of Object.keys(modules)) {
		const m = modules[k];
		if (m.getType() === Module.type.conjunction) {
			const n = m.getName();
			for (const sk of Object.keys(modules)) {
				if (modules[sk].getDestinationModuleNames().indexOf(n) > -1) {
					m.addConjunctionInput(modules[sk]);
				}
			}
		}
	}
}

function fillOutNoOpModules(modules) {
	for (const k of Object.keys(modules)) {
		const m = modules[k];
		const dmns = m.getDestinationModuleNames();
		for (const dmn of dmns) {
			if (!modules[dmn]) {
				modules[dmn] = new Module(dmn, Module.type.output);
			}
		}
	}
}

function parseInput(path) {
	const lines = utils.getInputLines(path);
	const p = lines.map(function (line) { return line.split(' -> '); });
	let modules = {};
	p.forEach(function (parts) {
		const n = parts[0];
		const ds = parts[1].split(', ');
		let newMod;
		if (n === 'broadcaster') {
			newMod = new Module(n, Module.type.broadcaster);
		} else {
			const modType = n.charAt(0),
				trueName = n.substring(1);
			newMod = new Module(trueName, modType);
		}
		for (const dn of ds) {
			newMod.addDestinationModule(dn);
		}
		modules[newMod.getName()] = newMod;
	});
	mapConjunctionInputs(modules);
	fillOutNoOpModules(modules);
	return modules;
}

function pushButton(buttonPressNum) {
	let lowPulses = 0, // start with the button pulse
		highPulses = 0;
	let inputModuleNames = [ 'button' ],
		inputs = [ Pulse.low ],
		outputModules = [ modules.broadcaster ];
	while (outputModules.length > 0) {
		let nextInputModuleNames = [],
			nextInputs = [],
			nextOutputModules = [],
			outputModuleOutputs = [];
		// first, send input into each output module -- do all of them before getting any output
		for (let i = 0; i < outputModules.length; i++ ) {
			const omInputModuleName = inputModuleNames[i],
				omInput = inputs[i],
				om = outputModules[i];
			om.setButtonPress(buttonPressNum);
			const omOutput = om.handleInput(omInput, omInputModuleName);
			outputModuleOutputs.push(omOutput);
			if (omInput === Pulse.low) {
				lowPulses++;
			} else {
				highPulses++;
			}
		}
		// now, get output from each source module
		for (let i = 0; i < outputModules.length; i++) {
			const sm = outputModules[i];
			if (sm) {
				const smOutput = outputModuleOutputs[i];
				// const smOutput = sm.getOutput();
				if (smOutput !== null) {
					for (const dm of sm.getDestinationModules(modules)) {
						nextInputModuleNames.push(sm.getName());
						nextInputs.push(smOutput);
						nextOutputModules.push(dm);
					}
				}
			}
		}
		inputModuleNames = nextInputModuleNames;
		inputs = nextInputs;
		outputModules = nextOutputModules;
	}
	return [ lowPulses, highPulses ];
}

function dayTwentyPartOne() {
	let pulsesSent = [ 0, 0 ];
	const buttonPushes = 1000;
	for (let i = 0; i < buttonPushes; i++) {
		const newPulses = pushButton();
		pulsesSent[0] += newPulses[0];
		pulsesSent[1] += newPulses[1];
	}
	const product = pulsesSent[0] * pulsesSent[1];
	console.log(`day twenty part one: product ${product}`);
}

function dayTwentyPartTwo() {
	const criticalValueButtonPushes = {
		nx: null,
		sp: null,
		cc: null,
		jq: null,
	};
	const buttonPushes = 10000;
	for (let i = 0; i < buttonPushes; i++) {
		pushButton(i+1);
		// The idea here is that dd feeds into rx, and there are four NAND gates -- nx, sp, cc, and
		// jq -- that feed into dd. For rx to receive a low from dd, dd has to receive a HIGH from each
		// of the four NAND gates. So we need to find out the button press at which each of the four
		// flips high for the first time, and then multiply the four button press values together to
		// get the first button press where ALL FOUR are high.
		['nx','sp','cc','jq'].forEach(function (modName) {
			if (modules[modName].isCriticalValue() && criticalValueButtonPushes[modName] === null) {
				criticalValueButtonPushes[modName] = modules[modName].getButtonPress();
			}
		});
		if (Object.values(criticalValueButtonPushes).every(function (v) { return v !== null; })) {
			const product = criticalValueButtonPushes.nx * criticalValueButtonPushes.sp * criticalValueButtonPushes.cc * criticalValueButtonPushes.jq;
			console.log(`day twenty part two: ${product} button pushes for rx to get a low pulse`);
			return;
		}
	}
}

const modules = parseInput('data/day20/input.txt');
dayTwentyPartOne();
dayTwentyPartTwo();

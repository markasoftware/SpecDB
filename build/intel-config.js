const trs = require('./intel-transformers.js');
const units = require('../src/js/units');

const families = {
	122139: {
		isPart: true,
		manufacturer: 'Intel',
		type: 'CPU',
	}
};

const keyMap = {
	Lithography: 'Lithography',
	MaxTDP: { name: 'TDP', transformer: c => c + 'W' },
	ProcessorNumber: [
		'name',
		{ name: 'humanName', transformer: c => c.replace(' ', '-') },
	],
	CoreCount: 'Core Count',
	HyperThreading: { name: 'Thread Count', transformer: (c, d) => d['Core Count'] * (c ? 2 : 1) },
	CacheKB: { name: 'L2 Cache (Total)', transformer: c => units.reduce({ num: c, unit: 'KiB' }) },
	ClockSpeedMhz: { name: 'Base Frequency', transformer: c => units.reduce({ num: c, unit: 'MHz' }) },
	DieSize: { name: 'Die Size', transformer: c => c + ' mm'},
};

module.exports = { families, keyMap };

const _ = require('lodash');
const units = require('../src/js/units');
const util = require('./util');

const intelConfig = {
	// SPECIFIC
	families: {
		122139: {
			isPart: true,
			manufacturer: 'Intel',
			type: 'CPU',
		}
	},
	deferred: {
		codeName: {
			idProp: 'CodeNameId',
			valueProp: 'CodeNameText',
			procProp: 'CodeNameEPMId',
		},
	},
	// STANDARD
	keyMap: {
		codeName: [
			'data.Architecture',
			{ name: 'inherits', transformer: c => [util.urlify(c)] },
		],
		Lithography: 'data.Lithography',
		MaxTDP: { name: 'data.TDP', transformer: c => c + ' W' },
		ProcessorNumber: [
			'name',
			{ name: 'humanName', transformer: util.urlify },
		],
		CoreCount: 'data.Core Count',
		HyperThreading: { name: 'data.Thread Count', transformer: (c, d) => d.data['Core Count'] * (c ? 2 : 1) },
		NumMemoryChannels: 'data.Max Memory Channels',
		MemoryTypes: { name: 'data.Max Memory Frequency', transformer: c => _.max(c.match(/\d{4}/g)) },
		CacheKB: { name: 'data.L2 Cache (Total)', transformer: c => util.unitTransformer('KiB') },
		ClockSpeedMhz: { name: 'data.Base Frequency', transformer: c => util.unitTransformer('MHz') },
		DieSize: { name: 'data.Die Size', transformer: c => `${c} mm`},
		LaunchDate: { name: 'data.Release Date', transformer: util.isoDate },
	},
};
module.exports = intelConfig;

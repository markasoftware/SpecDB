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
		// conveniently, all objects in the odata standard have __metadata
		// it also is named in such a way that it makes sense that we use
		// it for a special purpose
		__metadata: { name: 'type', transformer: c => 'CPU' },
		codeName: [
			'data.Architecture',
			{ name: 'inherits', transformer: c => [util.urlify(c)] },
		],
		Lithography: 'data.Lithography',
		MaxTDP: { name: 'data.TDP', transformer: c => c + ' W' },
		ProcessorNumber: [
			'humanName',
			{ name: 'name', transformer: util.urlify },
			{ name: 'data.Unlocked', transformer: c => c.slice(-1) === 'K' || undefined },
		],
		CoreCount: [
			'data.Core Count',
			'data.Thread Count',
		],
		HyperThreading: { name: 'data.Thread Count', transformer: (c, d) => d.data['Core Count'] * (c ? 2 : 1) },
		NumMemoryChannels: 'data.Max Memory Channels',
		MemoryTypes: { name: 'data.Max Memory Frequency', transformer: c => `${_.max(c.match(/\d{3,}/g).map(Number))} MHz` },
		ClockSpeedMhz: { name: 'data.Base Frequency', transformer: util.unitTransformer('MHz') },
		ClockSpeedMaxMhz: { name: 'data.Boost Frequency', transformer: util.unitTransformer('MHz') },
		CacheKB: { name: 'data.L2 Cache (Total)', transformer: util.unitTransformer('KiB') },
		DieSize: { name: 'data.Die Size', transformer: c => `${c} mm`},
		BornOnDate: { name: 'data.Release Date', transformer: c => c.replace("'", ' ')
			.replace(/(?=[0-6]\d)/, '20')
			.replace(/(?=[7-9]\d)/, '19') },
		LaunchDate: { name: 'data.Release Date', transformer: util.isoDate },
		SocketsSupported: 'data.Socket',
		AESTech: 'data.AES',
		InstructionSet: { name: 'data.Other Extensions', transformer: c => c === '64-bit' ? ['x86-64'] : [] },
		InstructionSetExtensions: { name: 'data.AVX/SSE/MMX', transformer: util.substTransformer({
			'': false,
			'SSE4.1': 'SSE 4.1',
			'SSE4.2': 'SSE 4.2',
			'AVX2': 'AVX2',
			'AVX512': 'AVX512',
		}) },
	},
};
module.exports = intelConfig;

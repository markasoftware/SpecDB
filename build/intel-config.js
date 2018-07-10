const _ = require('lodash');
const units = require('../src/js/units');
const dates = require('../src/js/dates');
const util = require('./util');

const intelConfig = {
	// SPECIFIC
	// we don't use the values, they're for future use so i don't have to look
	// at the accursed odata page again
	families: {
		122139: 'Core',
		29862: 'Pentium',
		595: 'Xeon',
		43521: 'Pentium',
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
		MarketSegment: { name: 'data.Market', transformer: c => ({
			DT: 'Desktop',
			SRV: 'Server',
			EMB: 'Embedded',
			MBL: 'Mobile',
		})[c] },
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
		MemoryTypes: [
			{ name: 'data.Max Memory Frequency', transformer: c => {
				const regexMatches = c.match(/\d{3,}/g);
				if (!_.isNil(regexMatches)) {
					return `${_.max(regexMatches.map(Number))} MHz`;
				}
			} },
			{ name: 'data.Memory Type', transformer: c => c.match(/\S*DDR[^-, ]*/g).join(', ') },
		],
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
		GraphicsFreqMHz: { name: 'data.GPU Base Frequency', transformer: util.unitTransformer('MHz') },
		GraphicsMaxFreqMHz:
			{ name: 'data.GPU Boost Frequency', transformer: util.unitTransformer('MHz') },
		GraphicsMaxMemMB: [
			{ name: 'data.VRAM Type', transformer: (c, d) => d.data['Memory Type'] || 'RAM' },
			{ name: 'data.Maximum VRAM Capacity', transformer: util.unitTransformer('MiB') },
		],
		GraphicsDirectXSupport: { name: 'data.DirectX Support', transformer:
			c => _.max(c.match(/[0-9.]*/g).map(Number)).toString() },
		GraphicsOpenGLSupport: 'data.OpenGL Support',
		// TODO: GraphicsDeviceId to identify which model of HD graphics it is
	},
	sectionPages: [
		{
			toName: c => `${c.data.Market} CPUs (Intel)`,
			toHeader: c => util.bucket(5, {
				max: new Date().getFullYear(),
				maxText: 'Present',
			})(dates.parse(c.data['Release Date']).getFullYear()),
			memberSorter: (a, b) => dates.parse(b.data['Release Date']) - dates.parse(a.data['Release Date']),
			base: c => ({
				type: 'Generic Container',
				topHeader: 'SELECT ARCHITECTURE:',
				data: { Manufacturer: 'Intel' },
			}),
		},
		{
			toName: c => `${c.data.Market}-${c.data.Architecture}`,
			toHeader: c => `${
				util.bucket(1, {
					ranges: [ [ 9, 16 ], [ 17, 64 ], [ 65, 128 ]],
					max: 65,
					maxText: 'What the FUCK',
				})(c.data['Thread Count'])
			} Threads`,
			base: c => ({
				humanName: c[0].data.Architecture,
				type: 'CPU Architecture',
				topHeader: 'SELECT CPU:',
				data: {
					Manufacturer: 'Intel',
					Lithography: c[0].data.Lithography,
					'Release Date': _.minBy(
						c
							.filter(d => d.data['Release Date'])
							.map(d => d.data['Release Date']),
						d => dates.parse(d),
					) || null,
					Sockets: [ c[0].data.Socket ],
				},
			}),
		},
	],
	// TODO: maybe prune properties only useful during sectionPages? (market)
};
module.exports = intelConfig;

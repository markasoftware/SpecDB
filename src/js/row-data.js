// provide row comparison, post-processing, pre-processing, etc

const units = require('./units');
const dates = require('./dates');

// these are the "generic" types that some of our rows classify as
// preprocess takes in the cell value, then turns it into something compare can use
// compare should return the "best" out of both parameters
// postprocess takes the original value and turns it into hooman-readable form
// preprocess and postprocess may be omitted
const unitToNum = inStr => units.toNumber(units.parseString(inStr));

const versionCompare = (a, b) => {
	const aSplit = a.split('.').map(Number);
	const bSplit = b.split('.').map(Number);
	// if any part of b is lower than a, a is greater, otherwise equal or worse
	for(let i = 0; i < Math.min(aSplit.length, bSplit.length); ++i) {
		if (aSplit[i] !== bSplit[i]) {
			return aSplit[i] > bSplit[i];
		}
	}
	// if all available digits are the same, the longer one is better (1.1 is better than 1)
	return a.length > b.length;
}

const boolPost = c => c ? 'Yes' : 'No';

// NaN check is for TBA and stuff
const numberUpCompare = (a, b) => a > b || isNaN(b);
const numberDownCompare = (a, b) => a < b || isNaN(b);

const types = {
	numberUp: {
		preprocess: parseFloat,
		compare: numberUpCompare,
	},
	numberDown: {
		preprocess: parseFloat,
		compare: numberDownCompare,
	},
	unitUp: {
		preprocess: unitToNum,
		compare: numberUpCompare,
	},
	boolTrue: {
		compare: a => a,
		postprocess: boolPost,
		// may have to remove this later
		default: false,
	},
	boolFalse: {
		compare: a => !a,
		postprocess: boolPost,
		default: true,
	},
	dateUp: {
		preprocess: dates.parse,
		compare: numberUpCompare,
		postprocess: dates.longify,
	},
	versionUp: {
		compare: versionCompare,
		postprocess: c => c === '0' ? 'No' : c,
		default: '0',
	},
	enum: (values, opts = {}) => ({
		compare: (a, b) => {
			if (opts.allowPartialMatch) {
				for (const value of values) {
					if (a.includes(value) != b.includes(value)) {
						return a.includes(value);
					}
				}
				// both equal
				return true;
			}
			return values.indexOf(a) < values.indexOf(b);
		},
		default: values[values.length - 1],
	}),
	list: {
		preprocess: c => c instanceof Array ? c : [c],
		default: [],
	}
};
// for thing that rely on other functions in there
Object.assign(types, {
	memory: types.enum(
		['HBM2', 'GDDR6', 'GDDR5X', 'HBM', 'GDDR5', 'GDDR4', 'GDDR3', 'DDR4', 'DDR3', 'DDR2', 'DDR', ''],
		{ allowPartialMatch: true },
	),
});

// for testing
module.exports.types = types;

module.exports.sections = [
	{
		name: 'Basic Specs',
		display: true,
		rows: [
			{
				name: 'Base Frequency',
				processor: types.unitUp,
			},
			{
				name: 'Boost Frequency',
				processor: types.unitUp,
			},
			{
				name: 'GPU Base Frequency',
				processor: types.unitUp,
			},
			{
				name: 'GPU Boost Frequency',
				processor: types.unitUp,
			},
			{
				name: 'Core Count',
				processor: types.numberUp,
			},
			{
				name: 'Thread Count',
				processor: types.numberUp,
			},
			{
				name: 'FP32 Compute',
				processor: types.unitUp,
			},
			{
				name: 'Render Output Unit Count',
				processor: types.numberUp,
			},
			{
				name: 'VRAM Capacity',
				processor: types.unitUp,
			},
			{
				name: 'Release Date',
				processor: types.dateUp,
			},
			{
				name: 'TDP',
				processor: types.numberDown,
			}
		],
	},
	{
		name: 'Benchmarks',
		display: true,
		rows: [
			{
				name: 'UserBenchmark CPU Score',
				processor: types.numberUp,
			},
			{
				name: 'UserBenchmark GPU Score',
				processor: types.numberUp,
			},
			{
				name: '3DMark Fire Strike Physics Score',
				processor: types.numberUp,
			},
			{
				name: '3DMark Fire Strike Graphics Score',
				processor: types.numberUp,
			},
			{
				name: 'Geekbench Single-Core Score',
				processor: types.numberUp,
			},
			{
				name: 'Geekbench Multi-Core Score',
				processor: types.numberUp,
			},
		],
	},
	{
		name: 'Architectural Info',
		display: false,
		rows: [
			{
				name: 'Architecture',
			},
			{
				name: 'GPU',
			},
			{
				name: 'Codename',
			},
			{
				name: 'GPU Model',
			},
			{
				name: 'Die Size',
			},
			{
				name: 'Socket',
				processor: types.list,
			},
			{
				name: 'Lithography',
				processor: types.numberDown,
			},
			{
				name: 'Stepping',
				processor: types.list,
			},
		],
	},
	{
		name: 'Advanced Specs',
		display: false,
		rows: [
			{
				name: 'Module Count',
				processor: types.numberUp,
			},
			{
				name: 'L1 Cache (Data)',
				processor: types.unitUp,
			},
			{
				name: 'L1 Cache (Instruction)',
				processor: types.unitUp,
			},
			{
				name: 'L2 Cache (Total)',
				processor: types.unitUp,
			},
			{
				name: 'L3 Cache (Total)',
				processor: types.unitUp,
			},
			{
				name: 'FP64 Compute',
				processor: types.unitUp,
			},
			{
				name: 'XFR Frequency',
				processor: types.unitUp,
			},
			{
				name: 'Shader Processor Count',
				processor: types.numberUp,
			},
			{
				name: 'Texture Mapping Unit Count',
				processor: types.numberUp,
			},
		],
	},
	{
		name: 'VRAM Specs',
		display: false,
		rows: [
			{
				name: 'VRAM Type',
				processor: types.memory,
			},
			{
				name: 'VRAM Frequency',
				processor: types.unitUp,
			},
			{
				name: 'VRAM Bandwidth',
				processor: types.unitUp,
			},
			{
				name: 'VRAM Bus Width',
				processor: types.numberUp,
			},
			{
				name: 'Maximum VRAM Capacity',
				processor: types.unitUp,
			},
		],
	},
	{
		name: 'Compatibility',
		display: false,
		rows: [
			{
				name: 'Max Memory Channels',
				processor: types.numberUp,
			},
			{
				name: 'Memory Type',
				processor: types.memory,
			},
			{
				name: 'Max Memory Frequency',
				processor: types.unitUp,
			},
			{
				name: 'Compatible Chipsets',
				processor: types.list,
			},
		],
	},
	{
		name: 'x86 Extensions',
		display: false,
		rows: [
			{
				name: 'AVX/SSE/MMX',
				processor: types.enum(['AVX-512', 'AVX2', 'AVX',
					'SSE 4.2', 'SSE 4.1', 'SSE4a', 'SSSE3', 'SSE3', 'SSE2', 'SSE', 
					'EMMX', 'MMX',
					'No']),
			},
			{
				name: 'FMA4',
				processor: types.boolTrue,
			},
			{
				name: 'FMA3',
				processor: types.boolTrue,
			},
			{
				name: 'BMI',
				processor: types.enum(['BMI2', 'BMI', 'No']),
			},
			{
				name: 'AES',
				processor: types.boolTrue,
			},
			{
				name: 'SHA',
				processor: types.boolTrue,
			},
			{
				name: 'Other Extensions',
				processor: types.list,
			},
		],
	},
	{
		name: 'Features',
		display: false,
		rows: [
			{
				name: 'Unlocked',
				processor: types.boolTrue,
			},
			{
				name: 'XFR Support',
				processor: types.boolTrue,
			},
			{
				name: 'DirectX Support',
				processor: types.versionUp,
			},
			{
				name: 'HLSL Shader Model',
				processor: types.versionUp,
			},
			{
				name: 'OpenGL Support',
				processor: types.versionUp,
			},
			{
				name: 'Vulkan Support',
				processor: types.versionUp,
			},
			{
				name: 'OpenCL Support',
				processor: types.versionUp,
			},
			{
				name: 'FreeSync Support',
				processor: types.boolTrue,
			},
			{
				name: 'Crossfire Support',
				processor: types.enum(['XDMA', 'CrossfireX', 'Hybrid', 'No']),
			},
		],
	},
]

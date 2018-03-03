// provide row comparison, post-processing, pre-processing, etc

// these are the "generic" types that some of our rows classify as
// preprocess takes in the cell value, then turns it into something compare can use
// compare should return the "best" out of both parameters
// postprocess takes the original value and turns it into hooman-readable form
// preprocess and postprocess may be omitted
const unitToNum = inStr => {
	const splitUp = inStr.split(' ');
	const units = {
		'KiB': 1024,
		'MiB': 1024 * 1024,
		'GiB': 1024 * 1024 * 1024,
		'KB': 1000,
		'MB': 1000 * 1000,
		'GB': 1000 * 1000 * 1000,
		'KiB/s': 1024,
		'MiB/s': 1024 * 1024,
		'GiB/s': 1024 * 1024 * 1024,
		'KB/s': 1000,
		'MB/s': 1000 * 1000,
		'GB/s': 1000 * 1000 * 1000,
		'Hz': 1,
		'KHz': 1000,
		'MHz': 1000 * 1000,
		'GHz': 1000 * 1000 * 1000,
		'KFLOPS': 1000,
		'MFLOPS': 1000 * 1000,
		'GFLOPS': 1000 * 1000 * 1000,
		'TFLOPS': 1000 * 1000 * 1000 * 1000,
	}
	return units[splitUp[1]] ? splitUp[0] * units[splitUp[1]] : +splitUp[0];
}

const versionCompare = (a, b) => {
	const aSplit = a.split('.').map(Number);
	const bSplit = b.split('.').map(Number);
	// if any part of b is lower than a, a is greater, otherwise equal or worse
	for(let i = 0; i < Math.min(aSplit.length, bSplit.length); ++i) {
		if(aSplit[i] > bSplit[i]) {
			return true;
		}
		if(aSplit[i] < bSplit[i]) {
			return false;
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
		preprocess: c => {
			// yyyy-mm-dd
			if(/^\d{4}-\d{2}-\d{2}$/.test(c)) {
				return new Date(c);
			}
			// yyyy-mm
			if(/^\d{4}-\d{2}$/.test(c)) {
				return new Date(`${c}-01`);
			}
			// yyyy
			if(/^\d{4}$/.test(c)) {
				return new Date(+c, 0);
			}
			// quarter or half (Q2 2017, for example)
			if(/^[QH]\d \d{4}$/.test(c)) {
				const yyyy = c.slice(3);
				// H2 == Q3 for comparison purposes
				const q = c.slice(0, 2) === 'H2' ? 3 : +(c[1]);
				return new Date(yyyy, (q - 1) * 3, 1);
			}
			// something weird, maybe TBA?
			return new Date(0);
		},
		compare: numberUpCompare,
		postprocess: c => {
			const months = [
				'January',
				'February',
				'March',
				'April',
				'May',
				'June',
				'July',
				'August',
				'September',
				'October',
				'November',
				'December',
			];
			const getMonth = () => months[c.slice(5, 7) - 1];
			// yyyy-mm-dd
			if(/^\d{4}-\d{2}-\d{2}$/.test(c)) {
				return `${getMonth()} ${c.slice(8)}, ${c.slice(0, 4)}`;
			}
			// yyyy-mm
			if(/^\d{4}-\d{2}$/.test(c)) {
				return `${getMonth()} ${c.slice(0, 4)}`;
			}
			// Quarters
			if(/^Q\d \d{4}$/.test(c)) {
				return `Quarter ${c[1]}, ${c.slice(3)}`;
			}
			// Halves
			if(/^H\d \d{4}$/.test(c)) {
				return `Half ${c[1]}, ${c.slice(3)}`;
			}
			// yyyy and any other weird stuff
			return c;
		}
	},
	versionUp: {
		compare: versionCompare,
		postprocess: c => c === '0' ? 'No' : c,
		default: '0',
	},
	enum: values => ({
		compare: (a, b) => values.indexOf(a) < values.indexOf(b),
		default: values[values.length - 1],
	}),
	list: {
		preprocess: c => c instanceof Array ? c : [c],
		default: [],
	}
};

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
				name: 'VRAM Type',
				processor: types.enum(['HBM2', 'GDDR6', 'GDDR5X', 'HBM', 'GDDR5', 'GDDR4', 'GDDR3', 'DDR4', 'DDR3', 'DDR2', 'DDR', 'No']),
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

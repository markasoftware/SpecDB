const objectAssign = require('object-assign')

const units = [
	// special unit
	{ 'count': 1 },
	{
		'KiB': 1024,
		'MiB': 1024 * 1024,
		'GiB': 1024 * 1024 * 1024,
	},
	{
		'KB': 1000,
		'MB': 1000 * 1000,
		'GB': 1000 * 1000 * 1000,
	},
	{
		'KiB/s': 1024,
		'MiB/s': 1024 * 1024,
		'GiB/s': 1024 * 1024 * 1024,
	},
	{
		'KB/s': 1000,
		'MB/s': 1000 * 1000,
		'GB/s': 1000 * 1000 * 1000,
	},
	{
		'Hz': 1,
		'KHz': 1000,
		'MHz': 1000 * 1000,
		'GHz': 1000 * 1000 * 1000,
	},
	{
		'KFLOPS': 1000,
		'MFLOPS': 1000 * 1000,
		'GFLOPS': 1000 * 1000 * 1000,
		'TFLOPS': 1000 * 1000 * 1000 * 1000,
	},
];
const flatUnits = units.reduce((acc, c) => objectAssign({}, acc, c), {});

const unitsJs = {
	parseString: str => {
		const splitUp = str.split(' ');
		return {
			num: +splitUp[0],
			unit: flatUnits[splitUp[1]] ? splitUp[1] : 'count',
		};
	},
	toNumber: unitObj => flatUnits[unitObj.unit] * unitObj.num,
	toString: unitObj => unitObj.unit === 'count' ?
		`${unitObj.num}` :
		`${unitObj.num} ${unitObj.unit}`,
	reduce: (unitObj, minReducedValue = 1) => {
		const num = unitsJs.toNumber(unitObj);
		// find which sub-group of units we belong to
		const unitGroup = units.filter(c => Object.keys(c).includes(unitObj.unit))[0];
		// now find which unit we can divide by, but still be above minReducedValue
		const best = Object.keys(unitGroup).reduce((acc, key) => {
			const newNum = num / unitGroup[key];
			// this is the best unit so far if it is lower than anything else, but
			// still above minReducedValue. However, sometimes all units are below
			// minReducedValue, and in this case we want it to be bigger.
			const betterThanBefore = newNum > minReducedValue ?
				newNum < acc.num :
				newNum > acc.num;
			return betterThanBefore ? { num: newNum, unit: key } : acc;
		}, { num: Infinity, unit: 'fuck' });
		return best;
	},
};
module.exports = unitsJs;

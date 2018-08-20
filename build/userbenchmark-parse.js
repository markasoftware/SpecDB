const fs = require('fs');
const _ = require('lodash');
const Papa = require('papaparse');
const util = require('./util');

// @param brand = the Brand from the CSV
// @param model = the Model from the CSV
// @return = a string of the name in SpecDB format
// TODO: also do matcher functions for the types of parts that can't be exactly matched elegantly
const generateName = (brand, model) => {
	const hyphenated = model.replace(/[ _-]/g, '-');
	if (brand === 'Intel') {
		return hyphenated;
	}
	// otherwise, it must be AMD
	if (hyphenated.slice(0, 5) === 'Ryzen') {
		// threadripper
		if (hyphenated.slice(6, 2) === 'TR') {
			return hyphenated.slice(6);
		}
		// not threadripper
		return `R${hyphenated.slice(6)}`;
	}
};

const [ cpusCsvPath, gpusCsvPath, outputPath] = process.argv.slice(2);
const allInData = _.flatMap([cpusCsvPath, gpusCsvPath], path =>
	Papa.parse(fs.readFileSync(path, 'utf8'), { header: true }).data);
const outDataArr = allInData
	.filter(row => row.Brand && row.Model && row.Benchmark)
	.map(row => ({
		name: generateName(row.Brand, row.Model),
		matcher: true,
		data: {
			'UserBenchmark Score': row.Benchmark,
		},
	}));
util.writeJSON(outputPath, outDataArr);

// TODO: write the tests so this doesn't go to waste
module.exports = {
	generateName,
}

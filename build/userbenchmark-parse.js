const fs = require('fs');
const _ = require('lodash');
const Papa = require('papaparse');
const util = require('./util');

// @param brand = the Brand from the CSV
// @param model = the Model from the CSV
// @return = a string of the name in SpecDB format
// TODO: also do matcher functions for the types of parts that can't be exactly matched elegantly
/*
const generateName = (type, brand, model) => {
	const hyphenated = model.replace(/[ _-]/g, '-');
	if (type === 'CPU') {
		if (brand === 'Intel') {
			// many Intel CPUs are just hyphenated, but a few exceptions...
			// xeon with V4 on the end
			if (/-v\d$/.test(hyphenated)) {
				// remove the leading whitespace and capitalize V
				return hyphenated.replace(/-v(?=\d$)/, 'V');
			}
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
	}
	if (type === 'GPU') {
		if (brand === 'AMD') {
			// R?-???
			if (/R[579X] \d\d\d/.test(model)) {
				// handle optional GB.
				const regexMatch = hyphenated.match(/(R[579X]-\d\d\dX?)(-(\d+)GB)?/);
				if (regexMatch) {
					const [ , rxXxx, , memorySize ] = regexMatch;
					return memorySize ?
						`${rxXxx}-${memorySize}GiB` :
						rxXxx;
				}
			}
			// TODO: HD and other
		}
	}
	// and just hope for the best...
	return hyphenated;
};
*/

const csvPaths = process.argv.slice(2, -1);
const outputPath = _.last(process.argv);
const parseFile = path => Papa.parse(fs.readFileSync(path, 'utf8'), { header: true }).data;
const allInData = _.flatMap(csvPaths, parseFile);
const outDataArr = allInData
	.filter(row => row.Type && row.Brand && row.Model && row.Benchmark)
	.map(row => ({
		matcherInfo: {
			name: row.Model,
			type: row.Type,
			brand: row.Brand,
			source: 'userbenchmark',
		},
		data: {
			[`UserBenchmark ${row.Type} Score`]: row.Benchmark,
		},
	}));
util.writeJSON(outputPath, outDataArr);

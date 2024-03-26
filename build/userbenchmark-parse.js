const fs = require('fs');
const _ = require('lodash');
const Papa = require('papaparse');
const util = require('./util');

const csvPaths = process.argv.slice(2, -1);
const outputPath = _.last(process.argv);
const parseFile = path => Papa.parse(fs.readFileSync(path, 'utf8'), { header: true }).data;
const allInData = _.flatMap(csvPaths, parseFile);
const outDataArr = allInData
	.filter(row => row.Type && row.Brand && row.Model && row.Benchmark)
	.map(row => ({
		combineMetadata: {
			matcherInfo: {
				name: row.Model,
				type: row.Type,
				brand: row.Brand,
				source: 'userbenchmark',
			},
		},
		data: {
			[`UserBenchmark ${row.Type} Score`]: row.Benchmark,
		},
	}));
util.writeJSON(outputPath, outDataArr);

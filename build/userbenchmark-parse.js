const fs = require('fs');
const _ = require('lodash');
const Papa = require('papaparse');
const util = require('./util');

const [ cpusCsvPath, gpusCsvPath, outputPath] = process.argv.slice(2);
const allInData = _.flatMap([cpusCsvPath, gpusCsvPath], path =>
	Papa.parse(fs.readFileSync(path, 'utf8'), { header: true }).data);
const outDataArr = allInData
.filter(row => row.Brand && row.Model && row.Benchmark)
.map(row => ({
	userbenchmarkBrand: row.Brand,
	userbenchmarkModel: row.Model,
	data: {
		'UserBenchmark Score': row.Benchmark,
	},
}));
util.writeJSON(outputPath, outDataArr);

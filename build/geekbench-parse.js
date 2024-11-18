const fs = require('fs');
const cheerio = require('cheerio');
const _ = require('lodash');
const util = require('./util');

const [cpuPath, gpuPath, gpuPath2, outPath] = process.argv.slice(2);
// console.log("FIND MEEEEEEEEEEEEEEE!!!!!!!")
// console.log(cpuPath, gpuPath, outPath);

const parse = (tableEl, type, partType) => {
	const $ = cheerio.load(tableEl);
	const rawData = $(tableEl).find('tr')
		.map((i, el) => {
			let name = '';
			if(partType == 'cpu'){
				name = $(el).find('.name a').text();
			} else {
				name = $(el).find('.name').text();
			}
			const score = +$(el).find('.score').text();
			return { name, score };
		}).get();
	const niceData = rawData.filter(c => c.score).map(c => ({
		combineMetadata: {
			matcherInfo: {
				name: c.name.replace(/\n/g,""),
				type: partType,
				source: 'geekbench',
			},
		},
		data: {
			[`Geekbench ${type} Score`]: c.score,
		},
	}));
	return niceData;
}

const cpuParse = (inPath) => {
	const $ = cheerio.load(fs.readFileSync(inPath, 'utf8'));
	return _.flatten($('.table.benchmark-chart-table tbody').map((i, el) => {
		switch (i) {
			case 0:
				return parse(el, 'Single-Core', 'cpu');
				break;
			case 1:
				return parse(el, 'Multi-Core', 'cpu');
				break;
			default:
				console.log('WARNING: More than two geekbench tables! Their site must have changed!');
				return [];
				// fuck it just put 'em everywhere
				break;
		}
	}).get())
}

const gpuParse = (inPath) => {
	const $ = cheerio.load(fs.readFileSync(inPath, 'utf8'));
	return _.flatten($('.table.benchmark-chart-table tbody').map((i, el) => {
		switch (i) {
			case 0:
				return parse(el, 'Vulkan', 'gpu');
				break;
			default:
				console.log('WARNING: More than one geekbench tables! Their site must have changed!');
				return [];
				// fuck it just put 'em everywhere
				break;
		}
	}).get())
}

const gpuParse2 = (inPath) => {
	const $ = cheerio.load(fs.readFileSync(inPath, 'utf8'));
	return _.flatten($('.table.benchmark-chart-table tbody').map((i, el) => {
		switch (i) {
			case 0:
				return parse(el, 'OpenCl', 'gpu');
				break;
			default:
				console.log('WARNING: More than one geekbench tables! Their site must have changed!');
				return [];
				// fuck it just put 'em everywhere
				break;
		}
	}).get())
}


util.writeJSON(outPath,
	cpuParse(cpuPath).concat(
		gpuParse(gpuPath).concat(
			gpuParse2(gpuPath2)
		)
	)
);

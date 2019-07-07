const fs = require('fs');
const cheerio = require('cheerio');
const util = require('./util');

const parse = (path, partType, benchmarkType) => {
	const $ = cheerio.load(fs.readFileSync(path, 'utf8'));
	// i fucking hate jQuery
	const rawData = $('#productTable tr')
		.map((i, el) => {
			const name = $(el).find('a.OneLinkNoTx').text();
			const score = +$(el).find('.performance .bar-score').text();
			return { name, score };
		}).get();
	// c => c.score sometimes gets rid of new GPUs which are listed, but
	// whose score is displayed as "0" (this is good)
	const niceData = rawData.filter(c => c.score).map(c => ({
		combineMetadata: {
			matcherInfo: {
				name: c.name,
				type: partType,
				source: '3dmark',
			},
		},
		data: {
			[`3DMark Fire Strike ${benchmarkType} Score`]: c.score,
		},
	}));
	return niceData;
}

const [cpuPath, gpuPath, outPath] = process.argv.slice(2);
util.writeJSON(outPath,
	parse(cpuPath, 'cpu', 'Physics').concat(
		parse(gpuPath, 'gpu', 'Graphics')
	)
);

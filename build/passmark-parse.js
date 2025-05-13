const fs = require('fs');
const cheerio = require('cheerio');
const _ = require('lodash');
const util = require('./util');

const parse = (path, partType, benchmarkType) => {
	const $ = cheerio.load(fs.readFileSync(path, 'utf8'));
	// i fucking hate jQuery
	const rawData = $('div#mark.main div.chart_body ul.chartlist li')
		.map((i, el) => {
			const name = $(el).find('span.prdname').text();
			const score = +(_.trim($(el).find('span.count').text()).replace(',',''));
			return { name, score };
		}).get();
	// c => c.score sometimes gets rid of new GPUs which are listed, but
	// whose score is displayed as "0" (this is good)
	if(partType == "gpu"){
		const niceData = rawData.filter(c => c.score).map(c => ({
			combineMetadata: {
				matcherInfo: {
					name: c.name,
					type: partType,
					source: 'psmk',
				},
			},
			data: {
				[`PassMark ${benchmarkType} Score`]: c.score,
			},
		}));
		return niceData;
	}else {
		const niceData = rawData.filter(c => c.score).map(c => ({
			combineMetadata: {
				matcherInfo: {
					name: c.name,
					type: partType,
					source: 'psmk',
				},
			},
			data: {
				[`PassMark ${benchmarkType} Score`]: c.score,
			},
		}));
		return niceData;
	}
}

const [gpuPath, outPath] = process.argv.slice(2);
util.writeJSON(outPath,
	(
		parse(gpuPath, 'gpu', 'Graphics')
	)
);

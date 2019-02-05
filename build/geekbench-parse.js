const fs = require('fs');
const cheerio = require('cheerio');
const _ = require('lodash');
const util = require('./util');

const [inPath, outPath] = process.argv.slice(2);

const parse = (tableEl, type) => {
	const rawData = $(tableEl).find('tr')
		.map((i, el) => {
			const name = $(el).find('.name a').text();
			const score = +$(el).find('.score').text();
			return { name, score };
		}).get();
	const niceData = rawData.filter(c => c.score).map(c => ({
		matcherInfo: {
			name: c.name,
			type: 'cpu',
			source: 'geekbench',
		},
		data: {
			[`Geekbench ${type} Score`]: c.score,
		},
	}));
	return niceData;
}

const $ = cheerio.load(fs.readFileSync(inPath, 'utf8'));
util.writeJSON(outPath, _.flatten($('#pc.table.processor-benchmark tbody').map((i, el) => {
	switch (i) {
		case 0:
			return parse(el, 'Single-Core');
			break;
		case 1:
			return parse(el, 'Multi-Core');
			break;
		default:
			console.log('WARNING: More than two geekbench tables! Their site must have changed!')
			return [];
			// fuck it just put 'em everywhere
			break;
	}
}).get()));

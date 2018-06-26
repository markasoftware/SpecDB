const fs = require('fs');

const megaYaml = require('./megayaml');

const [basePath, specOutPath, sitemapOutPath] = process.argv.slice(2);

const specs = megaYaml.parse(basePath);
const sitemap = [
	'https://specdb.info/#!/',
	'https://specdb.info/#!/about',
	...Object.keys(specs)
		.filter(k => specs[k].isPart)
		.map(k => `https://specdb.info/#!/${k}`),
];

fs.writeFileSync(specOutPath, 'module.exports = ' + JSON.stringify(specs) + ';');
fs.writeFileSync(sitemapOutPath, sitemap.join('\n'));

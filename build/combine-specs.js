const fs = require('fs');
const _ = require('lodash');

const readJSON = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const merger = (a, b) => {
	if (_.isArray(a)) {
		return a.concat(b);
	}
}

const [ outputFile, sitemapFile, authoritativeFile, ...otherFiles ] = process.argv.slice(2);

let toOutput = {};
_.mergeWith(toOutput, ...otherFiles.map(readJSON), merger);

// authoritativeFile is separate from otherFiles because it is conceptually different
// additionally, in between other files and authoritative, there will probably be
// some specially-managed stuff in the future, like benchmark data which needs to know
// about what parts exist in order to merge properly.

_.mergeWith(toOutput, readJSON(authoritativeFile), merger);

// INHERITS
const resolveInheritance = k => {
	// prefer dedicated inheritance over categories
	if (`HIDDEN-${k}` in toOutput) {
		k = `HIDDEN-${k}`;
	}
	if ('inherits' in toOutput[k]) {
		toOutput[k].data = _.mergeWith({},
			...toOutput[k].inherits.map(resolveInheritance),
			toOutput[k].data,
			merger);
		delete toOutput[k].inherits;
	}
	return toOutput[k].data;
};
Object.keys(toOutput).forEach(resolveInheritance);
toOutput = _.pickBy(toOutput, v => !v.hidden);

fs.writeFileSync(outputFile, `module.exports=${JSON.stringify(toOutput)}`, 'utf8');

const fixedSitemapUrls = [
	'https://specdb.info/#!/',
	'https://specdb.info/#!/about',
];
const dynamicSitemapUrls = Object.keys(toOutput).map(c => `https://specdb.info/#!/${c}`);
const allSitemapUrls = fixedSitemapUrls.concat(dynamicSitemapUrls);
fs.writeFileSync(sitemapFile, allSitemapUrls.join('\n'), 'utf8');

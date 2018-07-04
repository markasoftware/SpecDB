const fs = require('fs');
const _ = require('lodash');
const util = require('./util');

const [ outputFile, sitemapFile, authoritativeFile, ...otherFiles ] = process.argv.slice(2);

let toOutput = {};
_.mergeWith(toOutput, ...otherFiles.map(util.readJSON), util.merger);

// authoritativeFile is separate from otherFiles because it is conceptually different
// additionally, in between other files and authoritative, there will probably be
// some specially-managed stuff in the future, like benchmark data which needs to know
// about what parts exist in order to merge properly.

_.mergeWith(toOutput, util.readJSON(authoritativeFile), util.merger);

// INHERITS
const noInherits = new Set();
const resolveInheritance = k => {
	// prefer dedicated inheritance over categories
	if (`HIDDEN-${k}` in toOutput) {
		k = `HIDDEN-${k}`;
	}
	if (_.isNil(toOutput[k])) {
		noInherits.add(k);
		return {};
	}
	if ('inherits' in toOutput[k]) {
		toOutput[k].data = _.mergeWith({},
			...toOutput[k].inherits.map(resolveInheritance),
			toOutput[k].data,
			util.merger);
		delete toOutput[k].inherits;
	}
	return toOutput[k].data;
};
Object.keys(toOutput).forEach(resolveInheritance);
noInherits.forEach(c => console.error(`WARNING: Could not find spec object ${c}`));
toOutput = _.pickBy(toOutput, v => !v.hidden);

fs.writeFileSync(outputFile, `module.exports=${JSON.stringify(toOutput)}`, 'utf8');

const fixedSitemapUrls = [
	'https://specdb.info/#!/',
	'https://specdb.info/#!/about',
];
const dynamicSitemapUrls = Object.keys(toOutput).map(c => `https://specdb.info/#!/${c}`);
const allSitemapUrls = fixedSitemapUrls.concat(dynamicSitemapUrls);
fs.writeFileSync(sitemapFile, allSitemapUrls.join('\n'), 'utf8');

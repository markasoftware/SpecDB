const fs = require('fs');
const _ = require('lodash');

const readJSON = path => JSON.parse(fs.readFileSync(path, 'utf8'));

const [ outputFile, sitemapFile, authoritativeFile, ...otherFiles ] = process.argv.slice(2);

const toOutput = {};
for (let otherFile of otherFiles) {
	_.merge(toOutput, readJSON(otherFile));
}

// authoritativeFile is separate from otherFiles because it is conceptually different
// additionally, in between other files and authoritative, there will probably be
// some specially-managed stuff in the future, like benchmark data which needs to know
// about what parts exist in order to merge properly.

_.merge(toOutput, readJSON(authoritativeFile));
fs.writeFileSync(outputFile, `module.exports=${JSON.stringify(toOutput)}`, 'utf8');

const fixedSitemapUrls = [
	'https://specdb.info/#!/',
	'https://specdb.info/#!/about',
];
const dynamicSitemapUrls = Object.keys(toOutput).map(c => `https://specdb.info/#!/${c}`);
const allSitemapUrls = fixedSitemapUrls.concat(dynamicSitemapUrls);
fs.writeFileSync(sitemapFile, allSitemapUrls.join('\n'), 'utf8');

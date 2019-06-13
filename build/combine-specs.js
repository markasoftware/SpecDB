const fs = require('fs');
const _ = require('lodash');
const debug = require('debug')('specdb.combine-specs');
const util = require('./util');
const combineUtil = require('./combine-util');

/*
 * Spec combination process:
 * 
 * 1. Create array of arrays: Outer is order of priority, inner is unordered array of yamls from respective parse.json
 * 1. Convert the inner arrays of yamls into arrays of items, parsing things into matchers if possible.
 * 1. Convert to a flat list of { priority, item: innerItem }
 * 1. Split into matchers and explicits, same structure as above
 * 1. Apply all explicits to keyedItemsDiscretePriority to create { 'i5-8500': [ { priority, item } ] }
 * 1. Apply all matches to keyedItemsDiscretePriority by iterating through each matcher, and testing against each keyedItemDiscretePriority
 * 1. Flatten discrete into toReturn
 * 1. return toReturn <-- don't forget this shit
 * 
 * fuck, this isn't markdown!
 * 
 * Now, restraints/things we want to assert about the data:
 *  - Missing required subtitle props
 *  - Things being imported that do not exist
 */

/*
 * Terminology:
 *  - Flat: *not* keyed by name, for example: [ { name: 'hello', ...data }, { name: 'meow', ...data } ]
 *  - Keyed: Keyed by name, eg: { hello: { ...data }, meow: { ...data } }
 *  - Discrete: With different priority items kept separately, can be either flat or keyed. eg of flat:
 *       [ { priority: 0, item: { name: 'hello', ...data } }, { priority: 5, item: { name: 'bye', ...data } } ]
 *     and eg of keyed:
 *       { hello: [ { priority: 0, item: { ...data } } ] }
 *  - Combined: With all priority items combined in the correct order. keyedCombined is the same format as
 *    in spec-data.js, the final thing. Note that this doesn't necessarily mean that a keyedCombined object
 *    is ready to be written to disk; it might only contain some of the data, or it might contain extranneous data
 *  - Explicit: An item with an "exact" name. An item with an explicit name will create that name if nothing else
 *    has that name.
 *  - Matcher: An item which is a "matcher". It will never cause the creation of a new name, only add data to a
 *    part which was created by an explicit item.
 *  - String matcher: An item which has a fixed name, but won't create that name.
 *  - Function matcher: An item with a smart function matcher, the part's data will be applied to all parts for
 *    which the predicate returns true
 */

const [ outputFile, sitemapFile, ...parsedPaths ] = process.argv.slice(2);

const readAndDeserialize = cliPath => {
	const [path, deserializerPath] = cliPath.split(':');
	const serialized = util.readJSON(path);
	// TODO: this is actually the exact same is the readJSON implementation
	return deserializerPath ?
		require(`${process.cwd()}/${deserializerPath}`)(serialized)
		: serialized;
}

const doubleArr = parsedPaths.map(cliPath => {
	const yamls = readAndDeserialize(cliPath);
	if (!_.isArray(yamls)) {
		throw new Error(`ERROR: Parsed data at ${path} was not an array. Make sure it's not keyed by name!`);
		return;
	}
	// Why not put this later? Because i don't want to have to do a two-layer map right afterwards for no reason,
	// nor have to be ready to handle arrays for the rest of the script!
	return combineUtil.duplicateOn(yamls.map(combineUtil.applyMetadata).filter(_.identity), 'name');
});

const flatPrioritizedItems = _.flatMap(doubleArr, (items, i) =>
	items.map(item => ({ priority: i, item }))
);
debug(`Total items (flat discrete) properties: ${flatPrioritizedItems.length}`);

const keyedAllDiscrete = combineUtil.applyMatchers(flatPrioritizedItems);
debug(`Total item count (combined): ${Object.keys(keyedAllDiscrete).length}`);
const keyedAllCombined = combineUtil.undiscrete(keyedAllDiscrete);

const toReturn = _.mapValues(combineUtil.filterYamls(keyedAllCombined), combineUtil.stripMetadata);
debug(`Final item count: ${Object.keys(toReturn).length}`);

fs.writeFileSync(outputFile, `module.exports=${JSON.stringify(toReturn)}`, 'utf8');

const fixedSitemapUrls = [
	'https://specdb.info/',
	'https://specdb.info/#!/about',
];
const dynamicSitemapUrls = Object.keys(_.pickBy(toReturn, v => v.isPart)).map(c => `https://specdb.info/#!/${c}`);
const allSitemapUrls = fixedSitemapUrls.concat(dynamicSitemapUrls);
const sitemapBody = allSitemapUrls.map(url => `
  <url>
    <loc>${url}</loc>
    <changefreq>monthly</changefreq>
  </url>
`).join('');
const sitemapFull = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapBody}</urlset>
`;

fs.writeFileSync(sitemapFile, sitemapFull, 'utf8');

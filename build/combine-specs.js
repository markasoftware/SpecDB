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
 *  - 
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
	const items = _.chain(yamls)
		.filter(c => !_.isNil(c.name))
		.flatMap(yaml =>
			_.castArray(yaml.name).map(name => 
				({ ...yaml, name: combineUtil.toMatcher(name) })
			)
		 )
		.value();
	return items;
});

const flatPrioritizedItems = _.flatMap(doubleArr, (items, i) =>
	items.map(item => ({ priority: i, item }))
);
debug(`Total items (flat discrete) properties: ${flatPrioritizedItems.length}`);

const keyedAllDiscrete = combineUtil.applyMatchers(flatPrioritizedItems);
debug(`Total item count (combined): ${Object.keys(keyedAllDiscrete).length}`);

const toReturn = _
	.chain(keyedAllDiscrete)
	// this essentially un-discretes everything
	.mapValues((v, k) => combineUtil.getDiscreteItem(keyedAllDiscrete, k))
	// remove hidden and malformatted parts
	.pickBy(combineUtil.filterKeyedCombined)
	.value();
debug(`Final item count: ${Object.keys(toReturn).length}`);

fs.writeFileSync(outputFile, `module.exports=${JSON.stringify(toReturn)}`, 'utf8');

const fixedSitemapUrls = [
	'https://specdb.info/#!/',
	'https://specdb.info/#!/about',
];
const dynamicSitemapUrls = Object.keys(toReturn).map(c => `https://specdb.info/#!/${c}`);
const allSitemapUrls = fixedSitemapUrls.concat(dynamicSitemapUrls);
fs.writeFileSync(sitemapFile, allSitemapUrls.join('\n'), 'utf8');

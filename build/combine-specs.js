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

const doubleArr = parsedPaths.map(path => {
	const yamls = util.readJSON(path);
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
	.mapValues((v, k) => combineUtil.getDiscreteItem(keyedAllDiscrete, k))
	.pickBy((v, k) => {
		if (v.hidden) {
			return false;
		}
		if (!combineUtil.typeRequiredProps[v.type]) {
			console.error(`WARNING: Unknown type ${v.type} for ${k}`);
			return false;
		}
		const missingProperties = combineUtil.typeRequiredProps[v.type].filter(c => _.isNil(v.data[c]));
		if (missingProperties.length > 0) {
			console.error(`WARNING: Part ${k} is missing required props: ${missingProperties}`);
			return false;
		}
		return true;
	})
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

/* BEGIN OLD SHIT

// { name: { obj } }
const toOutput = {};
// [ { matcher: function, data: { data } } ]
const needsMatch = [];
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
// TODO: move this somewhere else
const typeRequiredProps = {
	'Generic Container': [],
	'CPU Architecture': [
		'Lithography',
		'Release Date',
		'Sockets',
	],
	'Graphics Architecture': [
		'Lithography',
		'Release Date',
	],
	'APU Architecture': [
		'Lithography',
		'Release Date',
	],
	CPU: [
		'Core Count',
		'Thread Count',
		'Base Frequency',
		'TDP',
	],
	'Graphics Card': [
		'VRAM Capacity',
		'Shader Processor Count',
		'GPU Base Frequency',
	],
	'APU': [
		'Core Count',
		'Thread Count',
		'Base Frequency',
		'Shader Processor Count',
	],
};
toOutput = _.pickBy(toOutput, (v, k) => {
	if (v.hidden) {
		return false;
	}
	if (!typeRequiredProps[v.type]) {
		console.error(`WARNING: Unknown type ${v.type} for ${k}`);
		return false;
	}
	const missingProperties = typeRequiredProps[v.type].filter(c => _.isNil(v.data[c]));
	if (missingProperties.length > 0) {
		console.error(`WARNING: Part ${k} is missing required props: ${missingProperties}`);
		return false;
	}
	return true;
});


*/

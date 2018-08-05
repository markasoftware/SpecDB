const _ = require('lodash');
const isGlob = require('is-glob');
const micromatch = require('micromatch');
const MixedTupleMap = require('mixedtuplemap');
const memoize = require('memoize-immutable');
const debug = require('debug')('specdb.combine-specs');
const util = require('./util');

const gdiCache = new MixedTupleMap();

const combineUtil = {
	// TODO: move elsewhere
	typeRequiredProps: {
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
	},
	// @param name = 'name'
	// @return ((name, item) => bool) || 'name'
	// throws an error if not string nor matchable
	toMatcher: name =>
		typeof name === 'string' ?
			isGlob(name, { strict: false }) ?
				micromatch.matcher(name)
			: name
		// ! string
		: _.isRegExp(name) ?
			c => name.test(c)
		// ! string && ! regex
		: _.isFunction(name) ?
			name
		: new Error(`bad type generating matcher: ${name}`),
	// @param prioritizedItems = [ { priority: 5, item: { item } } ]
	// @return { 'i5-8500': [ { priority: 5, item: { item } } ] }
	groupByAndDelete: (objs, prop) => _
		.chain(objs)
		.groupBy(c => _.get(c, prop))
		.mapValues(c => c.map(b => _.omit(b, prop)))
		.value(),
	// note: Although the function is memoized, it relies upon items
	// referencing the same object -- if it's a clone, the memoization
	// will fail.
	// @param items = the data itself
	// @param key = the key to process inheritance for
	// @param includeHidden: Whether to include hidden objects in the final thing, defaults to no.
	// @return: an item
	getDiscreteItem: memoize((items, key, includeHidden) => {
		const preInheritance = _.mergeWith({},
			// sort ascending priority
			...items[key]
			.filter(c => !includeHidden === !c.item.hidden)
			.sort((a, b) => b.priority - a.priority)
			// get rid of item wrapper, take out priority
			.map(c => c.item),
			util.merger);
		const inherits = preInheritance.inherits || [];
		const inheritsData = inherits.map(c =>
			items[c] && _.pick(combineUtil.getDiscreteItem(items, c, true), 'data')
		// get rid of items for which there was no inheritance data
		).filter(_.identity);
		const postInheritance = _.mergeWith({},
			...inheritsData,
			_.omit(preInheritance, 'inherits'),
			util.merger
		);
		return postInheritance;
	}, { cache: gdiCache }),
	// @param flatDiscrete = flat, prioritized array of items, both matchers and names
	// @return: keyed discrete, but with matchers fully applied
	applyMatchers: flatDiscrete => {
		const [ flatMatching, flatExplicit ] = _.partition(flatDiscrete, item => _.isFunction(item.item.name));
		debug('Flat discrete:');
		debug(`${flatExplicit.length} explicit items`);
		debug(`${flatMatching.length} matching items`);
		const keyedExplicitDiscrete = combineUtil.groupByAndDelete(flatExplicit, 'item.name');
		const explicitNames = Object.keys(keyedExplicitDiscrete);
		const keyedMatchingDiscrete = combineUtil.groupByAndDelete(
			// TODO: refactor this
			// for example, we won't just use item.name in the raw and stuff -- instead we can assign a variable which says
			// matchingFunction, one for rawMatchingData (without item.name), etc. Right now it's a mess of dealing with the
			// on-disk format, and what a matcher really means. We need to clear that up.
			_.flatMap(flatMatching, c =>
				explicitNames
				.filter(name =>
					c.item.name(name, combineUtil.getDiscreteItem(keyedExplicitDiscrete, name))
				)
				.map(name => ({ ..._.omit(c, 'item.name'), explicitName: name }))
			),
			'explicitName',
		);
		debug(`Matcher-generated items (explicitized): ${Object.keys(keyedMatchingDiscrete).length}`);

		const keyedAllDiscrete = _.mergeWith({}, keyedMatchingDiscrete, keyedExplicitDiscrete, util.merger);
		return keyedAllDiscrete;
	},

	filterKeyedCombined: (v, k) => {
		// if there's no v.type, we assume it is empty, and prune it.
		// TODO: probably remove, this should go in some sort of "flattenDiscreteKeyedItems" function
		if (!v.type) {
			return false;
		}
		if (!combineUtil.typeRequiredProps[v.type]) {
			console.error(`WARNING: Unknown type ${v.type} for ${k}`);
			console.error(v);
			return false;
		}
		const missingProperties = combineUtil.typeRequiredProps[v.type].filter(c => _.isNil(v.data[c]));
		if (missingProperties.length > 0) {
			console.error(`WARNING: Part ${k} is missing required props: ${missingProperties}`);
			return false;
		}
		return true;
	},
};
module.exports = combineUtil;

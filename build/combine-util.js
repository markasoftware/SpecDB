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
	// TODO: possibly improve by allowing deep onMe using _.get and _.set
	// @param data = an array of objects, which should all have the next param as a prop
	// @param onMe = the property string to duplicate on
	// @return = the transformed original object. Won't mutate original object. See tests/combine.js
	duplicateOn: (data, onMe) =>
		_.flatMap(data, datum => {
			if (_.isNil(datum[onMe])) {
				// hehe, i guess we can do this with flatMap
				return [];
			}
			const allValues = _.castArray(datum[onMe]);
			// don't know how to do this functionally
			return allValues.map(oneValue => {
				const clonedDatum = _.clone(datum);
				clonedDatum[onMe] = oneValue;
				return clonedDatum;
			});
		}),
	// maybe move this elsewhere, because it's not used in the actual combination process (just deserializers)?
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
	/**
	 * converts a third-party name for a part into a matcher which will match the SpecDB name for said part.
	 * @param hints has fields:
	 *   - name (required) some sort of name. Eg: 'AMD R7 1700X' or 'R7 1800'
	 *   - brand (optional): 'AMD', 'amd', 'Intel', 'NVIDIA'
	 *   - type (optional): 'cpu', 'Gpu'
	 * @return a valid SpecDB matcher to go straight into the `name` field of an item. No toMatcher is needed after this. False if hints are too fucked up
	 */
	thirdPartyNameToMatcher: hintsArg => {
		const matchFields = ['brand', 'type', 'source'];

		// also clones it, which we want
		const hints = _.mapValues(hintsArg, v => typeof v === 'string' ? v.trim() : v);

		if (typeof hints.name !== 'string') {
			console.error('Hint name was not a string');
			return false;
		}
		// hyphenate the name and remove common filler words
		hints.cleanName = hints.name
			.replace(/[ _]/g, '-');
		['processor', 'radeon'].forEach(w => {
			hints.cleanName = hints.cleanName.replace(new RegExp(`-*${w}-*`, 'i'), '');
		});

		['amd', 'intel', 'nvidia'].forEach(b => {
			const brandRegex = new RegExp(`^${b}-*`, 'i');
			if (brandRegex.test(hints.name)) {
				hints.cleanName = hints.cleanName.replace(brandRegex, '');
				if (typeof hints.brand !== 'string') {
					hints.brand = b;
				}
			}
		});
		if (typeof hints.brand === 'string') {
			hints.brand = hints.brand.toLowerCase();
		}

		if (typeof hints.type === 'string') {
			hints.type = hints.type.toLowerCase();
		}

		const series = [
			// RX
			{
				nameTest: /^R[579X]-\d\d\d/,
				brand: 'amd',
				type: 'gpu',
				parser: () => {
					// TODO: how do we give data with GB specified higher priority than data w/o?
					const regexMatch = hints.cleanName.match(/(R[579X]-\d\d\dX?)(-(\d+)GB)?/);
					if (regexMatch) {
						const [ , rxXxx, , memorySize ] = regexMatch;
						return combineUtil.toMatcher(
							memorySize ?
								`${rxXxx}-${memorySize}GiB` :
								new RegExp(`^${rxXxx}(-\\d+GiB)?$`)
						);
					}
				},
			},
			// HD
			{
				nameTest: /HD-.*\d{4}(-|$)/,
				brand: 'amd',
				type: 'gpu',
				parser: () => {
					// a name can be just HD-1111, in which case we match against all variants EXCEPT -X2 because that means a two-die thing
					// TODO: wrap function around .match which throws an easily catchable MatcherGeneratorError or something
					const [, num, isX2] = hints.cleanName.match(/-(\d{4})(.*X2)?/);
					return isX2 ?
						`HD-${num}-X2` :
						combineUtil.toMatcher(new RegExp(`^HD-${num}(-[^X].*)*$`));
				},
			},
			// FX
			{
				nameTest: /^FX-\d+$/,
				brand: 'amd',
				type: 'cpu',
				parser: () => hints.cleanName,
			},
			// Ryzen
			{
				nameTest: /^Ryzen(?!-TR)/,
				brand: 'amd',
				type: 'cpu',
				parser: () => {
					return hints.cleanName.replace('Ryzen-', 'R');
				},
			},
			// Threadripper
			{
				nameTest: /^Ryzen-TR/,
				brand: 'amd',
				type: 'cpu',
				parser: () => {
					return hints.cleanName.replace('Ryzen-TR-', '');
				}
			},
			// simple Intel
			{
				nameTest: /^(Pentium|Core|Xeon|Celeron|Atom)/,
				brand: 'intel',
				type: 'cpu',
				parser: () => {
					return hints.cleanName;
				},
			},
			// Phenom/Athlon, no T on end
			{
				nameTest: /^(Phenom|Athlon)-(I+-)?X\d-[A-Z]*\d+$/,
				brand: 'amd',
				type: 'cpu',
				parser: () => {
					// extract the X*-*** portion
					const regexMatch = hints.cleanName.match(/(X\d-[A-Z0-9]+)$/);
					if (regexMatch) {
						return combineUtil.toMatcher(
							new RegExp(`^${regexMatch[1]}(BE)?$`)
						);
					}
				}
			},
			// Phenom/Athlon, T on end
			{
				nameTest: /^(Phenom|Athlon)-(I+-)?X\d-[A-Z]*\d+T$/,
				brand: 'amd',
				type: 'cpu',
				parser: () => {
					const model = hints.name.match(/[A-Z0-9]+$/)[0];
					return combineUtil.toMatcher(new RegExp(`^${model}(BE)?$`));
				},
			},
			// userbenchmark untagged Intel
			{
				nameTest: /^[A-Z]\d+$/,
				brand: 'intel',
				type: 'cpu',
				// WARN: if the source field is missing this could still match, even though we
				// want it to strictly match only userbenchmark. In practice, this is unlikely to
				// be an issue because we always have source filled out. A `strictHints` flag could do.
				source: 'userbenchmark',
				parser: () => `Core-${hints.name}`,
			},
		];

		const compatibleSeries = series.filter(serie =>
				serie.nameTest.test(serie.rawNameTest ? hints.name : hints.cleanName) &&
				matchFields.every(field =>
					typeof hints[field] !== typeof serie[field] || hints[field] === serie[field]
				)
			);

		switch (compatibleSeries.length) {
			case 0:
				return false;
			case 1:
				return compatibleSeries[0].parser();
			default:
				console.error(`Multiple series matched third party ${hints.name}: ${compatibleSeries.map(c => c.nameTest)}`);
				return false;
		}
	},
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
		const [ flatMatching, flatExplicit ] = _.partition(flatDiscrete, item => item.item.matcher);
		debug('Flat discrete:');
		debug(`${flatExplicit.length} explicit items`);
		debug(`${flatMatching.length} matching items`);
		const explicitKeyedDiscrete = combineUtil.groupByAndDelete(flatExplicit, 'item.name');
		const explicitKeyedCombined = combineUtil.undiscrete(explicitKeyedDiscrete);
		const explicitNames = Object.keys(explicitKeyedCombined);
		// for each matcher item, convert into an array of explicit-ish items
		const flatMatched = _.flatMap(flatMatching, matcherItemWithPriority => {
			const matcherItem = matcherItemWithPriority.item;
			const matcherName = matcherItem.name;
			let matchedNames;
			if (typeof matcherName === 'string') {
				matchedNames = explicitNames.includes(matcherName) ? [matcherName] : [];
			} else {
				const matcherFunc = matcherName;
				// filter is still pretty fast
				matchedNames = explicitNames.filter(explicitName => {
					const explicitValue = explicitKeyedCombined[explicitName];
					return matcherFunc(explicitName, explicitValue);
				});
			}
			// same as matcherItem, but each item has the name of a matched explicitName
			const itemsWithPriorities = matchedNames.map(name => (
				{
					priority: matcherItemWithPriority.priority,
					item: {
						..._.omit(matcherItem, 'matcher'),
						name,
					},
				}
			));
			return itemsWithPriorities;
		});
		debug(`Matcher-generated items (explicitized): ${Object.keys(flatMatched).length}`);
		const matchedKeyedDiscrete = combineUtil.groupByAndDelete(flatMatched, 'item.name');

		const allKeyedDiscrete = _.mergeWith({}, matchedKeyedDiscrete, explicitKeyedDiscrete, util.merger);
		return allKeyedDiscrete;
	},

	// @param v = part data
	// @param k = part name (machine readable)
	// @return = true/false whether this part should be in spec-data.js
	filterKeyedCombined: (v, k) => {
		// if there's no v.type, it might be hidden or something
		// TODO: this mainly happens for hidden items, but if there is, eg, a matcher without hidden, we might
		// want to warn about it -- but we can't because we don't know if it's hidden! Maybe I'm overthinking things...
		if (!v.type && !v.hidden) {
			return false;
		}
		if (!combineUtil.typeRequiredProps[v.type]) {
			console.error(`WARNING: Unknown type ${v.type} for ${k}`);
			console.error(v);
			return false;
		}
		const missingProperties = combineUtil.typeRequiredProps[v.type].filter(c => _.isNil(v.data[c]));
		if (missingProperties.length > 0) {
			debug(`WARNING: Part ${k} is missing required props: ${missingProperties}`);
			return false;
		}
		return true;
	},

	// @param keyedDiscrete
	// @return = keyedCombined
	undiscrete: keyedDiscrete =>
		_.mapValues(keyedDiscrete, (v, k) => combineUtil.getDiscreteItem(keyedDiscrete, k))
};
module.exports = combineUtil;

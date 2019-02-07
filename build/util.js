const fs = require('fs');
const _ = require('lodash');
const naturalCompare = require('natural-compare');
const units = require('../src/js/units');


const util = {
	merger: (a, b, key, object) => {
		// the undefined checks make things work ok when merging, say, a large object with an empty one
		// _.merge({}, { thing: [ 1, 2, 3 ]})
		if ((a instanceof Array || b instanceof Array) && typeof a !== 'undefined' && typeof b !== 'undefined') {
			return _.castArray(b).concat(_.castArray(a));
		}
	},
	readJSON: c => require(`${process.cwd()}/${c}`),
	writeJSON: (p, d) => fs.writeFileSync(p, JSON.stringify(d), 'utf8'),
	// ahhh, mmmm, splendid
	// after so many years and so many innovations and iterations, the easiest way
	// to remove a regex match from a string is still just to use a substitution
	// function. People were doing this in the 70s with `sed`.
	isoDate: n => (new Date(parseInt(n.toString().replace(/\D/g, '')))).toISOString().split('T')[0],
	unitTransformer: unit => num => units.toString(units.reduce({ num, unit })),
	substTransformer: substs => d => _.findLast(substs, (v, k) => d.includes(k)),
	urlify: c => c
		.replace(/\s/g, '-')
		.replace(/[^a-zA-Z0-9-]/g, ''),
	keyByName: arr => _
		.chain(arr)
		.keyBy(c => c.name)
		.mapValues(c => _.omitBy(c, (v, k) => k === 'name'))
		.value(),

	unkeyByName: obj => Object.values(
		_.mapValues(obj, (v, k) => ({ ...v, name: k }))
	),

	genDeepTree: (data, [grouper, ...groupers]) =>
		grouper ? _
			.chain(data)
			.toPairs()
			.groupBy(c => grouper(c[1]))
			.mapValues(c => util.genDeepTree(_.fromPairs(c), groupers))
			.value()
		: data,

	genSections: (data, pages) => {
		const safeAssign = (a, b) => {
			const intsec = _.intersection(_.keys(a), _.keys(b));
			if (intsec.length > 0) {
				throw new Error(`ERROR: Will not overwrite specs in genSections: ${intsec}`);
			}
			return Object.assign(a, b);
		}

		// when tuples plz
		// return: [ [ directChildren ], { mergeWithSpecs } ]
		const genPage = (data, [page, ...pages]) => {
			if (!page) {
				return [ Object.keys(data), {} ];
			}

			const deepTree = util.genDeepTree(data, [ page.toName ]);
			const subsectionData = {};

			const ownSubsectionData = util.keyByName(Object.keys(deepTree).map(name => {
				const [ allMembers, childData ] = genPage(deepTree[name], pages);
				const allMembersObj = _.pickBy({ ...childData, ...data}, (v, k) => allMembers.includes(k));

				const deepMembersObj = util.genDeepTree(allMembersObj, [ page.toHeader ]);
				const membersArr = _
					.chain(deepMembersObj)
					.toPairs()
					.map(([ header, members ]) => ({
						header,
						members: Object.keys(members).sort((a, b) =>
							page.memberSorter ?
								page.memberSorter(members[a], members[b])
								: _.flip(naturalCompare)(a, b),
						),
					}))
					.value()
					.sort((a, b) =>
						page.headerSorter ?
							page.headerSorter(a.header, b.header)
							: _.flip(naturalCompare)(a.header, b.header));
				safeAssign(subsectionData, childData);
				return {
					name: util.urlify(name),
					humanName: name,
					sections: membersArr,
					...page.base(Object.values(deepTree[name])),
				};
			}));
			safeAssign(subsectionData, ownSubsectionData);
			return [ Object.keys(ownSubsectionData), subsectionData ];
		};
		return util.unkeyByName(genPage(data, pages)[1]);
	},

	bucket: (modulo, opts = {}) => n => {
		const
			separator = opts.separator || ' - ',
			min = opts.min || -Infinity,
			max = opts.max || Infinity,
			ranges = opts.ranges || [],
			offset = opts.offset || 0;

		// just WOW
		const mod = (a, b) =>
			(a % b + b) % b;

		const getContainingRange = (n, ranges) =>
			ranges.find(r => n >= r[0] && n <= r[1]);

		// returns the smallest "intersection" of all ranges
		const collapseRanges = ([a, b, ...ranges]) =>
			b ?
				collapseRanges([
					[
						Math.max(a[0], b[0]),
						Math.min(a[1], b[1]),
					],
				...ranges])
			: a;

		// step 1: make the ranges passed in "tesselate"
		// i.e, [2, 5] -> [-Infinity, 1], [2, 5], [6, Infinity]
		const sortedRanges = [
			[ -Infinity, -Infinity ],
			...ranges.sort((a, b) => a[0] - b[0]),
			[ Infinity, Infinity ],
		];
		// it does not matter than there is no pair where the first
		// range is added, because the first range is -Infinity
		// and cannot occur
		const rangesWithPrevious = _.zip(
			sortedRanges.slice(0, -1),
			sortedRanges.slice(1),
		);
		const tesselatingRanges = _.flatMap(rangesWithPrevious, c => {
			const previousRange = c[0];
			const nextRange = c[1];
			return [
				// true as third part of array indicates
				// that it can be broken up later by modulo
				[ previousRange[1] + 1, nextRange[0] - 1, true ],
				nextRange,
			// if ranges already tesselate, don't include our thing
			].filter(c => c[0] <= c[1]);
		});

		const tesselatingRange = getContainingRange(n, tesselatingRanges);
		const unclampedRange = tesselatingRange[2] ?
			collapseRanges([
				tesselatingRange,
				[ n - mod(n - offset, modulo), n + (modulo - 1 - mod(n - offset, modulo)) ],
			])
			// don't need to get rid of [2] manually, collapse does
			: tesselatingRange;
		const closestRange = collapseRanges([
			unclampedRange,
			[ min, max ],
		]);

		const finalRange = [
			closestRange[0] === min && opts.minText || closestRange[0],
			closestRange[1] === max && opts.maxText || closestRange[1],
		];

		return finalRange[0] === finalRange[1] ?
			finalRange[0].toString() : finalRange.join(separator);
	},
	// creates a matching regex
	ezMatch: foreign =>
		new RegEx(_.words(foreign.toLowercase()).map(c => `(?=.*${c})`).join(''), 'i'),

	yamlVerify: yamlObject => {
		class YamlVerifyError extends Error {
			constructor(msg) {
				super(msg);
				this.msgStack = [msg];
			}

			push(msg) {
				this.msgStack.push(msg);
			}

			toString() {
				return this.msgStack.join('\n\t');
			}
		};

		// shitty parser combinator time!
		/**
		 * @param a parser
		 * @param b parser
		 * @return parser which succeeds if either a or b does
		 */
		const or = (...a) => p => {
			if (a.length === 0) {
				return;
			}
			try {
				a[0](p);
			} catch (e) {
				or(a.slice(1), p);
			}
		};

		const and = (...a) => p => {
			// l o w e f f o r t
			a.forEach(c => c(p));
		};

		/**
		 * Run t if c returns true, else run e
		 * @param c takes p as argument, returns boolean
		 * @param t run if c returns true
		 * @param e run if c returns false (has default)
		 */
		const ifElse = (c, t, e = _.noop) => p => {
			if (c(p)) {
				t(p);
			} else {
				e(p);
			}
		};

		/**
		 * @param path where in the parsed object to run the inner parser
		 * @param a inner parser
		 * @return runs the inner parser on a certain path of parsed object
		 */
		const atPath = (path, a) => p => {
			try {
				a(_.get(p, path));
			} catch (e) {
				e.push(`in path "${path}"`);
				throw e;
			}
		};

		const parseArray = p => {
			if (!(p instanceof Array)) {
				// make this error message more different than parseType? But then the tests get messier
				throw new YamlVerifyError(`Incorrect type. Found "${typeof p}", expected "Array". (object was not instance of array)`);
			}
		};

		const forEach = a => p => {
			parseArray(p);
			try {
				p.forEach(_.unary(a));
			} catch (e) {
				e.push('while iterating');
				throw e;
			}
		};

		/**
		 * @param expected the expected type of the entire parsed object
		 * @return parser
		 */
		const parseType = expected => p => {
			if (typeof p !== expected) {
				throw new YamlVerifyError(`Incorrect type. Found "${typeof p}", expected "${expected}".`);
			}
		};

		const parseStringy = or(parseType('string'), parseType('number'));

		const parseSections = forEach(and(
			atPath('header', parseStringy),
			atPath('members',
						 forEach(parseStringy)
						),
		));

		// @param p the whole yaml
		// @return boolean
		const isPart = p => {
			atPath('isPart', parseType('boolean'))(p);
			return p.isPart;
		};

		// @param p the whole yaml
		const parseRequiredSubtextData = p => {
			const typeRequiredProps = {
				'Generic Container': [],
				'CPU Architecture': [
					atPath('data.Lithography', parseStringy),
					// maybe should be some date parser? Maybe could hook into dates.js?
					atPath('data.Release Date', parseStringy),
					atPath('data.Sockets', or(forEach(parseStringy)), parseStringy),
				],
				'Graphics Architecture': [
					atPath('data.Lithography', parseStringy),
					atPath('data.Release Date', parseStringy),
				],
				'APU Architecture': [
					atPath('data.Lithography', parseStringy),
					atPath('data.Release Date', parseStringy),
				],
				CPU: [
					atPath('data.Core Count', parseType('number')),
					atPath('data.Thread Count', parseType('number')),
					atPath('data.Base Frequency', parseStringy),
					atPath('data.TDP', parseStringy),
				],
				'Graphics Card': [
					atPath('data.VRAM Capacity', parseStringy),
					atPath('data.Shader Processor Count', parseType('number')),
					atPath('data.GPU Base Frequency', parseStringy),
				],
				'APU': [
					atPath('data.Core Count', parseType('number')),
					atPath('data.Thread Count', parseType('number')),
					atPath('data.Base Frequency', parseStringy),
					atPath('data.Shader Processor Count', parseStringy),
				],
			};

			atPath('type', parseType('string'))(p);
			const type = p.type;
			typeRequiredProps[type].forEach(c => c(p));
		};

		return and(
			atPath('name', parseStringy),
			atPath('humanName', parseStringy),
			parseRequiredSubtextData,
			ifElse(isPart,
						 // parts only need subtext data, so we're done! Free as the wind!
						 _.noop,
						 and(
							 atPath('topHeader', parseStringy),
							 atPath('sections', parseSections),
						 )
						),
		)(yamlObject);
	}
};
module.exports = util;

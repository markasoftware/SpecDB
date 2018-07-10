const fs = require('fs');
const _ = require('lodash');
const naturalCompare = require('natural-compare');
const units = require('../src/js/units');


const util = {
	merger: (a, b) => {
		if (_.isArray(a)) {
			return a.concat(b);
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
	urlify: c => c.replace(/\s/g, '-').replace(/[^a-zA-Z0-9-]/g, ''),
	keyByName: arr => _
		.chain(arr)
		.keyBy(c => c.name)
		.mapValues(c => {
			delete c.name;
			return c;
		})
		.value(),

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
						members: Object.keys(members).sort(
							page.memberSort || _.flip(naturalCompare)
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
				}
			}));
			safeAssign(subsectionData, ownSubsectionData);
			return [ Object.keys(ownSubsectionData), subsectionData ];
		};
		return genPage(data, pages)[1];
	},
};
module.exports = util;

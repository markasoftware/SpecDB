const fs = require('fs');
const _ = require('lodash');
const units = require('../src/js/units');

module.exports = {
	merger: (a, b) => {
		if (_.isArray(a)) {
			return a.concat(b);
		}
	},
	readJSON: c => require(`${process.cwd()}/${c}`),
	writeJSON: (p, d) => fs.writeFileSync(p, JSON.stringify(d), 'utf8'),
	// ahhh, mmmm, splendid
	isoDate: n => (new Date(parseInt(n.toString().replace(/\D/g, '')))).toISOString().split('T')[0],
	unitTransformer: unit => num => units.toString(units.reduce({ num, unit })),
	substTransformer: substs => d => _.findLast(substs, (v, k) => d.includes(k)),
	urlify: c => c.replace(/\s/g, '-').replace(/[^a-zA-Z0-9-]/g, ''),
};

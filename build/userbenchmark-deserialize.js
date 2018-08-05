const _ = require('lodash');

module.exports = serialized =>
	serialized.map(c => {
		const modelWords = c.userbenchmarkModel.split(/[ _-]/g);
		const hyphenated = c.userbenchmarkModel.replace(/[ _-]/g, '-');
		return {
			name: (name, value) => {
				if (c.userbenchmarkBrand === 'Intel') {
					return name === hyphenated;
				}
				// otherwise, it must be AMD
				if (hyphenated.slice(0, 5) === 'Ryzen') {
					// threadripper
					if (hyphenated.slice(6, 2) === 'TR') {
						return name === hyphenated.slice(9);
					}
					// not threadripper
					return name === 'R' + hyphenated.slice(6);
				}
			},
			..._.omit(c, ['userbenchmarkBrand', 'userbenchmarkModel']),
		};
	});

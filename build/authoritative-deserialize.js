// TODO: GET RID OF THIS FUCKING FILE
// maybe...
// do we do the name duplication before this? That's a weird precedent though, it's no longer
// a deserializer. Then it breaks a lot of things that generate the `name` in the first place
// from multiple non-standard properties. Maybe a helper function from combine-util called
// "mapNames"? Or maybe we do duplication in here?
const _ = require('lodash');
const combineUtil = require('./combine-util');

module.exports = serialized =>
	serialized.map(item => {
		const names = _.castArray(item.name).map(combineUtil.toMatcher);
		return { ...item, name: names };
	});

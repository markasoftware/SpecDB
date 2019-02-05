'use strict';

const _ = require('lodash');
const combineUtil = require('./combine-util');

module.exports = serialized =>
	// TODO: it would be really easy to automatically convert matcherInfo -> matcher in the main combine script
	serialized.map(item => {
		const strippedItem = _.omit(item, 'matcherInfo');
		const matcher = combineUtil.thirdPartyNameToMatcher(item.matcherInfo);
		if (matcher === false) {
			return;
		}
		return {
			...strippedItem,
			matcher: true,
			name: matcher,
		};
	}).filter(_.identity);

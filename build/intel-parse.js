const fs = require('fs');
const _ = require('lodash');
const util = require('./util');
const intelConfig = require('./intel-config');

/*
 * Processing Intel data:
 * 1. Read all data from disk
 * 2. Combine deferred data into a single object
 * 3. Filter data to only processors we want to scrape
 * 4. Translate data into SpecDB format as per intelConfig.keyMap
 * 
 * Step 4 also includes adding inheritance information.
 */

const [ intelProcs, intelCodeNames, intelParse ] = process.argv.slice(2);
let [ procs, codeNames ] = [ intelProcs, intelCodeNames ].map(util.readJSON);

// BEGIN step 2
const processDeferred = (name, defData, mainData) => {
	const info = intelConfig.deferred[name];
	const keyedInfo = _.keyBy(defData, c => c[info.idProp]);
	return mainData.map(c => {
		c[name] = keyedInfo[c[info.procProp]][info.valueProp];
		return c;
	});
};
procs = processDeferred('codeName', codeNames.d, procs.d);
// END step 2

// step 3
// BEGIN step 4
const partList = procs.filter(c => c.ProductFamilyId in intelConfig.families).map(c => {
	const toReturn = { isPart: true, inherits: [ 'Intel' ] };
	// iterate through the keys according to Intel's website
	for (let intelKey of _.intersection(Object.keys(c), Object.keys(intelConfig.keyMap))) {
		const intelValue = _.isString(c[intelKey]) ? c[intelKey].trim() : c[intelKey];
		if (_.isNil(intelValue) || intelValue === '') {
			continue;
		}
		const sdbOutputs = _.castArray(intelConfig.keyMap[intelKey]);
		// loop through all SDB keys this key refers to
		for (let sdbOutput of sdbOutputs) {
			const toMerge = {};
			if (_.isString(sdbOutput)) {
				_.set(toMerge, sdbOutput, intelValue);
			} else {
				// it's an object
				const transformerOutput = sdbOutput.transformer(intelValue, toReturn);
				if (
					_.isFunction(transformerOutput) ||
					_.isPlainObject(transformerOutput)
				) {
					console.error(`Key ${intelKey} for output key ${sdbOutput.name} incorrect type!`);
					console.error(transformerOutput);
					process.exit(1);
				}
				_.set(toMerge, sdbOutput.name, sdbOutput.transformer(intelValue, toReturn));
			}
			// merging bullshit allows arrays to work nicely, so adding to
			// the list of supported x86 extensions or the inherits list still works.
			// also, just to make .data work at all.
			_.mergeWith(toReturn, toMerge, util.merger);
		}
	}
	return toReturn;
});
// END step 4
const toOutput = util.keyByName(partList);

// do the sectioning thing
Object.assign(toOutput, util.genSections(toOutput, intelConfig.sectionPages));

util.writeJSON(intelParse, toOutput);

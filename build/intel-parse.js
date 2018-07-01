const fs = require('fs');
const _ = require('lodash');
const intelConfig = require('./intel-config');

const [ intelScrape, intelParse ] = process.argv.slice(2);
const scraped = JSON.parse(fs.readFileSync(intelScrape, 'utf8'));

const familyList = Object.keys(intelConfig.families).map(c => parseInt(c));
const partList = scraped.d.filter(c => familyList.includes(c.ProductFamilyId)).map(c => {
	const toReturn = {};
	// iterate through the keys according to Intel's website
	for (let intelKey of _.intersection(Object.keys(c), Object.keys(intelConfig.keyMap))) {
		const intelValue = typeof c[intelKey] === 'string' ? c[intelKey].trim() : c[intelKey];
		const keyMapValue = intelConfig.keyMap[intelKey];
		const sdbOutputs = _.isArray(keyMapValue) ? keyMapValue : [keyMapValue];
		// loop through all SDB keys this key refers to
		for (let sdbOutput of sdbOutputs) {
			if (typeof sdbOutput === 'string') {
				toReturn[sdbOutput] = intelValue
			} else {
				// it's an object
				toReturn[sdbOutput.name] = sdbOutput.transformer(intelValue, toReturn);
			}
		}
	}
	return toReturn;
});
// convert list to name-keyed object
const toOutput = {};
for (let part of partList) {
	const partName = part.name;
	delete part.name;
	toOutput[partName] = part;
}

fs.writeFileSync(intelParse, JSON.stringify(toOutput), 'utf8');

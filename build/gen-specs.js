const fs = require('fs');
const find = require('find');
const jsYaml = require('js-yaml');
const _ = require('lodash');

const parseYaml = filePath => {
	let toReturn;
	try {
		toReturn = jsYaml.safeLoadAll(fs.readFileSync(filePath));
	} catch (e) {
		console.error(`FATAL: yaml parsing failed for ${filePath}. Aborting. Error: ${e}`);
		process.exit(1);
	}
	return toReturn;
}

const multiNames = yaml =>
	_.castArray(yaml.name).map(c => _.chain(yaml).clone().set('name', c).value());

const [basePath, specOutPath] = process.argv.slice(2);
const yamls = find.fileSync(/\.yaml$/, basePath);
// who's ready for some FUNCTIONAL PROGRAMMING???
const toOutput = _
	.chain(yamls)
	.flatMap(parseYaml)
	.flatMap(multiNames)
	// TODO: instead of spoofing the names, either switch to:
	// a) separate names for inheritors than actual categories -- probably best option
	// b) different `data` and `abstractData` properties to allow things to coexist
	// c) change subtext generation system so we don't need separate data and abstractData
	// basically, since "hidden" yamls have the same names as non-hidden ones, we need to
	// give them different names here, then we prefer them in combine-specs.js
	.keyBy(c => c.hidden ? `HIDDEN-${c.name}` : c.name)
	.mapValues(v => { delete v.name; return v })
	.value();
fs.writeFileSync(specOutPath, JSON.stringify(toOutput));

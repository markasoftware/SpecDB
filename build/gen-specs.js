const fs = require('fs');
const find = require('find');
const jsYaml = require('js-yaml');
const _ = require('lodash');

const parseYaml = filePath => {
	let toReturn;
	try {
		toReturn = jsYaml.loadAll(fs.readFileSync(filePath));
	} catch (e) {
		console.error(`FATAL: yaml parsing failed for ${filePath}. Aborting. Error: ${e}`);
		process.exit(1);
	}
	return toReturn;
}

const [basePath, specOutPath] = process.argv.slice(2);
const yamls = find.fileSync(/\.yaml$/, basePath);
const toOutput = _.flatMap(yamls, parseYaml).map(c => ({ ...c, name: c.name.toString() }));
fs.writeFileSync(specOutPath, JSON.stringify(toOutput));

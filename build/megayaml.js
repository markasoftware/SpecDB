const fs = require('fs');
const jsYaml = require('js-yaml');

module.exports = {
	// str path -> obj
	parse: basePath => {
		const toReturn = {};
		
		const parseYaml = filePath => {
			let toReturn;
			try {
				toReturn = jsYaml.safeLoad(fs.readFileSync(filePath));
			} catch (e) {
				console.error(`FATAL: yaml parsing failed for ${filePath}. Aborting. Error: ${e}`);
				process.exit(1);
			}
			return toReturn;
		}

		const hidden = {};
		const traverseHidden = path => {
			fs.readdirSync(path).forEach(subPath => {
				// i really don't need a regex here but fuck it
				if(/\.yaml$/.test(subPath)) {
					const data = parseYaml(`${path}/${subPath}`);
					if(data.hidden) {
						hidden[data.name] = data;
					}
				// oh god why did I do this so inconsistently
				} else {
					traverseHidden(`${path}/${subPath}`);
				}
			});
		}

		traverseHidden(basePath);

		const getInheritance = data => {
			const toReturn = Object.assign({}, data.data);
			(data.inherits || []).forEach(curInherit => {
				// fml
				const savedToReturn = JSON.parse(JSON.stringify(toReturn));
				Object.assign(toReturn, getInheritance(hidden[curInherit]));
				Object.assign(toReturn, savedToReturn);
			});
			return toReturn;
		}

		const traverse = path => {
			fs.readdirSync(path).forEach(subPath => {
				const fullPath = `${path}/${subPath}`;
				if(fs.statSync(fullPath).isFile()) {
					const curData = parseYaml(fullPath);
					if(!curData.hidden) {
						// we do || {} because some categories have no data
						Object.assign(curData.data || {}, getInheritance(curData));
						const curName = curData.name;
						delete curData.name;
						delete curData.inherits;
						toReturn[curName] = curData;
					}
				} else {
					traverse(fullPath);
				}
			});
		}
		traverse(basePath);
		
		return toReturn;
	},
	// basePath, obj -> null
	dump: (basePath, baseData) => {
		
	},
};

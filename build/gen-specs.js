const parseYaml = require('js-yaml').safeLoad;
const fs = require('fs');

const basePath = process.argv[2];

const toReturn = {};

const hidden = {};
const traverseHidden = path => {
    fs.readdirSync(path).forEach(subPath => {
        // i really don't need a regex here but fuck it
        if(/\.yaml$/.test(subPath)) {
            const data = parseYaml(fs.readFileSync(`${path}/${subPath}`));
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
        Object.assign(toReturn, getInheritance(hidden[curInherit]));
    });
    return toReturn;
}

const traverse = path => {
    fs.readdirSync(path).forEach(subPath => {
        const fullPath = `${path}/${subPath}`;
        if(fs.statSync(fullPath).isFile()) {
            const curData = parseYaml(fs.readFileSync(fullPath));
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

process.stdout.write('module.exports = ' + JSON.stringify(toReturn) + ';');

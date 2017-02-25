const parseYaml = require('js-yaml').safeLoad;
const fs = require('fs');

const toReturn = {};
const traverse = path => {
    fs.readdirSync(path).forEach(subPath => {
        const fullPath = `${path}/${subPath}`;
        if(fs.statSync(fullPath).isFile()) {
            const curData = parseYaml(fs.readFileSync(fullPath));
            const curName = curData.name;
            delete curData.name;
            toReturn[curName] = curData;
        } else {
            traverse(fullPath);
        }
    });
}
traverse(process.argv[2]);

process.stdout.write('module.exports = ' + JSON.stringify(toReturn) + ';');
const parseYaml = require('js-yaml').safeLoad;
const fs = require('fs');

const toReturn = {};
const traverse = (path, forChildren) => {
    fs.readdirSync(path).forEach(subPath => {
        const fullPath = `${path}/${subPath}`;
        if(fs.statSync(fullPath).isFile()) {
            const curData = parseYaml(fs.readFileSync(fullPath));
            Object.assign(curData.data || {}, forChildren);
            const curName = curData.name;
            delete curData.name;
            toReturn[curName] = curData;
        } else {
            traverse(fullPath, Object.assign({}, forChildren, parseYaml(fs.readFileSync(`${fullPath}.yaml`)).forChildren || {}));
        }
    });
}
traverse(process.argv[2], {});

process.stdout.write('module.exports = ' + JSON.stringify(toReturn) + ';');
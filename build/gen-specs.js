var parseYaml = require('js-yaml').safeLoad;
var fs = require('fs');

const traverse = path =>
    Object.assign(parseYaml(fs.readFileSync(`${path}/category.yaml`)), {children: fs.readdirSync(path).filter(c => c !== 'category.yaml').map(curSubPath => {
        const correctedSubPath = `${path}/${curSubPath}`;
        return fs.statSync(correctedSubPath).isDirectory() ? traverse(correctedSubPath) : parseYaml(fs.readFileSync(correctedSubPath, {encoding: 'utf8'}))
    })});
process.stdout.write('const specData = ' + JSON.stringify(traverse(process.argv[2])) + ';\n');
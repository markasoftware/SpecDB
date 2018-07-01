const fs = require('fs');

const megaYaml = require('./megayaml');

const [basePath, specOutPath] = process.argv.slice(2);

const specs = megaYaml.parse(basePath);

fs.writeFileSync(specOutPath, JSON.stringify(specs));

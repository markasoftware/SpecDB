// this is just to be used by other higher level stuff like `create-gpu` or `create-cpu`

const fs = require('fs');
const dumpYaml = require('js-yaml').safeDump;
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

const prompty = (asky, cb) => {
    const recurse = (n, acc) => {
        if(n === asky.length) {
            cb(acc);
        }
        readline.question(`${asky[n]}:`, answer => {
            if(answer) {
                if(!isNaN(+answer)) {
                    answer = +answer;
                }
                acc[asky[n]] = answer;
            }
            recurse(n + 1, acc);
        });
    }
    recurse(0, {});
}

module.exports = (toReturn, askFor, askForData) => {
    readline.question('Inherits:', inherits => {
        toReturn.inherits = JSON.parse(inherits);
        prompty(askFor, askForResult => {
            Object.assign(toReturn, askForResult);
            prompty(askForData, askForDataResult => {
                Object.assign(toReturn.data, askForDataResult);
                readline.question('Write to:', writeTo => {
                    fs.writeFileSync(`${__dirname}/../specs/${writeTo}`, dumpYaml(toReturn));
                    process.exit();
                });
            });
        });
    });
}
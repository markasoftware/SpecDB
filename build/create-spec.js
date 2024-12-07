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
                // if it's a non-string data type, treat it like one
                try {
                    answer = JSON.parse(answer);
                } /* I hate doing shit like this */ catch (e) {}
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
            // check if they want to add anything manually
            readline.question('Custom data props:', customDataResult => {
                if(customDataResult) {
                    askForData.push(...JSON.parse(customDataResult));
                }
                prompty(askForData, askForDataResult => {
                    // check if they want to add any extra stuff manually
                    Object.assign(toReturn.data, askForDataResult);
                    readline.question('Write to:', writeTo => {
                        fs.writeFileSync(`${__dirname}/../specs/${writeTo}`, dumpYaml(toReturn));
                        process.exit();
                    });
                });
            });
        });
    });
}

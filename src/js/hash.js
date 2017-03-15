// this file manages the hash portion of the url, which in this case shows which parts are currently being compared

const m = require('mithril');
const specData = require('spec-data');

let showErrorLock = false;
const showError = msg => {
    if(showErrorLock) return;
    showErrorLock = true;
    document.querySelector('#error').textContent = msg;
    document.querySelector('#error-wrapper').style.transform = 'none';
    setTimeout(() => {
        document.querySelector('#error-wrapper').style.transform = 'translateY(-15vh)';
        setTimeout(() => showErrorLock = false, 500);
    }, 2500);
}

module.exports = {
    // c => c does the work of geting rid of empty strings, which occurs when there is no parts (empty string input)
    getList: () => location.hash.slice(3).split(',').filter(c => c),
    add: newName => {
        const curList = module.exports.getList();
        if(curList.length >= 6) {
            return showError('Maximum 6 parts at once');
        }
        if(curList.length > 0 && specData[curList[0]].type !== specData[newName].type) {
            return showError('All parts must be the same type');
        }
        if(!module.exports.getList().includes(newName)) {
            m.route.set('/' + module.exports.getList().concat(newName).join(','));
        }
    },
    remove: oldName => m.route.set('/' + module.exports.getList().filter(c => c !== oldName).join(',')),
}

window.hashMan = module.exports;

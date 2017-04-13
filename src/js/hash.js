// this file manages the hash portion of the url, which in this case shows which parts are currently being compared
// however, it has evolved into more of a general url-switching manager which also manages some of the other things which happen when the page is changed

const m = require('mithril');
const specData = require('spec-data');
const pure = require('./pure.js');

let showErrorLock = false;
const showError = msg => {
    if(showErrorLock) return;
    const errorElt = document.querySelector('#error');
    showErrorLock = true;
    errorElt.textContent = msg;
    errorElt.style.transform = 'translateY(6em)';
    setTimeout(() => {
        errorElt.style.transform = 'none';
        setTimeout(() => showErrorLock = false, 500);
    }, 2500);
}

const clickyMovey = document.getElementById('clicky-movey');

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
        clickyMovey.style.animation = 'none';
        // force reflow
        // I believe that this is the only legitimate use of the void function, apart from bookmarklets
        void(clickyMovey.offsetHeight);
        clickyMovey.style.animation = 'blinky 300ms';
        if(!module.exports.getList().includes(newName)) {
            m.route.set('/' + module.exports.getList().concat(newName).join(','));
        }
    },
    remove: oldName => m.route.set('/' + module.exports.getList().filter(c => c !== oldName).join(',')),
}

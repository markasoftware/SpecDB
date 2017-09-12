// this file manages the hash portion of the url, which in this case shows which parts are currently being compared
// however, it has evolved into more of a general url-switching manager which also manages some of the other things which happen when the page is changed

const m = require('mithril');
const specData = require('spec-data');

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

const specViewer = document.getElementById('spec-viewer');

module.exports = {
    // c => c does the work of geting rid of empty strings, which occurs when there is no parts (empty string input)
    getList: () => location.hash.slice(3).split(',').filter(c => c),
    add: newName => {
        const curList = module.exports.getList();
        if(curList.length >= 6) {
            return showError('Maximum 6 parts at once');
        }
        const typeCompat = {
            'APU': ['APU', 'CPU', 'Graphics Card'],
            'Graphics Card': ['Graphics Card', 'APU'],
            'CPU': ['CPU', 'APU'],
        };
        if(curList.length > 0 && !curList.every(c => typeCompat[specData[c].type].includes(specData[newName].type))) {
            return showError('All parts must be comparable! (no CPU-vs-GPU)');
        }
        specViewer.style.animation = 'none';
        // force reflow
        // I believe that this is the only legitimate use of the void function, apart from bookmarklets
        void(specViewer.offsetHeight);
        if(screen.availWidth <= 800 && screen.availWidth < screen.availHeight) {
            specViewer.style.animation = 'blinky 300ms';
        }
        if(!module.exports.getList().includes(newName)) {
            m.route.set('/' + module.exports.getList().concat(newName).join(','));
        }
    },
    remove: oldName => m.route.set('/' + module.exports.getList().filter(c => c !== oldName).join(',')),
}

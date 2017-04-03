// this file manages the hash portion of the url, which in this case shows which parts are currently being compared
// it also manages setting meta and title stuff when hash changes, for SEO porpoises

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
    updateSeo: () => {
        // first, remove any existing seo shit
        const canonicalRem = document.querySelector('link[rel=canonical]');
        if(canonicalRem) {
            canonicalRem.parentNode.removeChild(canonicalRem);
        }
        const descriptionRem = document.querySelector('meta[name=description]');
        const description = document.createElement('meta');
        if(descriptionRem) {
            descriptionRem.parentNode.removeChild(descriptionRem);
        }
        description.name = 'description';

        const seoData = pure.seo(module.exports.getList());
        if(seoData.canonical) {
            const canonical = document.createElement('link');
            canonical.rel = 'canonical';
            canonical.href = seoData.canonical;
            document.head.appendChild(canonical);
        }
        document.title = seoData.title;
        description.content = seoData.description;

        document.head.appendChild(description);
    }
}

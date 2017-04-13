const pure = require('./pure.js');
const hashMan = require('./hash.js');
const specData = require('spec-data');

module.exports = {
    innerUpdate: data => {
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

        if(data.canonical) {
            const canonical = document.createElement('link');
            canonical.rel = 'canonical';
            canonical.href = data.canonical;
            document.head.appendChild(canonical);
        }
        document.title = data.title;
        description.content = data.description;

        document.head.appendChild(description);
    },
    update: () => module.exports.innerUpdate(pure.seo(hashMan.getList().map(c => specData[c].humanName))),
}

const m = require('mithril');

m.route(document.getElementById('spec-viewer'), '/', {
    '/about': require('./about.js'),
    '/:parts...': require('./spec-viewer.js'),
});
m.mount(document.getElementById('part-selector'), require('./part-selector.js'));

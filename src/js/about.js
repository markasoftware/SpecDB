const m = require('mithril');

module.exports = {
    view: () => m('#about-wrapper', [
        m('h1', 'About'),
        m('p#about-text', 'SpecDB is an AMD equivalent to Intel\'s ARK. It is free and open source, the main developer being markasoftware/Mark Polyakov. It is powered by Mithril and Browserify on the front-end, and has no backend.'),
        m('a[href=#!/]', 'Back to SpecDB Home'),
    ]),
}
const m = require('mithril');

module.exports = {
    view: () => m('#about-wrapper', [
        m('h1', 'About'),
        m('p#about-text', 'SpecDB is an AMD equivalent to Intel\'s ARK. It is free and open source, the main developer being markasoftware/Mark Polyakov.'),
        m('a[href=#!/]', 'Back to SpecDB Home'),
    ]),
}
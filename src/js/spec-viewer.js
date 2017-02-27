const m = require('mithril');
const specData = require('spec-data');
const singlePart = require('./components/part.js');

module.exports = {
    hideIdenticalRows: false,
    view: vnode => {
        const partNames = vnode.attrs.parts.split(',');
        return m('.big-padded', partNames.length === 0 ? [
            m('#nothing-selected', 'No Parts Selected'),
        ] : [
            m('h2.centered', 'SELECTED COMPONENTS:'),
            m('#selected-parts-list.parts-flex-wrapper', partNames.map(curPartName => m(singlePart, {
                name: curPartName,
                canSelect: false,
            }))),
        ]);
    },
}
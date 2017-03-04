const m = require('mithril');
const specData = require('spec-data');
const singlePart = require('./components/part.js');
const hashMan = require('./hash.js');
const pure = require('./pure.js');

module.exports = {
    hideIdenticalRows: false,
    view: vnode => {
        const partNames = hashMan.getList();
        const partData = partNames.map(c => specData[c]);
        const rowNames = pure.getRowNames(partData);
        return m('.big-padded', partNames.length === 0 ? [
            m('#nothing-selected', 'No Parts Selected'),
        ] : [
            m('h2.centered', 'SELECTED COMPONENTS:'),
            m('#selected-parts-list.parts-flex-wrapper', partNames.map(curPartName => m(singlePart, {
                name: curPartName,
                canSelect: false,
            }))),
            m('table', [
                // header with part names
                m('tr', partData.map(c => m('th', c.humanName))),
                // now for real data
                rowNames.map(curRowName => {
                    // get all the values for the current row
                    const curRowValues = partData.map(c => c.data[curRowName]);
                    return m('tr', [
                        m('td.row-header', curRowName),
                        curRowValues.map(c => m('td', c)),
                    ]);
                }),
            ]),
        ]);
    },
}

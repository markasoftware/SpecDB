const m = require('mithril');
const specData = require('spec-data');
const singlePart = require('./components/part.js');
const hashMan = require('./hash.js');
const pure = require('./pure.js');
const rowData = require('./row-data.js');
const seo = require('./seo.js');

module.exports = {
    hideIdenticalRows: false,
    showAdvancedRows: false,
    oncreate: seo.update,
    onupdate: seo.update,
    view: vnode => {
        const partNames = hashMan.getList();
        const partData = partNames.map(c => specData[c]);
        const rowNames = pure.getRowNames(partData);
        return m('.big-padded', partNames.length === 0 ? [
            m('#nothing-selected', 'No Parts Selected'),
        ] : [
            m('h2.centered', 'SELECTED COMPONENTS:'),
            m('#selected-parts-list.flex-wrapper', partNames.map(curPartName => m(singlePart, {
                name: curPartName,
                canSelect: false,
            }))),
            m('.hr'),
            m('h2.centered', 'SPECIFICATIONS:'),
            // table options, e.g hide identical rows, advanced rows
            m('.flex-wrapper', [

            ]),
            m('table', [
                // header with part names
                m('tr', [
                    m('td.left-corner'),
                    partData.map(c => m('th', c.humanName))
                ]),
                // now for real data
                rowNames.map(curRowName => {
                    // get all the values for the current row
                    const rowValues = partData.map(c => c.data[curRowName]);
                    const processed = pure.processRow(rowValues, rowData[curRowName]);
                    return m('tr', [
                        m('td.row-header', curRowName),
                        processed.values.map((c, i) => m('td' + (processed.values.length > 1 && processed.maxIndices.includes(i) ? '.winner' : ''), c)),
                    ]);
                }),
            ]),
        ]);
    },
}

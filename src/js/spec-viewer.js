const m = require('mithril');
const specData = require('spec-data');
const singlePart = require('./components/part.js');
const hashMan = require('./hash.js');
const pure = require('./pure.js');
const rowData = require('./row-data.js');

module.exports = {
    hideIdenticalRows: false,
    showAdvancedRows: false,
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
                    let curRowValues = partData.map(c => c.data[curRowName]);
                    const canCompare = Object.keys(rowData).includes(curRowName);
                    let maxValue;
                    if(canCompare) {
                        const curRowProcessor = rowData[curRowName];
                        curRowProcessor.preprocess = curRowProcessor.preprocess || (c => c);
                        curRowProcessor.postprocess = curRowProcessor.postprocess || (c => c);
                        // sorry for this line
                        maxValue = curRowProcessor.postprocess(curRowValues.reduce((a, b) => curRowProcessor.compare(curRowProcessor.preprocess(a), curRowProcessor.preprocess(b)) ? a : b));
                        curRowValues = curRowValues.map(curRowProcessor.postprocess);
                    }
                    return m('tr', [
                        m('td.row-header', curRowName),
                        curRowValues.map(c => m('td' + (canCompare && curRowValues.length > 1  && c === maxValue ? '.winner' : ''), c)),
                    ]);
                }),
            ]),
        ]);
    },
}

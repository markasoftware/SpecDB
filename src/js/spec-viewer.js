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
                    const rowProcessor = rowData[curRowName];
                    let maxIndices = [];
                    if(rowProcessor) {
                        // Insert default values
                        curRowValues = curRowValues.map(c => (c === undefined && rowProcessor.default !== undefined) ? rowProcessor.default : c);
                        if(rowProcessor.compare) {
                            const preprocess = rowProcessor.preprocess ? rowProcessor.preprocess : (c => c);
                            // filter is to get rid of any undefined values
                            const maxValue = curRowValues.filter(c => c).reduce((a, b) => rowProcessor.compare(preprocess(a), preprocess(b)) ? a : b)
                            // find which ones are equal to the maxValue, put into maxIndices
                            curRowValues.forEach((c, i) => {
                                if(c === maxValue) {
                                    maxIndices.push(i);
                                }
                            });
                        }
                        curRowValues = curRowValues.map(c => (c !== undefined && rowProcessor.postprocess) ? rowProcessor.postprocess(c) : c);
                    }
                    return m('tr', [
                        m('td.row-header', curRowName),
                        curRowValues.map((c, i) => m('td' + (curRowValues.length > 1 && maxIndices.includes(i) ? '.winner' : ''), c)),
                    ]);
                }),
            ]),
        ]);
    },
}

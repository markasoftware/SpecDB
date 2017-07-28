const m = require('mithril');
const specData = require('spec-data');
const singlePart = require('./components/part.js');
const hashMan = require('./hash.js');
const pure = require('./pure.js');
const rowData = require('./row-data.js');
const seo = require('./seo.js');

module.exports = {
    identicalRows: true,
    advancedRows: false,
    oncreate: seo.update,
    onupdate: seo.update,
    view: vnode => {
        const partNames = hashMan.getList();
        let partData, rowNames;
        if(partNames.length > 0) {
            partData = partNames.map(c => specData[c]);
            rowNames = pure.getRowNames(partData, vnode.state.advancedRows);
        }
        // filter out advanced rows if necessary
        return [
            (partNames.length === 0 ? [
                m('#nothing-selected', 'No Parts Selected'),
            ] : [
                m('h2.centered.top', 'SELECTED COMPONENTS:'),
                m('#selected-parts-list.flex-wrapper.justify-center', partNames.map(curPartName => m(singlePart, {
                    name: curPartName,
                    canSelect: false,
                }))),
                m('.hr'),
                m('h2.centered', 'SPECIFICATIONS:'),
                // table options, e.g hide identical rows, advanced rows
                m('.flex-wrapper.justify-center', [
                    m('.table-option', {
                        class: vnode.state.identicalRows ? 'red-selected' : '',
                        onclick: () => vnode.state.identicalRows = !vnode.state.identicalRows,
                    }, 'Show Identical Rows'),
                    m('.table-option', {
                        class: vnode.state.advancedRows ? 'red-selected' : '',
                        onclick: () => vnode.state.advancedRows = !vnode.state.advancedRows,
                    }, 'Show Advanced Data'),
                ]),
                m('table.spec-tab', [
                    // header with part names
                    m('tr', [
                        m('td.table-section-hidden'),
                        m('td.left-corner'),
                        partData.map(c => m('th', c.humanName))
                    ]),
                    // now for real data
                    rowNames.map(curRowName => {
                        // get all the values for the current row
                        const rowValues = partData.map(c => c.data[curRowName]);
                        const processed = pure.processRow(rowValues, rowData[curRowName]);
                        const isComparing = processed.values.length > 1;
                        const allEqual = processed.values.reduce((a, b) => a === b);
                        // if identical rows are hidden and this is identical, skip it
                        if(isComparing && allEqual && (!vnode.state.identicalRows)) {
                            return;
                        }
                        return m('tr', [
                            // TODO: logic for sections
                            (curRowName === 'Base Frequency' ?
                            m('td.table-section-hidden[rowspan="7"]', 
                                m('.table-section', [
                                    m('a.table-section-label', 'Basic Specs'),
                                    m('.table-section-bracket', [
                                        m('#bracket-upper-end.bracket-curve'),
                                        m('#bracket-upper-rect.bracket-rect'),
                                        m('#bracket-upper-join.bracket-curve'),
                                        m('#bracket-lower-join.bracket-curve'),
                                        m('#bracket-lower-rect.bracket-rect'),
                                        m('#bracket-lower-end.bracket-curve'),
                                    ]),
                                ])
                            ) : []),
                            m('td.row-header', curRowName),
                            processed.values.map((c, i) => m('td' + 
                                ((!allEqual) && isComparing && processed.maxIndices.includes(i)? '.winner' : ''), c)),
                        ]);
                    }),
                ]),
            ]),
            // bottom thing with info
            m('#info-links', [
                // dash is u2014
                'SpecDB — ',
                m('a', { href: '#!/about'}, 'About'),
                ' — ',
                m('a', { href: 'https://github.com/markasoftware/SpecDB', target: '_blank' }, 'GitHub'),
            ]),
        ];
    },
}

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
        let partData, rowNames;
        if(partNames.length > 0) {
            partData = partNames.map(c => specData[c]);
            rowNames = pure.getRowNames(partData);
        }
        return m('.relative-container', [
            m('.big-padded', partNames.length === 0 ? [
                m('#nothing-selected', 'No Parts Selected'),
            ] : [
                m('h2.centered.top', 'SELECTED COMPONENTS:'),
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
                        const allEqual = processed.values.reduce((a, b) => a === b);
                        return m('tr', [
                            m('td.row-header', curRowName),
                            processed.values.map((c, i) => m('td' + ((!allEqual) && processed.values.length > 1 && processed.maxIndices.includes(i)? '.winner' : ''), c)),
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
        ]);
    },
}

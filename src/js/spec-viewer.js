const m = require('mithril');
const specData = require('spec-data');
const singlePart = require('./components/part.js');
const hashMan = require('./hash.js');
const pure = require('./pure.js');
const rowData = require('./row-data.js');
const seo = require('./seo.js');

// this probably should go somewhere else, but we're putting it here
// if localStorage settings for whether sections should be displayed is not there,
// set it to the default `display` thing from rowData
rowData.sections.forEach(curSection => {
    const curKey = `table-section-display-${curSection.name}`;
    if(localStorage.getItem(curKey) === null) {
        // using yes/no instead of true/false to make it clear these aren't real booleans
        // (localStorage only supports strings)
        localStorage.setItem(curKey, curSection.display ? 'yes' : 'no');
    }
});

module.exports = {
    identicalRows: true,
    advancedRows: false,
    oncreate: seo.update,
    onupdate: seo.update,
    view: vnode => {
        const partNames = hashMan.getList();
        const partData = partNames.map(c => specData[c]);
        const sections = pure.getTableData(partData, rowData.sections);
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
                    sections.map(curSection => {
                        // if we don't have any data for this section, exit now
                        if(curSection.rows.length === 0) {
                            return;
                        }
                        const curLsKey = `table-section-display-${curSection.name}`;
                        const toggleLs = () => localStorage.setItem(curLsKey,
                            localStorage.getItem(curLsKey) === 'yes' ? 'no' : 'yes');
                        return localStorage.getItem(curLsKey) === 'yes' ?
                            // section is displayed
                            curSection.rows.map((curRow, i) =>
                                m('tr', [
                                    // include bracket if this is the top row
                                    i === 0 &&
                                        m('td.table-section-hidden', {
                                            rowspan: curSection.rows.length,
                                        },
                                            m('.table-section', [
                                                m('a.table-section-label', { onclick: toggleLs }, curSection.name),
                                                m('.table-section-bracket', [
                                                    m('#bracket-upper-end.bracket-curve'),
                                                    m('#bracket-upper-rect.bracket-rect'),
                                                    m('#bracket-upper-join.bracket-curve'),
                                                    m('#bracket-lower-join.bracket-curve'),
                                                    m('#bracket-lower-rect.bracket-rect'),
                                                    m('#bracket-lower-end.bracket-curve'),
                                                ]),
                                            ])
                                        ),
                                    m('td.row-header', curRow.name),
                                    curRow.cells.map(curCell =>
                                        m('td', {
                                            class: curCell.winner ? 'winner' : '',
                                        }, curCell.value)
                                    ),
                                ])
                            ) :
                            // section is collapsed
                            m('tr', [
                                m('td.table-section-hidden'),
                                m('td.table-section-collapsed', {
                                    // +1 to account for row header thing
                                    colspan: curSection.rows[0].cells.length + 1,
                                },
                                    m('a', { onclick: toggleLs }, curSection.name)
                                ),
                            ])
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

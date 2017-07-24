const m = require('mithril');
const specData = require('spec-data');
const specKeys = Object.keys(specData);
const mainSelector = require('./components/main-selector.js');

module.exports = {
    searchTerm: '',
    breadcrumbs: [],
    onupdate: vnode => vnode.dom.parentElement.scrollTop = 0,
    view: vnode => {
        const curData = specData[vnode.state.breadcrumbs.length ? vnode.state.breadcrumbs.slice(-1) : 'AMD'];
        return m('.padded', [
            m('input#search-toggle[type="checkbox"][name="search-toggle"]'),
            m('label#search-toggle-label[for="search-toggle"]',
                // TODO: replace with svg icon for better compatibility
                m('#search-icon', '⚲'), // u26b2
            ),
            m('#searching-container', [
                m('input#search-bar[placeholder="Search..."]', {
                    oninput: m.withAttr('value', newTerm => vnode.state.searchTerm = newTerm),
                }),
                m('h2', 'RESULTS:'),
                m(mainSelector, {
                    sections: [{
                        // perform search, match every word
                        members: specKeys.filter(curKey =>
                            vnode.state.searchTerm.split(/[ \-_]/g).every(term =>
                                specData[curKey].humanName.toLowerCase().includes(term.toLowerCase())
                            ) && specData[curKey].isPart
                        ),
                    }],
                }),
            ]),
            m('#not-searching-container', [
                m('#breadcrumbs', [
                    m('span.a', { onclick: () => vnode.state.breadcrumbs = [] }, 'Home'),
                    vnode.state.breadcrumbs.map((crumbName, index) =>
                        [
                            m('span.separator', '>'),
                            m('span.a', { onclick: () => vnode.state.breadcrumbs.splice(index + 1) }, specData[crumbName].humanName),
                        ]
                    ),
                ]),
                m('h2', curData.topHeader),
                m(mainSelector, {
                    sections: curData.sections,
                    onCategorySelect: newCrumb => vnode.state.breadcrumbs.push(newCrumb),
                })
            ]),
        ]);
    },
}

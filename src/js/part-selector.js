const m = require('mithril');
const specData = require('spec-data');
const mainSelector = require('./components/main-selector.js');

module.exports = {
    searchTerm: '',
    breadcrumbs: [],
    view: vnode => {
        const searchSections = [];
        Object.keys(specData)
        .filter(c =>
            vnode.state.searchTerm.split(/[ \-_]/g).every(term =>
                    JSON.stringify(specData[c]).toLowerCase().includes(term.toLowerCase())
            ) && specData[c].isPart
        )
        // group by type
        // possible TODO: make this do in a certain order. i.e, CPUs should probably go above APUs once that's implemented
        .sort((a, b) => specData[a].type > specData[b].type)
        .forEach(c => {
            // if we have a new type, create a new section
            if(searchSections.length === 0 || searchSections[searchSections.length - 1].header !== specData[c].type + 's') {
                searchSections.push({
                    // best way to pluralize
                    // TODO: refactor
                    header: specData[c].type + 's',
                    members: [],
                });
            }
            searchSections[searchSections.length - 1].members.push(c);
        });
        const curData = specData[vnode.state.breadcrumbs.length ? vnode.state.breadcrumbs.slice(-1) : 'AMD'];

        return [
            m('input#search-toggle[type="checkbox"]'),
            m('label#search-toggle-label[for="search-toggle"]',
                // TODO: replace with svg icon for better compatibility
                m('#search-icon', '⚲') // u26b2
            ),
            m('#searching-container', [
                m('input#search-bar[placeholder="Search..."]', {
                    oninput: m.withAttr('value', newTerm => vnode.state.searchTerm = newTerm),
                }),
                m('h2', 'RESULTS:'),
                m(mainSelector, {
                    sections: searchSections,
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
                    onCategorySelect: newCrumb => {
                        document.getElementById('part-selector').scrollTop = 0;
                        vnode.state.breadcrumbs.push(newCrumb);
                    },
                })
            ]),
        ];
    },
}

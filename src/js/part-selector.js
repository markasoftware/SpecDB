const m = require('mithril');
const specData = require('spec-data');
const mainSelector = require('./components/main-selector.js');

module.exports = {
    breadcrumbs: [],
    view: vnode => {
        const curData = specData[vnode.state.breadcrumbs.length ? vnode.state.breadcrumbs.slice(-1) : 'AMD'];
        return m('.padded', [
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
            }),
            // bottom thing with info
            m('#info-links', [
                // dash is u2014
                'SpecDB — ',
                m('a', { href: '#!/about'}, 'About'),
                ' — ',
                m('a', { href: 'https://github.com/markasoftware/SpecDB', target: '_blank' }, 'GitHub'),
            ]),
        ])
    },
}

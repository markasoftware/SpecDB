const m = require('mithril');
const specData = require('spec-data');
const singlePart = require('./part.js');

module.exports = {
    view: vnode =>
        m('#main-selector-wrapper',
            vnode.attrs.sections.map(curSection => {
                return [
                    (curSection.header && m('h3', curSection.header)),
                    m('.parts-flex-wrapper', curSection.members.map(curMemberName =>
                        m(singlePart, {
                            name: curMemberName,
                            onCategorySelect: vnode.attrs.onCategorySelect,
                        })
                    )),
                ];
            })
        ),
}
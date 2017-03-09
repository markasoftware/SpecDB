const m = require('mithril');
const specData = require('spec-data');
const pure = require('../pure.js');
const hashMan = require('../hash.js');

module.exports = {
    view: vnode => {
        const curData = specData[vnode.attrs.name];
        if(!curData) {
            console.error('No data for part: ' + vnode.attrs.name);
            return m('div');
        }
        return m('.part', {
                onclick: curData.isPart ? vnode.attrs.canSelect ? () => hashMan.add(vnode.attrs.name) : () => hashMan.remove(vnode.attrs.name) : () => vnode.attrs.onCategorySelect(vnode.attrs.name),
            }, [
                m('.part-padding', [
                    m('.part-header', curData.humanName),
                    m('.part-subtext', pure.genSubtext(curData).map(c => m('div', c))),
                ]),
            ]);
    },
}

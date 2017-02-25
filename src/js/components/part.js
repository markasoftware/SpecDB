const m = require('mithril');
const specData = require('spec-data');

module.exports = {
    view: vnode => {
        const curData = specData[vnode.attrs.name];
        if(!curData) {
            console.error('No data for part: ' + vnode.attrs.name);
            return m('div');
        }
        console.log(vnode.attrs);
        return m('.part', {
                draggable: curData.isPart,
                style: {
                    cursor: curData.isPart ? 'move' : 'pointer',
                },
                onclick: curData.isPart ? () => null : () => vnode.attrs.onCategorySelect(vnode.attrs.name),
            }, [
                m('.part-padding', 'i am a part. My name is ' + curData.humanName),
            ]);
    },
}
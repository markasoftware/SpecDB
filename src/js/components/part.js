const m = require('mithril');
const specData = require('spec-data');
const pure = require('../pure');
const hashMan = require('../hash');

module.exports = {
	view: vnode => {
		const curData = specData[vnode.attrs.name];
		if(!curData) {
			console.error('No data for part: ' + vnode.attrs.name);
			return m('div');
		}
		return m('.part', {
				onclick: () => {
					if(curData.isPart) {
						if(vnode.attrs.canSelect) {
							// add part to list
							hashMan.add(vnode.attrs.name);
						} else {
							// remove part from list
							hashMan.remove(vnode.attrs.name);
						}
					} else {
						// we're a catogory, call parent
						vnode.attrs.onCategorySelect(vnode.attrs.name);
					}
				},
				class: curData.data && curData.data.Manufacturer
					&& curData.data.Manufacturer.toLowerCase().replace('3','three') || 'amd',
			}, [
				m('.part-padding', [
					m('.part-header', curData.humanName),
					m('.part-subtext', pure.genSubtext(curData).map(c => m('div', c))),
				]),
			]);
	},
}

const m = require('mithril');
const singlePart = require('./part');

module.exports = {
	view: vnode =>
		m('#main-selector-wrapper',
			vnode.attrs.sections.map(curSection => {
				return [
					(curSection.header && m('h3', curSection.header)),
					m('.flex-wrapper', curSection.members
					// fix issue where some part names would be numbers when listed that way in section files
					// this allowed them to be selected multiple times, because inclusion checks to make sure
					// they're not already selected failed (number !== string)
					.map(memberName => memberName.toString())
					.map(curMemberName =>
						m(singlePart, {
							name: curMemberName,
							onCategorySelect: vnode.attrs.onCategorySelect,
							canSelect: true,
						})
					)),
				];
			})
		),
}

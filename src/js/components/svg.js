'use strict';

const m = require('mithril');

// attrs: d (the d attribute for <path>)
// very nice for iconmonstr icons
const svg = {
	view: vnode =>
		m('svg', {
			xmlns: 'http://www.w3.org/2000/svg',
			width: '24',
			height: '24',
			viewBox: '0 0 24 24',
		}, [
			m('path', {
				d: vnode.attrs.d,
			}),
		])
};
module.exports = svg;

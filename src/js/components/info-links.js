const m = require('mithril');

module.exports = {
	view: vnode =>
		m('#info-links', [
			// dash is u2014
			m('span', [
				'Spec',
				m('strong', 'DB'),
			]),
			' — ',
			m('a[href=/about]', {oncreate: m.route.link}, 'About'),
			' — ',
			m('a', { href: 'https://github.com/markasoftware/SpecDB', target: '_blank', rel: 'noopener' }, 'GitHub'),
		]),
};

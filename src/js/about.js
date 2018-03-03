const m = require('mithril');

module.exports = {
	oncreate: () =>
		require('./seo').innerUpdate({
			title: 'SpecDB — About',
			description: 'Information about SpecDB, such as development history, contributors, and how to contribute yourself',
		}),
	view: () => m('#about-wrapper', [
		m('h1', 'About'),
		m('p', 'SpecDB is an AMD equivalent to Intel\'s ARK. It is free and open source, the main developer being markasoftware/Mark Polyakov. It is powered by Mithril and Browserify on the front-end, and has no backend.'),
		m('p', [
			'Donate Bitcoin: ',
			m('a', { href: 'bitcoin:1SpecDBRt1unH8pqmkpTV6Vxvx7pdVN7C' }, '1SpecDBRt1unH8pqmkpTV6Vxvx7pdVN7C'),
			m('br'),
			'(vanity address mined an a gtx 670)',
		]),
		m('a[href=#!/]', 'Back to SpecDB Home'),
	]),
}

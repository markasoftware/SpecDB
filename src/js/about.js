const m = require('mithril');

module.exports = {
	oncreate: () =>
		require('./seo').innerUpdate({
			title: 'SpecDB — About',
			description: 'Information about SpecDB, such as development history, contributors, and how to contribute yourself',
		}),
	view: () => m('#about-wrapper', [
		m('h1', 'About'),
		m('p', 'SpecDB is a site for viewing and comparing PC components. Originally, SpecDB was intended to be an AMD counterpart to Intel\'s ARK website, but today it contains part data from multiple manufacturers. Mark Polyakov, @markasoftware on GitHub, is the main SpecDB developer. @zcskywire2 is responsible for entering much of the AMD part data (yes, by hand). Other contributors include @Sam-Mear and @Benzhaomin. The data for SpecDB comes from a combination of manually-entered data, which you can find in the GitHub repository, and data automatically scraped and processed from third-party websites (such as Intel ARK, Userbenchmark, and Geekbench). You can find the scripts that perform this scraping on GitHub as well. SpecDB is a Free and Open Source project.'),
		m('a[href=/]', {oncreate: m.route.link}, 'Back to SpecDB Home'),
	]),
}

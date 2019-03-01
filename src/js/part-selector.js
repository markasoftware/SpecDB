const m = require('mithril');
const naturalCompare = require('natural-compare');
const specData = require('spec-data');
const mainSelector = require('./components/main-selector');

// by caching json representation of parts, it is actually quite a bit faster searching
// shouldn't use more than a few megs of ram
const specDataJSONs = {};
const search = {
	searchTerm: '',
	enableSearchLimit: true,
	oncreate: vnode => {
		vnode.dom.querySelector('#search-bar').focus();
	},
	view: vnode => {
		const limit = 50;

		// initialize specDataJSONs if need be
		if (Object.keys(specDataJSONs).length === 0) {
			Object.keys(specData).forEach(c => specDataJSONs[c] = JSON.stringify(specData[c]).toLowerCase());
		}
		const searchSections = [];

		const searchWords = vnode.state.searchTerm.split(/[ \-_]/g)
			.filter(c => c.length)
			.map(c => c.toLowerCase());
		const unlimitedSearchResults = Object.keys(specData)
		.filter(c =>
			searchWords.every(term =>
				specDataJSONs[c].includes(term) && specData[c].isPart
			)
		)
		// group by type
		// possible TODO: make this do in a certain order. i.e, CPUs should probably go above APUs once that's implemented
		.sort((a, b) => naturalCompare(specData[a].type, specData[b].type) || naturalCompare(a.toLowerCase(), b.toLowerCase()));
		const searchNeedsLimiting = unlimitedSearchResults.length > limit && vnode.state.enableSearchLimit;
		const limitedSearchResults = searchNeedsLimiting ?
			unlimitedSearchResults.slice(0, limit) :
			unlimitedSearchResults;
		limitedSearchResults.forEach(c => {
			// if we have a new type, create a new section
			if(searchSections.length === 0 || searchSections[searchSections.length - 1].header !== specData[c].type + 's') {
				searchSections.push({
					// best way to pluralize
					// TODO: refactor
					header: `${specData[c].type}s`,
					members: [],
				});
			}
			searchSections[searchSections.length - 1].members.push(c);
		});

		return m('#searching-container', [
			m('input#search-bar[placeholder="Search..."]', {
				oninput: m.withAttr('value', newTerm => {
					vnode.state.enableSearchLimit = true;
					vnode.state.searchTerm = newTerm;
				}),
			}),
			m(mainSelector, {
				sections: searchSections,
			}),
			searchNeedsLimiting && m('h3.a.center-text',
				{ onclick: () => vnode.state.enableSearchLimit = false },
				`Search limited to ${limit} results, click to view all ${unlimitedSearchResults.length}`,
			)
		]);
	},
};

const browse = {
	breadcrumbs: [],
	view: vnode => {
		const curData = specData[vnode.state.breadcrumbs.length ? vnode.state.breadcrumbs.slice(-1) : 'Root'];
		return m('#not-searching-container', [
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
				onCategorySelect: newCrumb => {
					document.getElementById('part-selector').scrollTop = 0;
					vnode.state.breadcrumbs.push(newCrumb);
				},
			})
		]);
	},
};

module.exports = {
	searching: false,
	view: vnode =>
		[
			m(`#search-toggle-label${vnode.state.searching ? '.selected' : ''}`,
				{ onclick: () => vnode.state.searching = !vnode.state.searching },
				// TODO: replace with svg icon for better compatibility
				m('#search-icon', '⚲') // u26b2
			),
			vnode.state.searching ? m(search) : m(browse),
		],
}

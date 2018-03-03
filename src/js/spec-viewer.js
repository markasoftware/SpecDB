const m = require('mithril');
const specData = require('spec-data');
const singlePart = require('./components/part');
const infoLinks = require('./components/info-links');
const hashMan = require('./hash');
const pure = require('./pure');
const rowData = require('./row-data');
const seo = require('./seo');

// localStorage section display module
const sectionsLs = {
	initialized: localStorage.getItem(`table-section-display-${rowData.sections[0].name}`) !== null,
	get: name => localStorage.getItem(`table-section-display-${name}`) === 'yes',
	set: (name, val) => localStorage.setItem(`table-section-display-${name}`, val ? 'yes' : 'no'),
	toggle: name => sectionsLs.set(name, !sectionsLs.get(name)),
	// returns 1 for all on, -1 for all off, 0 for mixed
	// yeah, I know this isn't java and there's a better way, but this is how I'm gonna do it
	checkAll: () => {
		const firstSectionState = sectionsLs.get(rowData.sections[0].name)
		return rowData.sections.every(c => sectionsLs.get(c.name) === firstSectionState) ? firstSectionState * 2 - 1 /* #winning */: 0;
	},
	setAll: setTo => rowData.sections.map(c => sectionsLs.set(c.name, setTo)),
};

// If unused before, set the section display to the defaults.
if(!sectionsLs.initialized) {
	rowData.sections.forEach(curSection => {
		sectionsLs.set(curSection.name, curSection.display);
	});
}

module.exports = {
	identicalRows: true,
	uncomparableRows: true,
	oncreate: seo.update,
	onupdate: seo.update,
	view: vnode => {
		const partNames = hashMan.getList();
		const partData = partNames.map(c => specData[c]);
		const sections = pure.getTableData(partData, rowData.sections, {
			showIdenticalRows: vnode.state.identicalRows,
			showUncomparableRows: vnode.state.uncomparableRows,
		});
		// filter out advanced rows if necessary
		return [
			(partNames.length === 0 ? [
				m('#nothing-selected', 'No Parts Selected'),
				m('.flex-vertical-spacer'),
				m(infoLinks),
			] : [
				m('h2.centered.top.mt1', 'SELECTED COMPONENTS:'),
				m('#selected-parts-list.flex-wrapper.justify-center', partNames.map(curPartName => m(singlePart, {
					name: curPartName,
					canSelect: false,
				}))),
				m('.hr'),
				m('h2.centered', 'SPECIFICATIONS:'),
				// table options, e.g hide identical rows, advanced rows
				m('.flex-wrapper.justify-center', [
					m('.table-option', {
						class: vnode.state.identicalRows && 'red-selected',
						onclick: () => vnode.state.identicalRows = !vnode.state.identicalRows,
					}, 'Show Identical Rows'),
					m('.table-option', {
						class: vnode.state.uncomparableRows && 'red-selected',
						onclick: () => vnode.state.uncomparableRows = !vnode.state.uncomparableRows,
					}, 'Show Incomplete Rows'),
				]),
				m('.spec-tab-wrapper',
					m('table.spec-tab', [
						// header with part names
						m('tr', [
							m('td.left-corner'),
							partData.map(c => m('th', c.humanName)),
							m('td.table-section-hidden.table-collapse-button', [
								m('.a', { onclick: () => {
									if(sectionsLs.checkAll() === 1) {
										// everything is already shown, hide things
										sectionsLs.setAll(false);
									} else {
										// some or everything is hidden, show everything
										sectionsLs.setAll(true);
									}
								}}, m.trust(`${sectionsLs.checkAll() === 1 ? '-' : '+'}&nbsp;All`)),
							]),
						]),
						// now for real data
						sections.map(curSection => {
							// if we don't have any data for this section, exit now
							if(curSection.rows.length === 0) {
								return;
							}
							return sectionsLs.get(curSection.name) ?
								// section is displayed
								curSection.rows.map((curRow, i) =>
									m('tr', [
										m('td.row-header', curRow.name),
										curRow.cells.map(curCell =>
											m('td', {
												class: curCell.winner ? 'winner' : '',
											// if it's an array, then do line-break separated values, otherwise do just the value
											}, curCell.value instanceof Array ?
												[
													curCell.value[0],
													curCell.value.slice(1).map(c => [ m('br'), c ]),
												]
												: curCell.value
											)
										),
										// include bracket if this is the top row
										i === 0 &&
											m(`td.table-section-hidden.not-that-hidden`, {
												rowspan: curSection.rows.length,
												onclick: () => sectionsLs.toggle(curSection.name),
											},
												[
													m('.a.table-section-label', curSection.name),
													m('.table-section-bracket', [
														m('.bracket-upper-end.bracket-curve'),
														m('.bracket-upper-rect.bracket-rect'),
														m('.bracket-upper-join.bracket-curve'),
														m('.bracket-lower-join.bracket-curve'),
														m('.bracket-lower-rect.bracket-rect'),
														m('.bracket-lower-end.bracket-curve'),
													]),
												]
											),
									])
								) :
								// section is collapsed
								m('tr', { onclick: () => sectionsLs.toggle(curSection.name) }, [
									m('td.table-section-collapsed', {
										// +1 to account for row header thing
										colspan: curSection.rows[0].cells.length + 1,
									},
										m('a', curSection.name)
									),
									m('td.table-section-hidden'),
								])
						}),
					]),
				),
				m(infoLinks),
			]),
		];
	},
}

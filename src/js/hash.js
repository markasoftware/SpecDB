// this file manages the hash portion of the url, which in this case shows which parts are currently being compared
// however, it has evolved into more of a general url-switching manager which also manages some of the other things which happen when the page is changed

const m = require('mithril');
const specData = require('spec-data');

let showErrorLock = false;
const showError = msg => {
	if(showErrorLock) return;
	const errorElt = document.querySelector('#error');
	showErrorLock = true;
	errorElt.textContent = msg;
	errorElt.style.transform = 'translateY(6em)';
	setTimeout(() => {
		errorElt.style.transform = 'none';
		setTimeout(() => showErrorLock = false, 500);
	}, 6000);
}

const specViewer = document.getElementById('spec-viewer');

const hashMan = {
	// gets the list of parts. Also removes non-existant parts from URL.
	getList: () => {
		let removed = [];
		const toReturn = m.route.get()
			.replace(/^\//,'')
			.split(',').filter(c => {
				if (!c) { // accounts for empty string
					return false;
				}
				if (!(c in specData)) {
					removed.push(c);
					return false;
				}
				return true;
			});
		if (removed.length) {
			showError(`Parts in URL did not exist: ${removed.join(', ')}`);
			// recursion to infinity when synchronous -- re-render triggers getList before removing everything?
			setTimeout(() => hashMan.remove(...removed), 1);
		}
		return toReturn;
	},
	add: newName => {
		const curList = module.exports.getList();
		if(curList.includes(newName)) {
			return;
		}
		if(curList.length >= 6) {
			return showError('Maximum 6 parts at once');
		}
		const typeCompat = {
			'APU': ['APU', 'CPU', 'Graphics Card'],
			'Graphics Card': ['Graphics Card', 'APU'],
			'CPU': ['CPU', 'APU'],
		};
		if(curList.length > 0 && !curList.every(c => typeCompat[specData[c].type].includes(specData[newName].type))) {
			return showError('All parts must be comparable! (no CPU-vs-GPU)');
		}
		specViewer.style.animation = 'none';
		// force reflow
		// I believe that this is the only legitimate use of the void function, apart from bookmarklets
		void(specViewer.offsetHeight);
		if(screen.availWidth <= 800 && screen.availWidth < screen.availHeight) {
			specViewer.style.animation = 'blinky 300ms';
		}
		m.route.set('/' + curList.concat(newName).join(','));
	},
	remove: (...oldNames) => m.route.set('/' + module.exports.getList().filter(c => !oldNames.includes(c)).join(',')),

	redirectHashBangs: () => { // turn old-style specdb.info/#!/R7-1700 -> specdb.info/R7-1700
		if (location.protocol !== 'file:' && /^#!/.test(location.hash)) {
			location.replace(`${location.origin}/${location.hash.replace(/^#!\/?/, '')}`);
		}
	},
}
module.exports = hashMan;

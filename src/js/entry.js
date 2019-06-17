const m = require('mithril');
const hash = require('./hash');

m.route.prefix(location.protocol === 'file:' ? '#!' : '');
m.route(document.getElementById('spec-viewer'), '/', {
	'/about': require('./about'),
	'/:parts...': require('./spec-viewer'),
});
m.mount(document.getElementById('part-selector'), require('./part-selector'));

// extend part selector if no parts are selected on mobile
if(hash.getList().length === 0) {
	document.getElementById('mobile-toggle').checked = true;
}

// service worker registration
if('serviceWorker' in navigator) {
	navigator.serviceWorker.register('sw.js')
	.catch(() => console.log('Service worker registration failed, make sure you are in production mode'));
}

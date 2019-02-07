'use strict';

const test = require('tape');
const util = require('../build/util');

const yamlVerify = util.yamlVerify;

test('YAMLVERIFY: Missing properties', t => {
	// Required properties: name, humanName, isPart, type
	// Required for subtext: data.whatever
	// Required for sections: topHeader, sections
	const missingRegex = /incorrect type.*found "undefined"/i;

	t.throws(() => yamlVerify({}), missingRegex, 'completely empty');
	t.throws(() => yamlVerify({
		name: 'Yeet',
		humanName: 'yap',
		isPart: true,
		type: 'CPU',
		data: {
			TDP: '95 W',
		},
	}), missingRegex, 'Missing some subtext properties');
	t.throws(() => yamlVerify({
		name: 'Yeet',
		humanName: 'yap',
		isPart: false,
		type: 'Generic Container',
		topHeader: 'ur mom gay',
	}), missingRegex, 'Missing sections');

	t.end();
});

test('YAMLVERIFY: Wrong types', t => {
	const typeRegex = /incorrect type.*found "(?!undefined).+"/i;

	t.throws(() => yamlVerify({
		name: 'BLEP',
		humanName: 'BLEP',
		isPart: 'maybe',
		type: 'Generic Container',
	}), typeRegex, 'isPart is not boolean');
	t.throws(() => yamlVerify({
		name: 'BLEP',
		humanName: 'BLEP',
		isPart: false,
		type: 'Generic Container',
		sections: { },
	}), typeRegex, 'sections is not an array');
	t.doesNotThrow(() => yamlVerify({
		name: 'BLEP',
		humanName: 'BLEP',
		isPart: false,
		type: 'Generic Container',
		sections: [
			{ header: 'RYZEN APUs', members: []},
			{ header: 'Reindeer', members: [ 'Rudolph', 'Prancer', 'Dancer' ]},
			{ header: 'BLYZEN APUs', members: [ 'B6-BBBB' ]},
		],
	}), 'section');

	t.end();
});

test('YAMLVERIFY: All clear', t => {
	t.doesNotThrow(() => yamlVerify({
		name: 'Yeet',
		humanName: 'yap',
		isPart: true,
		type: 'CPU',
		data: {
			TDP: '95 W',
			'Base Frequency': '4.3 GHz',
			'Boost Frequency': '4.5 GHz',
			'Core Count': 67,
			'Thread Count': 1e25, // i.e, 1 bajillion
		},
	}), 'basic CPU part');
	t.doesNotThrow(() => yamlVerify({
		name: 'BLEP',
		humanName: 'BLEP',
		isPart: false,
		type: 'Generic Container',
		sections: [
			{ header: 'RYZEN APUs', members: []},
			{ header: 'Reindeer', members: [ 'Rudolph', 'Prancer', 'Dancer' ]},
			{ header: 'BLYZEN APUs', members: [ 'B6-BBBB' ]},
		],
	}), 'section');
	t.doesNotThrow(() => yamlVerify({
		name: 'BLACK_OPS_$',
		humanName: 'rr',
		isPart: false,
		type: 'CPU Architecture',
		data: {
			'Release Date': '2018-08-13',
			Lithography: '12 nm',
			Sockets: [ 'KRKR' ],
		},
		sections: [
			{ header: 'do NOT say yeet one more fucking time', members: [ 'HH, h', 'rr'] },
		],
	}), 'complex section');

	t.end();
});

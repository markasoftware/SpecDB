'use strict';

const test = require('tape');
const util = require('../build/util');

const yamlVerify = util.yamlVerify;

test('YAMLVERIFY: Missing properties', t => {
	// Required properties: name, humanName, type
	// Required for subtext: data.whatever
	// Required for sections: topHeader, sections
	const missingRegex = /incorrect type.*found "undefined"/i;

	t.throws(() => yamlVerify({}), missingRegex, 'completely empty');
	t.throws(() => yamlVerify({
		name: 'Yeet',
		humanName: 'yap',
		type: 'CPU',
		data: {
			TDP: '95 W',
		},
	}), missingRegex, 'Missing some subtext properties');
	t.throws(() => yamlVerify({
		name: 'Yeet',
		humanName: 'yap',
		type: 'Generic Container',
		topHeader: 'ur mom gay',
	}), missingRegex, 'Missing sections');

	t.end();
});

test('YAMLVERIFY: Wrong types', t => {
	const typeRegex = /incorrect type/i;

	t.throws(() => yamlVerify({
		name: 'BLEP',
		humanName: 'BLEP',
		type: 'Generic Container',
	}), typeRegex, 'Generic Container is missing required elements.');
	t.throws(() => yamlVerify({
		name: 'BLEP',
		humanName: 'BLEP',
		type: 'Generic Container',
		sections: { },
	}), typeRegex, 'sections is not an array');

	t.end();
});

test('YAMLVERIFY: Invalid type throws', t => {
	t.throws(() => yamlVerify({
		name: 'Bogus',
		humanName: 'Bogus',
		type: 'BogusType',
		data: {},
	}), /Unknown type/i, 'should throw for unknown type');

	t.end();
});

test('YAMLVERIFY: inherits', t => {
	const typeRegex = /incorrect type/i;

	t.throws(() => yamlVerify({
		name: 'Yat',
		humanName: 'yat',
		type: 'Generic Container',
		inherits: 637,
	}), typeRegex, 'Inherits is number');
	t.throws(() => yamlVerify({
		name: 'Yat',
		humanName: 'yat',
		type: 'Generic Container',
		inherits: [
			{ }
		],
	}), typeRegex, 'Inherits is array of objects');
	// TODO: we should probably put the all clear tests one-by-one in the relevant test suites

	t.end();
});

test('YAMLVERIFY: All clear', t => {
	t.doesNotThrow(() => yamlVerify({
		name: 'Yeet',
		humanName: 'yap',
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
		humanName: 'BLEP',
		type: 'Generic Container',
		topHeader: 'cod is 4 killerz',
		sections: [
			{ header: 'RYZEN APUs', members: []},
			{ header: 'Reindeer', members: [ 'Rudolph', 'Prancer', 'Dancer' ]},
			{ header: 'BLYZEN APUs', members: [ 'B6-BBBB' ]},
		],
	}), 'section');

	t.doesNotThrow(() => yamlVerify({
		humanName: 'rr',
		type: 'CPU Architecture',
		topHeader: 'cod is 4 killerz',
		inherits: [
			'ur_mom',
			'my_mom',
		],
		data: {
			'Release Date': '2018-08-13',
			Lithography: '12 nm',
			Sockets: [ 'KRKR' ],
		},
		sections: [
			{ header: 'do NOT say yeet one more fucking time', members: [ 'HH, h', 'rr'] },
		],
	}), 'complex section');

	t.doesNotThrow(() => yamlVerify({
		name: 'sam-inherit',
		type: "Hidden",
	}), 'minimal hidden');

	t.end();
});

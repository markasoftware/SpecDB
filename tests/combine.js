const test = require('tape');
const _ = require('lodash');
const cu = require('../build/combine-util');

test('combineUtil: groupByAndDelete', t => {
	const in1 = [{ hello: 'yes' }];
	const out1 = { yes: [{}]};
	t.deepEqual(cu.groupByAndDelete(in1, 'hello'), out1, 'single obj');
	const in2 = [
		{ hello: 'yes', meow: 5 },
		{ hello: 'no', meow: 6 },
		{ hello: 'yes', meow: 7 },
	];
	const out2 = {
		yes: [ { meow: 5 }, { meow: 7 } ],
		no: [ { meow: 6 } ],
	};
	t.deepEqual(cu.groupByAndDelete(in2, 'hello'), out2, 'a few objs');
	const in3 = [
		{ hello: { cat: 'yay world' } },
	];
	const out3 = {
		'yay world': [{ hello: {} }],
	};
	t.deepEqual(cu.groupByAndDelete(in3, 'hello.cat'), out3, 'deep');
	t.end();
});

test('combineUtil: toMatcher', t => {
	const testMatcher = (f, name) => {
		t.ok(_.isFunction(f), `${name} is function`);
		t.ok(f('hello'), `${name} matches properly`);
		t.notOk(f('heello'), `${name} does not match invalid string`);
	};
	t.equal(cu.toMatcher('hello'), 'hello', 'simple string');
	testMatcher(cu.toMatcher('he??o'), 'glob');
	testMatcher(cu.toMatcher(/he..o/), 'regex');
	testMatcher(cu.toMatcher(c => c === 'hello'), 'function');
	t.end();
});

test('combineUtil: getDiscreteItem', t => {
	const fixture = {
		Skylake: [
			{ priority: 0, item: { hidden: true, data: { socket: 'lga' } } },
		],
		'Crater Lake': [
			{ priority: 1, item: { socket: [ 'lga' ], foop: 15 } },
			{ priority: 0, item: { socket: [ 'dna' ], foop: 5 } },
		],
		'Kaby Lake': [
			{ priority: 555, item: { hidden: true, inherits: [ 'Skylake' ] } },
		],
		'Coffee Lake': [
			{ priority: 0, item: { hidden: true, inherits: [ 'Kaby Lake' ] } },
		],
		Foopwell: [
			{ priority: 15, item: { hidden: true, data: { speed: 'fast' } } },
		],
		Haswell: [
			{ priority: 0, item: { inherits: [ 'Coffee Lake', 'Foopwell' ] } },
		],
		Yapwell: [
			{ priority: 0, item: { data: { speed: 'super_duper_fast' } } },
		],
		Boopwell: [
			{ priority: 5, item: { inherits: [ 'Yapwell' ] } },
		],
		// fuck the naming at this point. I guess I'm not even 'murican anymore.
		Yorkshire: [
			{ priority: Number.MAX_SAFE_INTEGER, item: { inherits: [ 'glasgow' ], data: { meow: 5 } } },
		],
		Spoopy: [
			{ priority: 0, item: { hidden: true, data: { speed: 'super duper fast' } } },
			{ priority: 1, item: { data: { speed: 'slow' } } },
		],
		globglogabgolab: [
			{ priority: 0, item: { inherits: [ 'Skylake', 'Haswell' ] } },
			{ priority: 1, item: { data: { speed: 'medium' } } },
			{ priority: 2, item: { inherits: [ 'Skylake' ], data: { speed: 'slow' } } },
		],
	};
	const skylakeData = { hidden: true, data: { socket: 'lga' } };
	const craterlakeData = {
		socket: [ 'dna', 'lga' ],
		foop: 5,
	};
	const kabylakeData = skylakeData;
	const coffeelakeData = { hidden: true, data: { socket: 'lga' }};
	const haswellData = { data: { socket: 'lga', speed: 'fast' } };
	const spoopyData = { data: { speed: 'slow' } };
//	t.deepEqual(cu.getDiscreteItem(fixture, 'Skylake'), skylakeData, 'simple');
	t.deepEqual(cu.getDiscreteItem(fixture, 'Crater Lake'), craterlakeData, 'multiple priorities, no inherits');
//	t.deepEqual(cu.getDiscreteItem(fixture, 'Kaby Lake'), kabylakeData, 'single inherit, single priority');
//	t.deepEqual(cu.getDiscreteItem(fixture, 'Coffee Lake'), coffeelakeData, 'two levels of inherit');
	t.deepEqual(cu.getDiscreteItem(fixture, 'Haswell'), haswellData, 'multiple base level inherits, and deep');
	t.deepEqual(cu.getDiscreteItem(fixture, 'Boopwell'), {}, 'does not inherit from hidden: false');
	t.deepEqual(cu.getDiscreteItem(fixture, 'Spoopy'), spoopyData, 'some hidden shit');
	// this last one tests that 1. inherits has lowest priority and 2. priority applied before inherits
	// those are actually sort of the same thing
	const bigData = { data: {
		socket: 'lga',
		speed: 'medium',
	}};
	t.deepEqual(cu.getDiscreteItem(fixture, 'globglogabgolab'), bigData, 'complex shit');

	t.end();
});

test('combineUtil: applyMatchers', t => {
	const in1 = [
		{ priority: 0, item: { name: 'hi' } },
	];
	const out1 = {
		hi: [ { priority: 0, item: {} } ],
	};
	t.deepEqual(cu.applyMatchers(in1), out1, 'single empty explicit item');

	const in2 = [
		{ priority: 0, item: { name: 'hi' } },
		{ priority: 0, item: { name: c => true, meow: 'yes' } },
	];
	const out2 = {
		hi: [ { priority: 0, item: {} }, { priority: 0, item: { meow: 'yes' } } ],
	};
	t.deepEqual(cu.applyMatchers(in2), out2, 'single explicit + single matcher');

	const in3 = [
		{ priority: 5, item: { name: 'feep', cats: 5 } },
		{ priority: 15, item: { name: 'foop', dogs: 17 } },
		// this also verifies that low-priority explicit is applied before high-priority matchers
		{ priority: 7, item: { name: (c, v) => v.cats === 5, salamanders: 1 } },
	];
	const out3 = {
		feep: [ { priority: 5, item: { cats: 5 } }, { priority: 7, item: { salamanders: 1 } } ],
		foop: [ { priority: 15, item: { dogs: 17 } } ],
	};
	t.deepEqual(cu.applyMatchers(in3), out3, '2 explicit + single matcher, matcher is discriminate and based on value');
	t.end();
});

test('combineUtil: filterKeyedCombined', t => {
	const fixtures = {
		i5: { type: 'Generic Container' },
		i7: {},
		Newton: { type: 'Graphics Architecture', data: {
			Lithography: '595nm',
			'Release Date': 'tomorrow',
		} },
		Firelake: { type: 'Graphics Architecture', data: {
			Lithography: '595nm',
			Yapper: false,
		} },
		// should not be in: unknown type
		bRhcuorCUHC: { type: 'Large Opaque Slimy Blob' },
	};
	t.ok(cu.filterKeyedCombined(fixtures.i5), 'basic');
	t.notOk(cu.filterKeyedCombined(fixtures.i7), 'hidden (no data)');
	t.ok(cu.filterKeyedCombined(fixtures.Newton), 'has required props');
	t.notOk(cu.filterKeyedCombined(fixtures.Firelake), 'missing required props');
	t.notOk(cu.filterKeyedCombined(fixtures.bRhcuorCUHC), 'unknown type');
	t.end();
});

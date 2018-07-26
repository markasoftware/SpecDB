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
		t.ok(f({name: 'hello'}), `${name} matches properly`);
		t.notOk(f({name: 'heello'}), `${name} does not match invalid string`);
	};
	t.equal(cu.toMatcher('hello'), 'hello', 'simple string');
	testMatcher(cu.toMatcher('he??o'), 'glob');
	testMatcher(cu.toMatcher(/he..o/), 'regex');
	testMatcher(cu.toMatcher(c => c.name === 'hello'), 'function');
	t.end();
});

test('combineUtil: getDiscreteItem', t => {
	const fixture = {
		Skylake: [
			{ priority: 0, item: { data: { socket: 'lga' } } },
		],
		'Crater Lake': [
			{ priority: 1, item: { socket: [ 'lga' ], foop: 15 } },
			{ priority: 0, item: { socket: [ 'dna' ], foop: 5 } },
		],
		'Kaby Lake': [
			{ priority: 555, item: { inherits: [ 'Skylake' ] } },
		],
		'Coffee Lake': [
			{ priority: 0, item: { inherits: [ 'Kaby Lake' ] } },
		],
		Foopwell: [
			{ priority: 15, item: { data: { speed: 'fast' } } },
		],
		Haswell: [
			{ priority: 0, item: { inherits: [ 'Coffee Lake', 'Foopwell' ] } },
		],
		globglogabgolab: [
			{ priority: 0, item: { data: { speed: 'medium' } } },
			{ priority: 1, item: { inherits: [ 'Skylake', 'Haswell' ], data: { speed: 'slow' } } },
		],
	};
	const skylakeData = { data: { socket: 'lga' } };
	t.deepEqual(cu.getDiscreteItem(fixture, 'Skylake'), skylakeData, 'simple');
	t.deepEqual(cu.getDiscreteItem(fixture, 'Crater Lake'), {
		socket: [ 'dna', 'lga' ],
		foop: 5,
	}, 'multiple priorities, no inherits');
	t.deepEqual(cu.getDiscreteItem(fixture, 'Kaby Lake'), skylakeData, 'single inherit, single priority');
	t.deepEqual(cu.getDiscreteItem(fixture, 'Coffee Lake'), skylakeData, 'two levels of inherit');
	t.deepEqual(cu.getDiscreteItem(fixture, 'Haswell'), { data: { socket: 'lga', speed: 'fast' } },
		'multiple base level inherits, and deep');
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
		{ priority: 7, item: { name: c => c === 'foop', salamanders: 1 } },
	];
	const out3 = {
		feep: [ { priority: 5, item: { cats: 5 } } ],
		foop: [ { priority: 15, item: { dogs: 17 } }, { priority: 7, item: { salamanders: 1 } } ],
	};
	t.deepEqual(cu.applyMatchers(in3), out3, '2 explicit + single matcher, matcher is discriminate');
	t.end();
});

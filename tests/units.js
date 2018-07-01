const test = require('tape');
const units = require('../src/js/units');

test('units: parseString', t => {
	t.deepEqual(units.parseString('1999 GHz'), { num: 1999, unit: 'GHz' }, 'basic with valid unit');
	t.deepEqual(units.parseString('1549'), { num: 1549, unit: 'count' }, 'no unit');
	// i hope this ain't a real unit
	t.deepEqual(units.parseString('4 VHz'), { num: 4, unit: 'count' }, 'invalid unit');
	t.end();
});

test('units: toNumber', t => {
	t.equal(units.toNumber({ num: 500, unit: 'count' }), 500, 'count');
	t.equal(units.toNumber({ num: 500, unit: 'KiB' }), 512000, 'KiB');
	t.end();
});

test('units: reduce', t => {
	t.deepEqual(units.reduce({ num: 15, unit: 'count' }), { num: 15, unit: 'count' }, 'basic, count');
	t.deepEqual(units.reduce({ num: 59, unit: 'Hz' }), { num: 59, unit: 'Hz' }, 'other units exist, but are higher');
	t.deepEqual(units.reduce({ num: 2000, unit: 'Hz' }), { num: 2, unit: 'KHz' }, 'reduces once (Hz -> KHz)');
	t.deepEqual(units.reduce({ num: 3000000, unit: 'Hz' }), { num: 3, unit: 'MHz' }, 'reduces twice (Hz -> MHz)');
	t.deepEqual(units.reduce({ num: 4*10**12, unit: 'Hz' }), { num: 4000, unit: 'GHz' },
		'reduce thrice, don\'t cross categories to TFLOPS');
	t.deepEqual(units.reduce({ num: 0.5, unit: 'KHz' }), { num: 500, unit: 'Hz' }, 'decreases unit (KHz -> Hz)');
	t.deepEqual(units.reduce({ num: 1500, unit: 'Hz' }, 2), { num: 1500, unit: 'Hz' }, 'Increased minReducedValue');
	// 0.75 is decimal, don't do decimal equivalency checks, so we do this crap to multiple it by 100 first
	const res = units.reduce({ num: 750, unit: 'Hz' }, 0.5);
	res.num *= 100;
	t.deepEqual(res, { num: 75, unit: 'KHz' }, 'Decreased minReducedValue');
	t.end();
});

const test = require('tape');
const combineUtil = require('../build/combine-util');

const threepm = combineUtil.thirdPartyNameToMatcher;
const confirmMatches = (hints, matches, notMatches, t, msg) => {
	const matcher = threepm(hints);
	t.equal(typeof matcher, 'function', `"${msg}" is a fixed matcher`);
	for (const match of matches) {
		t.ok(matcher(match), `"${msg}" has match for "${match}"`);
	}
	for (const match of notMatches) {
		t.notOk(matcher(match), `"${msg}" does not match "${match}"`);
	}
}

test('3PM: Ryzen', t => {
	t.equal(threepm({
		name: 'Ryzen 7 1800X',
	}), 'R7-1800X');
	t.equal(threepm({
		brand: 'amd',
		type: 'cpu',
		name: 'Ryzen 5 1600',
	}), 'R5-1600');

	t.end();
});

test('3PM: Threadripper', t => {
	t.equal(threepm({
		name: 'Ryzen TR 1950X',
	}), '1950X');
	t.equal(threepm({
		brand: 'amd',
		type: 'cpu',
		name: 'Ryzen TR 1950X',
	}), '1950X');

	t.end();
});

test('3PM: FX', t => {
	t.equal(threepm({
		brand: 'amd',
		type: 'cpu',
		name: 'FX-6300',
	}), 'FX-6300');

	t.end();
})

test('3PM: Phenom & Athlon', t => {
	confirmMatches({
		brand: 'amd',
		type: 'cpu',
		name: 'Athlon X4 800',
	}, [ 'X4-800', 'X4-800BE'], [], t, 'Athlon X4 800');

	confirmMatches({
		name: 'Phenom II X9 B1025T',
	}, [ 'B1025T', 'B1025TBE' ], [], t, 'Phenom II X9 B1025T');

	t.end();
});

test('3PM: Simple Intel', t => {
	t.equal(threepm({
		name: 'Core i7-4700K',
	}), 'Core-i7-4700K');
	t.equal(threepm({
		name: 'Pentium G3258',
	}), 'Pentium-G3258');
	t.equal(threepm({
		brand: 'intel',
		type: 'cpu',
		name: 'Core i7-4700K',
	}), 'Core-i7-4700K');

	t.end();
});

test('3PM: Userbenchmark Untagged Intel', t => {
	t.equal(threepm({
		name: 'T6500',
		source: 'userbenchmark',
	}), 'Core-T6500');
	t.equal(threepm({
		brand: 'intel',
		type: 'cpu',
		source: 'userbenchmark',
		name: 'V6600',
	}), 'Core-V6600');

	t.end();
});

test('3PM: RX GPUs', t => {
	confirmMatches({
		name: 'RX 580',
	}, [
		'RX-580', 'RX-580-4GiB', 'RX-580-8GiB'
	], [], t, 'RX 580');
	t.equal(threepm({
		brand: 'amd',
		type: 'gpu',
		name: 'RX 580 4GB',
	}), 'RX-580-4GiB');

	t.end();
});

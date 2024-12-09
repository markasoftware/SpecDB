const test = require('tape');
const combineUtil = require('../build/combine-util');

const threepm = combineUtil.thirdPartyNameToMatcher;
const confirmMatches = (hints, matches, notMatches, t, msg) => {
	const rawMatcher = threepm(hints);
	const matcher = typeof rawMatcher === 'function' ? rawMatcher : c => c === rawMatcher;
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
	}), 'Ryzen-7-1800X');
	t.equal(threepm({
		brand: 'amd',
		type: 'cpu',
		name: 'Ryzen 5 1600',
	}), 'Ryzen-5-1600');

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
		name: 'Intel Core i7-4770K Processor',
	}), 'Core-i7-4770K');
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

// test('3PM: RX GPUs', t => {
// 	confirmMatches({
// 		name: 'RX 580',
// 	}, [
// 		'RX-580', 'RX-580-4GiB', 'RX-580-8GiB'
// 	], [], t, 'RX 580');
// 	confirmMatches({
// 		name: 'R9 390',
// 	}, [ 'R9-390' ], [ 'R9-390X' ], t, 'R9 390 (but not X)');
// 	t.equal(threepm({
// 		brand: 'amd',
// 		type: 'gpu',
// 		name: 'RX 580 4GB',
// 	}), 'RX-580-4GiB');

// 	t.end();
// });

// test('3PM: HD GPUs', t => {
// 	confirmMatches({
// 		name: 'HD 7780',
// 	}, [ 'HD-7780' ], [ 'HD-7790' ], t, 'HD 7780');
// 	confirmMatches({
// 		name: 'HD 4560',
// 	}, [ 'HD-4560', 'HD-4560-DDR2', 'HD-4560-DDR3'], ['HD-4560-X2', 'HD-4570-EyeFinity'], t, 'HD 4560 matching against variants');
// 	confirmMatches({
// 		name: 'HD 4560 (X2)',
// 	}, [ 'HD-4560-X2'], [ 'HD-4560', 'HD-4560-DDR3'], t, 'HD 4560 (X2)');

// 	t.end();
// });

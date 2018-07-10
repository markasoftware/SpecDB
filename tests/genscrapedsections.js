const test = require('tape');
const util = require('../build/util.js');

const fixture = {
	i5_8500: {
		series: 'core',
		market: 'desktop',
		speed: 'fast',
		cores: 4,
	},
	i3_4130: {
		series: 'core',
		market: 'desktop',
		speed: 'medium',
		cores: 2,
	},
	g3258: {
		series: 'pentium',
		market: 'desktop',
		speed: 'slow',
		cores: 2,
	},
};

test('build: genDeepTree', t => {
	const gdt = util.genDeepTree;

	t.deepEqual(gdt(fixture, [ c => c.series ]), {
		core: { i5_8500: fixture.i5_8500, i3_4130: fixture.i3_4130 },
		pentium: { g3258: fixture.g3258 },
	}, 'one-level');

	t.deepEqual(gdt(fixture, [ c => c.series, c => c.speed ]), {
		core: { fast: { i5_8500: fixture.i5_8500 }, medium: { i3_4130: fixture.i3_4130 } },
		pentium: { slow: { g3258: fixture.g3258 } },
	}, 'two-level');

	t.end();
});

test('build: genSections', t => {
	// there are many options for this one, and writing teh tests is tedius
	// perhaps that means I should modularize more, or be less lazy and just
	// write out the tests.
	const gs = util.genSections;

	const basicOpts = [{
		toName: c => c.market,
		toHeader: c => c.speed,
		base: c => ({
			topHeader: 'SELECT CPU:',
			type: 'CPU Architecture',
			data: { meow: c[0].market },
		}),
	}];
	const basicOutput = util.keyByName([
		{
			name: 'desktop',
			humanName: 'desktop',
			topHeader: 'SELECT CPU:',
			type: 'CPU Architecture',
			data: { meow: 'desktop' },
			sections: [
				{ header: 'slow', members: [ 'g3258' ] },
				{ header: 'medium', members: [ 'i3_4130' ] },
				{ header: 'fast', members: [ 'i5_8500' ] },
			],
		},
	]);
	t.deepEqual(gs(fixture, basicOpts), basicOutput, 'basic');
	
	const advOpts = [{
		toName: c => 'meow wolf',
		toHeader: c => c.data.cats,
		headerSorter: (a, b) => a > b,
		memberSorter: (a, b) => a.humanName > b.humanName,
		base: c => ({
			topHeader: 'SELECT GENDER:',
			type: 'CPU Architecture',
		}),
	}, {
		toName: c => c.speed,
		toHeader: c => 'yais',
		base: c => ({
			topHeader: 'SELECT: :TCELES',
			data: { cats: c[0].cores },
		}),
	}];
	const advOutput = util.keyByName([
		{
			name: 'meow-wolf',
			humanName: 'meow wolf',
			topHeader: 'SELECT GENDER:',
			type: 'CPU Architecture',
			sections: [{
				header: '2',
				members: [ 'medium', 'slow' ],
			}, {
				header: '4',
				members: [ 'fast' ],
			}],
		},
		{
			name: 'fast',
			humanName: 'fast',
			topHeader: 'SELECT: :TCELES',
			data: { cats: 4 },
			sections: [{
				header: 'yais',
				members: [ 'i5_8500' ],
			}],
		},
		{
			name: 'medium',
			humanName: 'medium',
			topHeader: 'SELECT: :TCELES',
			data: { cats: 2 },
			sections: [{
				header: 'yais',
				members: [ 'i3_4130' ],
			}],
		},
		{
			name: 'slow',
			humanName: 'slow',
			topHeader: 'SELECT: :TCELES',
			data: { cats: 2 },
			sections: [{
				header: 'yais',
				members: [ 'g3258' ],
			}],
		},
	]);
	t.deepEqual(gs(fixture, advOpts), advOutput, 'advanced');

	const throwOpts = [{
		toName: c => c.market,
		toHeader: c => c.market,
		base: c => ({}),
	}, {
		toName: c => c.market,
		toHeader: c => c.market,
		base: c => ({}),
	}];
	t.throws(() => gs(fixture, throwOpts), /desktop/, 'error on conflicting names');

	t.end()
});

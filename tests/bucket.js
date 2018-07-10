const test = require('tape');
const bucket = require('../build/util').bucket;

test('bucket', t => {
	const bucket5 = bucket(5);
	t.equal(bucket5(2017), '2015-2019', 'basic');
	t.equal(bucket5(-4), '-5--1', 'negative');

	const bucket1 = bucket(1);
	t.equal(bucket1(2011), '2011-2011', 'mod 1');

	const bucketSlash = bucket(5, { separator: '/' });
	t.equal(bucketSlash(2017), '2015/2019', 'custom separator');

	const bucketClamped = bucket(5, { min: 252, max: 738 });
	t.equal(bucketClamped(500), '500-504', 'clamp has no effect in middle of range');
	t.equal(bucketClamped(253), '252-254', 'min clamp');
	t.equal(bucketClamped(737), '735-738', 'max clamp');

	const bucketCustomClamped = bucket(5, { max: 738, maxText: 'Present' });
	t.equal(bucketCustomClamped(737), '735-Present', 'custom clamp text');

	const bucketRanges = bucket(5, { ranges: [ [ 0, 17 ], [2011, 2012 ] ] } );
	t.equal(bucketRanges(4), '0-17', 'inside of a large range');
	t.equal(bucketRanges(2011), '2011-2012', 'inside of a small range');
	t.equal(bucketRanges(2010), '2010-2010', 'bottom edge of a range');
	t.equal(bucketRanges(18), '18-19', 'top edge of a range');

	const bucketOffset = bucket(5, { offset: 2 });
	t.equal(bucketOffset(2018), '2017-2021', 'offset');

	// TODO: tests for weird combinations of options (ranges + min/max, for example)
	t.end();
});

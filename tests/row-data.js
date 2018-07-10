const test = require('tape');
const rowData = require('../src/js/row-data.js');

test('bool', t => {
	const subject = rowData.types.boolTrue;

	// this is a bit stupid
	t.equal(subject.default, false, 'default');
	t.equal(subject.compare(true, false), true, 'compare true');
	t.equal(subject.compare(false, true), false, 'compare false');
	t.equal(subject.postprocess(true), 'Yes', 'postprocess true');
	t.equal(subject.postprocess(false), 'No', 'postprocess false');
	// nothing uses boolFalse currently, and it's pretty fucking basic, so we won't test it
	t.end();
});
test('number', t => {
	const subject = rowData.types.numberUp;

	// we won't test preprocess because it's literally just parseFloat currently
	// I hope that all major JS engines have well tested standard libraries
	t.equal(subject.compare(5, 4), true, 'compare true 1');
	t.equal(subject.compare(-5, NaN), true, 'compare true 2');
	t.equal(subject.compare(0, 1), false, 'compare false 1');
	t.equal(subject.compare(NaN, 0), false, 'compare false 2');
	t.end();
});
test('units', t => {
	const subject = rowData.types.unitUp;

	// we won't be testing all units because that's tedious and is basically just mirroring
	t.equal(subject.preprocess('2.4 GHz'), 2400000000, '2.4 GHz');
	t.equal(subject.preprocess('1 MiB'), 1024 * 1024, '1 MiB');
	// compare is just number*Compare, which is already tested in `number`
	t.end();
});
test('version', t => {
	const subject = rowData.types.versionUp;

	t.equal(subject.default, '0', 'default');

	t.equal(subject.postprocess('1.2.3'), '1.2.3', 'postprocess 1.2.3 -> 1.2.3');
	t.equal(subject.postprocess('0'), 'No', 'postprocess 0 -> No')

	t.equal(subject.compare('1.2', '1.1'), true, 'basic short');
	t.equal(subject.compare('62.18.63.2', '63'), false, 'length difference');
	t.equal(subject.compare('1.1', '1'), true, 'length difference, same otherwise');
	t.equal(subject.compare('1.2.3.4.5', '1.2.3.4.6'), false, 'long, only last digit matters');
	t.equal(subject.compare('19.9', '119'), false, 'weird regression test thing');
	t.end();
});
test('enum', t => {
	const subject = rowData.types.enum;

	t.equal(subject(['boop']).default, 'boop', 'default with only one item');
	t.equal(subject(['foop', 'bloop']).default, 'bloop', 'default with multiple items');

	t.equal(subject(['good', 'not good', 'even worse']).compare('not good', 'good'), false, 'comparison false');
	t.equal(subject(['good', 'not good', 'even worse']).compare('good', 'even worse'), true, 'comparison true');
	t.equal(subject(['good', 'not good', 'even worse'], { allowPartialMatch: true })
		.compare('pretty good', 'even worse'), true, 'partial match');
	t.equal(subject(['good', 'not good', 'even worse'], { allowPartialMatch: true })
		.compare('even worse', 'pretty good'), false, 'partial match, reverse');

	t.end();
});
test('list', t => {
	const subject = rowData.types.list;

	t.deepEqual(subject.preprocess(['hi', 'world']), ['hi', 'world'], 'array stays as array');
	t.deepEqual(subject.preprocess('hi world'), ['hi world'], 'puts single item into array');

	t.end();
});

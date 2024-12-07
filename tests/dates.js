const test = require('tape');
const dates = require('../src/js/dates');

test('date', t => {
	t.deepEqual(dates.parse('2001-02-27'), new Date('2001-02-27'), 'parse yyyy-mm-dd');
	t.deepEqual(dates.parse('2001-02'), new Date('2001-02-01'), 'parse yyyy-mm');
	t.deepEqual(dates.parse('2001'), new Date(2001, 0), 'parse yyyy');
	t.deepEqual(dates.parse('Q2 2001'), new Date(2001, 3), 'parse Q');
	t.deepEqual(dates.parse('H2 2001'), new Date(2001, 6), 'parse H');

	t.equal(dates.longify('2001-02-27'), 'February 27, 2001', 'longify yyyy-mm-dd');
	t.equal(dates.longify('2001-02'), 'February 2001', 'longify yyyy-mm');
	t.equal(dates.longify('2001'), '2001', 'longify yyyy');
	t.equal(dates.longify('Q2 2001'), 'Quarter 2, 2001', 'longify Q');
	t.equal(dates.longify('H2 2001'), 'Half 2, 2001', 'longify H');

	t.end();
});

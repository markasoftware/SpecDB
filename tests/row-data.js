const test = require('tape');
const rowData = require('../src/js/row-data.js');

test('bool', t => {
    const subject = rowData.Unlocked;

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
    const subject = rowData['Thread Count'];

    // we won't test preprocess because it's literally just parseFloat currently
    // I hope that all major JS engines have well tested standard libraries
    t.equal(subject.compare(5, 4), true, 'compare true 1');
    t.equal(subject.compare(-5, NaN), true, 'compare true 2');
    t.equal(subject.compare(0, 1), false, 'compare false 1');
    t.equal(subject.compare(NaN, 0), false, 'compare false 2');
    t.end();
});
test('units', t => {
    const subject = rowData['VRAM Capacity'];

    // we won't be testing all units because that's tedious and is basically just mirroring
    t.equal(subject.preprocess('2.4 GHz'), 2400000000, '2.4 GHz');
    t.equal(subject.preprocess('1 MiB'), 1024 * 1024, '1 MiB');
    // compare is just number*Compare, which is already tested in `number`
    t.end();
});
test('version', t => {
    const subject = rowData['DirectX Support'];

    t.equal(subject.default, '0.0');

    t.equal(subject.compare('1.2', '1.1'), true, 'basic short');
    t.equal(subject.compare('62.18.63.2', '63'), false, 'length difference');
    t.equal(subject.compare('1.1', '1'), true, 'length difference, same otherwise');
    t.equal(subject.compare('1.2.3.4.5', '1.2.3.4.6'), false, 'long, only last digit matters');
    t.equal(subject.compare('19.9', '119'), false, 'weird regression test thing');
    t.end();
});
test('date', t => {
    const subject = rowData['Release Date'];

    t.deepEqual(subject.preprocess('2001-02-27'), new Date('2001-02-27'), 'preprocess yyyy-mm-dd');
    t.deepEqual(subject.preprocess('2001-02'), new Date('2001-02-01'), 'preprocess yyyy-mm');
    t.deepEqual(subject.preprocess('2001'), new Date('2001-01-01'), 'preprocess yyyy');
    t.deepEqual(subject.preprocess('Q2 2001'), new Date('2001-04-01'), 'preprocess Q');
    t.deepEqual(subject.preprocess('H2 2001'), new Date('2001-07-01'), 'preprocess H');

    t.equal(subject.postprocess('2001-02-27'), 'February 27, 2001', 'basic postprocess');
    t.end();
});
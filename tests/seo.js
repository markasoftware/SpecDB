const test = require('tape');
const pure = require('../src/js/pure.js');

test('canonical', t => {
    t.notOk(pure.seo([]).canonical, 'empty list');
    t.notOk(pure.seo(['Hello']).canonical, 'single element');
    t.notOk(pure.seo(['a', 'b', 'c']).canonical, 'already sorted');
    t.equal(pure.seo(['c', 'a', 'b']).canonical, 'https://specdb.info/#!/a,b,c', 'not sorted');
    t.end();
});

test('title', t => {
    t.equal(pure.seo([]).title, 'View and Compare Graphics Cards and CPUs — SpecDB', 'empty list');
    t.equal(pure.seo(['i7 7700k']).title, 'i7 7700k Specs and Comparison — SpecDB', 'single element');
    t.equal(pure.seo(['i7 7700k', 'R7 1800X']).title, 'i7 7700k vs R7 1800X — SpecDB', 'two elements');
    t.equal(pure.seo(['i7 7700k', 'R7 1800X', 'FX 6300']).title, 'Compare the i7 7700k, R7 1800X, and FX 6300 — SpecDB', 'many elements');
    t.end();
});

test('description', t => {
    t.equal(pure.seo([]).description, 'A modern, fast, and beautiful spec viewing and comparison platform for PC hardware.', 'empty list');
    t.equal(pure.seo(['i7 7700k']).description, 'View the specs of the i7 7700k and compare it to other similar parts on SpecDB.', 'one element');
    t.equal(pure.seo(['i7 7700k', 'R7 1800X']).description, 'Compare the specs for the i7 7700k and R7 1800X side-by-side on SpecDB.', 'two elements');
    t.equal(pure.seo(['i7 7700k', 'R7 1800X', 'FX 6300']).description, 'Compare the specs for the i7 7700k, R7 1800X, and FX 6300 side-by-side on SpecDB.');
    t.end();
});

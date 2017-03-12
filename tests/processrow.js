const test = require('tape');
const pure = require('../src/js/pure.js');

test('No data for row', t => {
    t.deepEqual(
        pure.processRow(['3.4', 'cat'], undefined),
        {
            values: ['3.4', 'cat'],
            maxIndices: [],
        },
        'all defined'
    );
    t.deepEqual(
        pure.processRow(['3.4', undefined, 'cat'], undefined),
        {
            values: ['3.4', undefined, 'cat'],
            maxIndices: [],
        },
        'undefined in middle'
    );
    t.end();
});

test('Only postprocess', t => {
    t.deepEqual(
        pure.processRow([true, false], {
            postprocess: c => c ? 'Yes' : 'No',
        }),
        {
            values: ['Yes', 'No'],
            maxIndices: [],
        },
        'all defined'
    );
    t.deepEqual(
        pure.processRow([true, false, undefined], {
            postprocess: c => c ? 'Yes' : 'No',
        }),
        {
            values: ['Yes', 'No', undefined],
            maxIndices: [],
        },
        'undefined at end'
    );
    t.end();
});

test('Compare with other stuff', t => {
    const processor = {
        preprocess: c => {
            // this WILL cause an error if c is undefined
            const boop = c.split(' ');
            return boop[0] * boop[1];
        },
        compare: (a, b) => a > b,
    };
    t.deepEqual(pure.processRow(['1 2', '5 1'], processor), {
        values: ['1 2', '5 1'],
        maxIndices: [1],
    }, 'Simple');
    t.deepEqual(pure.processRow(['1 2', '5 1', '5 1'], processor), {
        values: ['1 2', '5 1', '5 1'],
        maxIndices: [1, 2],
    }, 'Duplicate maxes');
    t.deepEqual(pure.processRow(['1 2', '5 1', undefined, '77 23'], processor), {
        values: ['1 2', '5 1', undefined, '77 23'],
        maxIndices: [3],
    }, 'Undefined at index 2');
    t.deepEqual(pure.processRow([undefined, '7 2'], processor), {
        values: [undefined, '7 2'],
        maxIndices: [1],
    }, 'Undefined is first, only 2 total');
    processor.postprocess = c => c.replace(' ', '*');
    t.deepEqual(pure.processRow(['1 2', '5 1'], processor), {
        values: ['1*2', '5*1'],
        maxIndices: [1],
    }, 'with postprocessing');
    t.end();
});

test('defaults', t => {
    t.deepEqual(pure.processRow([-2, undefined], { default: 6 }), {
        values: [-2, 6],
        maxIndices: [],
    }, 'basic');
    t.deepEqual(pure.processRow([undefined, 4], {
        default: 6,
        compare: (a, b) => a > b,
    }), {
        values: [6, 4],
        maxIndices: [0],
    }, 'and compare');
    t.end();
});
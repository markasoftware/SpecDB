const test = require('tape');
const pure = require('../src/js/pure.js');

const testOpts = {
    // deeper string representations when deepEqual fails
    objectPrintDepth: 10,
};

const opts = { showIdenticalRows: true, showUncomparableRows: true };

const sections = [
    {
        name: 'Basic Specs',
        display: true,
        rows: [
            {
                name: 'Base Frequency',
                processor: {
                    preprocess: parseFloat,
                    compare: (a, b) => a > b,
                },
            },
            {
                name: 'Dankness',
            },
            {
                name: 'Foop',
                processor: {
                    preprocess: parseFloat,
                    compare: (a, b) => a > b,
                    postprocess: c => c.toUpperCase(),
                    default: '15 mhz',
                },
            },
            {
                name: 'Release Date',
                processor: {
                    preprocess: c => new Date(c),
                    compare: (a, b) => true,
                }
            }
        ],
    },
    // just to have multiple sections
    {
        name: 'Advanced Specs',
        display: false,
        rows: [
            {
                name: 'Boost Frequency',
                processor: {
                    preprocess: parseFloat,
                    compare: (a, b) => a > b,
                },
            },
        ],
    },
];

const emptyAdvanced = { name: 'Advanced Specs', rows: [] };

test('Single Part', testOpts, t => {
    t.deepEqual(
        pure.getTableData([
            { data: {
                'Dankness': '2',
            }},
        ], sections, opts),
        [
            {
                name: 'Basic Specs',
                rows: [
                    {
                        name: 'Dankness',
                        cells: [
                            {
                                value: '2',
                                winner: false,
                            }
                        ]
                    }
                ]
            }, emptyAdvanced,
        ], 'Super-simple, one property');
    t.deepEqual(
        pure.getTableData([
            { data: {
                'Foop': 'hi',
            }},
        ], sections, opts),
        [{
            name: 'Basic Specs',
            rows: [{
                name: 'Foop',
                cells: [{
                    value: 'HI',
                    winner: false,
                }]
            }]
        }, emptyAdvanced,
        ], 'postprocess');
    t.deepEqual(
        pure.getTableData([
            { data: {
                'Dankness': '55',
                'Foop': 'MAX',
                'Boost Frequency': '3 GHz',
            }},
        ], sections, opts),
        [{
            name: 'Basic Specs',
            rows: [{
                name: 'Dankness',
                cells: [{
                    value: '55',
                    winner: false,
                }],
            }, {
                name: 'Foop',
                cells: [{
                    value: 'MAX',
                    winner: false,
                }],
            }],
        }, {
            name: 'Advanced Specs',
            rows: [{
                name: 'Boost Frequency',
                cells: [{
                    value: '3 GHz',
                    winner: false,
                }],
            }],
        }], 'multiple rows and sections');
    t.end();
});

test('basic multiple parts', testOpts, t => {
    t.deepEqual(pure.getTableData([
        { data: {
            'Dankness': '123',
        }},
        { data: {
            'Dankness': 'hi',
        }}
    ], sections, opts),
    [{
        name: 'Basic Specs',
        rows: [{
            name: 'Dankness',
            cells: [{
                value: '123',
                winner: false,
            }, {
                value: 'hi',
                winner: false,
            }],
        }],
    }, emptyAdvanced], 'no compare, same row, only one row');

    t.deepEqual(pure.getTableData([
        { data: {
            'Foop': '100',
        }},
        { data: {}},
    ], sections, opts), [{
        name: 'Basic Specs',
        rows: [{
            name: 'Foop',
            cells: [{
                value: '100',
                winner: true,
            }, {
                value: '15 MHZ',
                winner: false,
            }],
        }],
    }, emptyAdvanced], 'check default, postprocess of default, includes row even when only one part has it, compare i guess?');

    t.deepEqual(pure.getTableData([
        { data: {
            'Dankness': 'AUTOBAHN THE AUTOBAHN',
        }},
        { data: {}},
    ], sections, opts), [{
        name: 'Basic Specs',
        rows: [{
            name: 'Dankness',
            cells: [{
                value: 'AUTOBAHN THE AUTOBAHN',
                winner: false,
            }, {
                value: '',
                winner: false,
            }],
        }],
    }, emptyAdvanced], 'one is empty, no default');

    t.end();
});

test('Winners', testOpts, t => {
    t.deepEqual(pure.getTableData([
        { data: {
            'Base Frequency': '1.0 GHz',
        }},
        { data: {
            'Base Frequency': '1.1 GHz',
        }},
    ], sections, opts), [{
        name: 'Basic Specs',
        rows: [{
            name: 'Base Frequency',
            cells: [{
                value: '1.0 GHz',
                winner: false,
            }, {
                value: '1.1 GHz',
                winner: true,
            }],
        }],
    }, emptyAdvanced], 'Basic winners, one row');

    t.deepEqual(pure.getTableData([
        { data: {
            'Base Frequency': '1.7 GHz',
        }},
        { data: {
            'Base Frequency': '1.7 GHz',
        }},
    ], sections, opts), [{
        name: 'Basic Specs',
        rows: [{
            name: 'Base Frequency',
            cells: [{
                value: '1.7 GHz',
                winner: false,
            }, {
                value: '1.7 GHz',
                winner: false,
            }],
        }],
    }, emptyAdvanced], 'All equal, one row');

    t.deepEqual(pure.getTableData([
        { data: {
            'Base Frequency': '1.0 GHz',
        }},
        { data: {
            'Base Frequency': '1.1 GHz',
        }},
        { data: {
            'Base Frequency': '1.1 GHz',
        }},
    ], sections, opts), [{
        name: 'Basic Specs',
        rows: [{
            name: 'Base Frequency',
            cells: [{
                value: '1.0 GHz',
                winner: false,
            }, {
                value: '1.1 GHz',
                winner: true,
            }, {
                value: '1.1 GHz',
                winner: true,
            }],
        }],
    }, emptyAdvanced], 'Multiple winners, one row');

    t.deepEqual(pure.getTableData([
        // before parsing, '100' is less than '99' (9 ascii is higher than 1 ascii)
        { data: {
            'Foop': '100',
        }},
        { data: {
            'Foop': '99',
        }},
    ], sections, opts), [{
        name: 'Basic Specs',
        rows: [{
            name: 'Foop',
            cells: [{
                value: '100',
                winner: true,
            }, {
                value: '99',
                winner: false,
            }],
        }],
    }, emptyAdvanced], 'Preprocessing before comparison');

    t.deepEqual(pure.getTableData([
        { data: {
            'Release Date': '2017-01-01',
        }},
        { data: {
            'Release Date': '2017-01-01',
        }},
    ], sections, opts), [{
        name: 'Basic Specs',
        rows: [{
            name: 'Release Date',
            cells: [{
                value: '2017-01-01',
                winner: false,
            }, {
                value: '2017-01-01',
                winner: false,
            }],
        }],
    }, emptyAdvanced], 'Understands equality for non-primitives (dates)');

    t.end();
});

test('Show Identical Rows', testOpts, t => {

    const identicalOpts = { showIdenticalRows: false, showUncomparableRows: true };
    t.deepEqual(pure.getTableData([
        { data: {
            'Dankness': 14,
            'Foop': 'hello world',
        }},
        { data: {
            'Dankness': 15,
            'Foop': 'hi world',
        }},
    ], sections, identicalOpts), [{
        name: 'Basic Specs',
        rows: [{
            name: 'Dankness',
            cells: [{
                value: 14,
                winner: false,
            }, {
                value: 15,
                winner: false,
            }],
        }, {
            name: 'Foop',
            cells: [{
                value: 'HELLO WORLD',
                winner: false,
            }, {
                value: 'HI WORLD',
                winner: false,
            }],
        }],
    }, emptyAdvanced], 'Rows are different, should not be hidden');

    t.deepEqual(pure.getTableData([
        { data: {
            'Dankness': 42,
        }},
    ], sections, identicalOpts), [{
        name: 'Basic Specs',
        rows: [{
            name: 'Dankness',
            cells: [{
                value: 42,
                winner: false,
            }],
        }],
    }, emptyAdvanced], 'only one part, should not remove rows');

    t.deepEqual(pure.getTableData([
        { data: {
            'Dankness': 15,
        }},
        { data: {
            'Dankness': 15,
        }},
    ], sections, identicalOpts), [{
        name: 'Basic Specs',
        rows: [],
    }, emptyAdvanced], 'Rows are simple and the same, should be removed');

    t.deepEqual(pure.getTableData([
        { data: {
            'Dankness': 42,
            'Foop': 'l0l',
        }},
        { data: {
            'Dankness': 1337,
            'Foop': 'l0l',
        }},
    ], sections, identicalOpts), [{
        name: 'Basic Specs',
        rows: [{
            name: 'Dankness',
            cells: [{
                value: 42,
                winner: false,
            }, {
                value: 1337,
                winner: false,
            }],
        }],
    }, emptyAdvanced], 'One row is identical, other is not');

    t.end();
});

test('Show Uncomparable Rows', testOpts, t => {

    const uncomparableOpts = { showIdenticalRows: true, showUncomparableRows: false };

    t.deepEqual(pure.getTableData([
        { data: {
            'Dankness': 13,
        }},
        { data: {
            'Dankness': 77,
        }},
    ], sections, uncomparableOpts), [{
        name: 'Basic Specs',
        rows: [{
            name: 'Dankness',
            cells: [{
                value: 13,
                winner: false,
            }, {
                value: 77,
                winner: false,
            }],
        }],
    }, emptyAdvanced], 'showUncomparable is false, but no uncomparable rows');

    t.deepEqual(pure.getTableData([
        { data: {
            'Foop': '0hHh',
            'Dankness': 24,
        }},
        { data: {
            'Foop': '1HhH',
        }},
    ], sections, uncomparableOpts), [{
        name: 'Basic Specs',
        rows: [{
            name: 'Foop',
            cells: [{
                value: '0HHH',
                winner: false,
            }, {
                value: '1HHH',
                winner: true,
            }],
        }],
    }, emptyAdvanced], 'One row is uncomparable, other is comparable');
    t.end();
});
const test = require('tape');
const pure = require('../src/js/pure.js');

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
                processor: {},
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

test('Simple', t => {
    const pureRes = pure.getTableData([
        { data: {
            'Base Frequency': '2.4 GHz',
        }},
    ], sections);
    t.deepEqual(pureRes, [
            {
                name: 'Basic Specs',
                rows: [
                    {
                        name: 'Base Frequency',
                        cells: [
                            {
                                value: '2.4 GHz',
                                winner: false,
                            }
                        ]
                    }
                ]
            }, { name: 'Advanced Specs', rows: [] },
        ], 'basic, single part');
        t.end();
});
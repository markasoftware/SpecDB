const test = require('tape');
const pure = require('../src/js/pure.js');

test('unsupported data type should be empty', t => {
    t.deepEqual(pure.genSubtext({}), [], 'empty object');
    t.deepEqual(pure.genSubtext({ subTextType: 'hehe hoho pepe' }), [], 'unsupported subTextType');
    t.end();
});

test('architecture', t => {
    t.deepEqual(pure.genSubtext({
        subtextType: 'architecture',
        data: {
            Lithography: '32 nm',
            'Release Date': '2017-05-11',
            Sockets: ['AM3+'],
        },
    }), [
        '32nm Lithography',
        'Released 2017-05-11',
        'AM3+ Socket',
    ], 'single socket');
    t.deepEqual(pure.genSubtext({
        subtextType: 'architecture',
        data: {
            Lithography: '14 nm',
            'Release Date': '2001-10-01',
            Sockets: ['AM4', 'AM5'],
        }
    }), [
        '14nm Lithography',
        'Released 2001-10-01',
        'AM4, AM5 Sockets',
    ], 'multiple sockets');
    t.end();
});

test('cpu', t => {
    t.deepEqual(pure.genSubtext({
        subtextType: 'cpu',
        'Base Frequency': '3.2 GHz',
        'Boost Frequency': '3.9 GHz',
        'Core Count': 2,
        'Thread Count': 4,
        TDP: '110 W',
    }), [
        '2 Cores, 4 Threads',
        '3.2GHz Base, 3.9GHz Boost',
        '110W TDP',
    ]);
    t.deepEqual(pure.genSubtext({
        subtextType: 'cpu',
        'Core Count': 8,
        'Thread Count': 8,
        'Base Frequency': '3.5 GHz',
        'Boost Frequency': '3.5 GHz',
        TDP: '5 W',
    }), [
        '8 Cores, 8 Threads',
        '3.5GHz Base, 3.5GHz Boost',
        '5W TDP',
    ]);
    t.end();
});
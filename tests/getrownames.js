const test = require('tape');
const pure = require('../src/js/pure.js');

test('some CPU data', t => {
     t.deepEqual(pure.getRowNames([
         {
             type: 'CPU',
             data: {
                 'Base Frequency': '4.5 GHz',
                 'Boost Frequency': '4.6 GHz',
             },
         },
     ], true), ['Base Frequency', 'Boost Frequency'], 'single part, very simple');
     t.deepEqual(pure.getRowNames([
         {
             type: 'CPU',
             data: {
                 'Base Frequency': '2.9 GHz',
             },
         },
         {
             data: {
                 'Boost Frequency': '99 GHz',
             },
         },
     ], true), ['Base Frequency', 'Boost Frequency'], 'two parts, pretty simple');
     t.deepEqual(pure.getRowNames([
         {
             type: 'CPU',
             data: {
                 'Base Frequency': '66 GHz',
                 'Boost Frequency': '4 GHz',
             },
         },
         {
             data: {
                 'Base Frequency': '3 GHz',
                 'Boost Frequency': '7 GHz',
             },
         },
     ], true), ['Base Frequency', 'Boost Frequency'], 'two parts, both have same names');
     t.deepEqual(pure.getRowNames([
         {
             type: 'CPU',
             data: {
                 'Thread Count': 9,
                 TDP: '98 W',
                 'Core Count': 4,
                 Boop: 8,
             },
         },
         {
             type: 'CPU',
             data: {
                 TDP: '9 W',
                 'Base Frequency': '8 GHz',
             },
         },
     ], true), ['Base Frequency', 'Core Count', 'Thread Count', 'TDP', 'Boop'], 'more complex');
     t.end();
});

test('unknown name should go last', t => {
    t.deepEqual(pure.getRowNames([
        {
            type: 'CPU',
            data: {
                'Base Frequency': '888 GHz',
                'ur mom haha': '1 bamboozle',
            },
        },
    ], true), ['Base Frequency', 'ur mom haha']);
    t.end();
});

test('hide advanced data', t => {
    t.deepEqual(pure.getRowNames([
        {
            type: 'CPU',
            data: {
                // and we're testing that it works with mhz for good measure. Me so clever!
                'Base Frequency': '888 MHz',
            },
        },
    ], false), ['Base Frequency'], 'common basic');
    t.deepEqual(pure.getRowNames([
        {
            type: 'CPU',
            data: {
                'Base Frequency': '9 GHz',
                'Holy Moly Guacamole': 'Claim your free WinRAR license at pornhub.com!'
            },
        },
    ], false), ['Base Frequency'], 'should discard one');
    t.deepEqual(pure.getRowNames([
        {
            type: 'CPU',
            data: {
                'Base Frequency': '1 GHz',
                // seems logical, right?
                'Core Count': '19',
            },
        },
    ], false), ['Base Frequency', 'Core Count'], 'CPU-specific one');
    t.end();
});

const test = require('tape');
const pure = require('../src/js/pure.js');

test('empty array', t => {
    t.deepEqual(pure.getRowNames([]), []);
    t.end();
});

test('some CPU data', t => {
     t.deepEqual(pure.getRowNames([
         {
             data: {
                 'Base Frequency': '4.5 GHz',
                 'Boost Frequency': '4.6 GHz',
             },
         },
     ]), ['Base Frequency', 'Boost Frequency'], 'single part, very simple');
     t.deepEqual(pure.getRowNames([
         {
             data: {
                 'Base Frequency': '2.9 GHz',
             },
         },
         {
             data: {
                 'Boost Frequency': '99 GHz',
             },
         },
     ]), ['Base Frequency', 'Boost Frequency'], 'two parts, pretty simple');
     t.deepEqual(pure.getRowNames([
         {
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
     ]), ['Base Frequency', 'Boost Frequency'], 'two parts, both have same names');
     t.deepEqual(pure.getRowNames([
         {
             data: {
                 'Thread Count': 9,
                 TDP: '98 W',
                 'Core Count': 4,
                 Boop: 8,
             },
         },
         {
             data: {
                 TDP: '9 W',
                 'Base Frequency': '8 GHz',
             },
         },
     ]), ['Base Frequency', 'Core Count', 'Thread Count', 'TDP', 'Boop'], 'more complex');
     t.end();
});

test('unknown name should go last', t => {
    t.deepEqual(pure.getRowNames([
        {
            data: {
                'Base Frequency': '888 GHz',
                'ur mom haha': '1 bamboozle',
            },
        },
    ]), ['Base Frequency', 'ur mom haha']);
    t.end();
});

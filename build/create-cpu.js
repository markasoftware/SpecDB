require('./create-spec.js')({
    type: 'CPU',
    data: {},
}, [
    'name',
    'humanName',
], [
    'Thread Count',
    'Core Count',
    'Base Frequency',
    'Boost Frequency',
    'L2 Cache (Total)',
    'L3 Cache (Total)',
    'TDP',
    'Release Date',
]);

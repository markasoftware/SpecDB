require('./create-spec.js')({
    isPart: true,
    type: 'Graphics Card',
    data: {},
}, [
    'name',
    'humanName',
], [
    'GPU',
    'Release Date',
    'Die Size',
    'Shader Processor Count',
    'Texture Mapping Unit Count',
    'Render Output Unit Count',
    'Base Frequency',
    'Boost Frequency',
    'VRAM Frequency',
    'VRAM Capacity',
    'VRAM Bus Width',
    'VRAM Type',
    'VRAM Bandwidth',
    'TDP',
]);
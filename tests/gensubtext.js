const test = require('tape');
const pure = require('../src/js/pure.js');

test('unsupported data type should be empty', t => {
    t.deepEqual(pure.genSubtext({}), [], 'empty object');
    t.deepEqual(pure.genSubtext({ subTextType: 'hehe hoho pepe' }), [], 'unsupported subTextType');
    t.end();
});

test('CPU Architecture', t => {
    t.deepEqual(pure.genSubtext({
        type: 'CPU Architecture',
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
        type: 'CPU Architecture',
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

test('Graphics Architecture', t => {
    t.deepEqual(pure.genSubtext({
        type: 'Graphics Architecture',
        data: {
            'Lithography': '14 nm',
            'Release Date': '2026-01-23',
            'DirectX Support': '12.0',
            'Vulkan Support': '1.0',
        }
    }), [
        '14nm Lithography',
        'Released 2026-01-23',
        'Supports DX12 and Vulkan',
    ], 'dx12 & vulkan');
    t.deepEqual(pure.genSubtext({
        type: 'Graphics Architecture',
        data: {
            'Lithography': '14 nm',
            'Release Date': '2026-01-23',
            'DirectX Support': '12.0',
        }
    }), [
        '14nm Lithography',
        'Released 2026-01-23',
        'Supports DX12, no Vulkan',
    ], 'dx12 only');
    t.deepEqual(pure.genSubtext({
        type: 'Graphics Architecture',
        data: {
            'Lithography': '14 nm',
            'Release Date': '2026-01-23',
            'Vulkan Support': '1.0',
        }
    }), [
        '14nm Lithography',
        'Released 2026-01-23',
        'Supports Vulkan, no DX12',
    ], 'vulkan only');
    t.deepEqual(pure.genSubtext({
        type: 'Graphics Architecture',
        data: {
            'Lithography': '14 nm',
            'Release Date': '2026-01-23',
        }
    }), [
        '14nm Lithography',
        'Released 2026-01-23',
        'No DX12 or Vulkan support',
    ], 'neither dx12 nor vulkan');
    t.deepEqual(pure.genSubtext({
        type: 'Graphics Architecture',
        data: {
            'Lithography': '14 nm',
            'Release Date': '2026-01-23',
            'DirectX Support': '11.1',
            'Vulkan Support': '0.5',
        }
    }), [
        '14nm Lithography',
        'Released 2026-01-23',
        'No DX12 or Vulkan support',
    ], 'support, but low version numbers');
    t.end();
});

test('CPU', t => {
    t.deepEqual(pure.genSubtext({
        type: 'CPU',
        data: {
            'Base Frequency': '3.2 GHz',
            'Boost Frequency': '3.9 GHz',
            'Core Count': 2,
            'Thread Count': 4,
            TDP: '110 W',
        },
    }), [
        '2 Cores, 4 Threads',
        '3.2GHz Base, 3.9GHz Boost',
        '110W TDP',
    ]);
    t.deepEqual(pure.genSubtext({
        type: 'CPU',
        data: {
            'Core Count': 8,
            'Thread Count': 8,
            'Base Frequency': '3.5 GHz',
            'Boost Frequency': '3.5 GHz',
            TDP: '5 W',
        },
    }), [
        '8 Cores, 8 Threads',
        '3.5GHz Base, 3.5GHz Boost',
        '5W TDP',
    ]);
    t.end();
});

test('Graphics Card', t => {
    t.deepEqual(pure.genSubtext({
        type: 'Graphics Card',
        data: {
            'VRAM Capacity': '4GiB',
            'Shader Processor Count': 2304,
            'Base Frequency': '1120 MHz',
            'Boost Frequency': '1445 MHz',
        },
    }), [
        '4GiB VRAM',
        '2304 Shader Processors',
        '1120MHz Base, 1445MHz Boost',
    ]);
    t.end();
});

// provide row comparison, post-processing, pre-processing, etc



// these are the "generic" types that some of our rows classify as
// preprocess takes in the cell value, then turns it into something compare can use
// compare should return the "best" out of both parameters
// postprocess takes the original value and turns it into hooman-readable form
// preprocess and postprocess may be omitted
const unitToNum = inStr => {
    const splitUp = inStr.split(' ');
    const units = {
        'KiB': 1024,
        'MiB': 1024 * 1024,
        'GiB': 1024 * 1024 * 1024,
        'KiB/s': 1024,
        'MiB/s': 1024 * 1024,
        'GiB/s': 1024 * 1024 * 1024,
        'Hz': 1,
        'KHz': 1024,
        'MHz': 1024 * 1024,
        'GHz': 1024 * 1024 * 1024,
    }
    return splitUp[0] * units[splitUp[1]];
}

const versionToNum = inStr => inStr.split('.').map(c => parseInt(c)).reduce((a, b, i) => a + b * 0.1 ** i, 0);

const boolPost = c => c ? 'Yes' : 'No';

const numberUpCompare = (a, b) => a > b;
const numberDownCompare = (a, b) => a < b;

const types = {
    numberUp: {
        preprocess: parseFloat,
        compare: numberUpCompare,
    },
    numberDown: {
        preprocess: parseFloat,
        compare: numberDownCompare,
    },
    unitUp: {
        preprocess: unitToNum,
        compare: numberUpCompare,
    },
    boolTrue: {
        // if first is true then everything good
        compare: a => a,
        postprocess: boolPost,
        // may have to remove this later
        default: false,
    },
    boolFalse: {
        compare: a => !a,
        postprocess: boolPost,
        default: true,
    },
    dateUp: {
        preprocess: c => new Date(c),
        compare: numberUpCompare,
        postprocess: c => {
            const d = new Date(c);
            const humanMonth = [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December',
            ][d.getUTCMonth()];
            return `${humanMonth} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
        }
    },
    versionUp: {
        preprocess: versionToNum,
        compare: numberUpCompare,
        default: '0.0',
    }
};

module.exports = {
    // quoting all of these for consistency
    'Core Count': types.numberUp,
    'Module Count': types.numberUp,
    'Thread Count': types.numberUp,
    'Lithography': types.numberDown,
    'TDP': types.numberDown,
    'L2 Cache (Total)': types.unitUp,
    'L3 Cache (Total)': types.unitUp,
    'Base Frequency': types.unitUp,
    'Boost Frequency': types.unitUp,
    'XFR Frequency': types.unitUp,
    'Unlocked': types.boolTrue,
    'XFR Support': types.boolTrue,
    'Release Date': types.dateUp,
    'Die Size': types.numberUp,
    // GPU Stuff
    'Shader Processor Count': types.numberUp,
    'Texture Mapping Unit Count': types.numberUp,
    'Render Output Unit Count': types.numberUp,
    'VRAM Capacity': types.unitUp,
    'VRAM Bandwidth': types.unitUp,
    // TODO: maybe make this have units?
    'VRAM Frequency': types.numberUp,
    'VRAM Bus Width': types.numberUp,
    'DirectX Support': types.versionUp,
    'Vulkan Support': types.versionUp,
};

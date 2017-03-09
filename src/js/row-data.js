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
        'Hz': 1,
        'KHz': 1024,
        'MHz': 1024 * 1024,
        'GHz': 1024 * 1024 * 1024,
    }
    return splitUp[0] * units[splitUp[1]];
}

const boolPost = c => c ? 'Yes' : 'No';

const baseRowTypes = {
    numberUp: {
        preprocess: parseFloat,
        compare: Math.max,
    },
    numberDown: {
        preprocess: parseFloat,
        compare: Math.min,
    },
    unitUp: {
        preprocess: unitToNum,
        compare: Math.max,
    },
    boolTrue: {
        compare: (a, b) => a || b,
        postprocess: boolPost,
    },
    boolFalse: {
        compare: (a, b) => a && b,
        postprocess: boolPost,
    },
};

module.exports = {
    // quoting all of these for consistency
    'Core Count': numberUp,
    'Module Count': numberUp,
    'Thread Count': numberUp,
    'Lithography': numberDown,
    'TDP': numberDown,
    'L2 Cache (Total)': unitUp,
    'L3 Cache (Total)': unitUp,
    'Base Frequency': unitUp,
    'Boost Frequency': unitUp,
    'Unlocked': boolTrue,
};

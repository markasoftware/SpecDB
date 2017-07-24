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
        'KHz': 1000,
        'MHz': 1000 * 1000,
        'GHz': 1000 * 1000 * 1000,
    }
    return splitUp[0] * units[splitUp[1]];
}

const versionCompare = (a, b) => {
    const aSplit = a.split('.').map(Number);
    const bSplit = b.split('.').map(Number);
    // if any part of b is lower than a, a is greater, otherwise equal or worse
    for(let i = 0; i < Math.min(aSplit.length, bSplit.length); ++i) {
        if(aSplit[i] > bSplit[i]) {
            return true;
        }
        if(aSplit[i] < bSplit[i]) {
            return false;
        }
    }
    // if all available digits are the same, the longer one is better (1.1 is better than 1)
    return a.length > b.length;
}

const boolPost = c => c ? 'Yes' : 'No';

// NaN check is for TBA or something else, after parseFloating it is NaN and should be considered bad so highlighting still works for other parts
const numberUpCompare = (a, b) => a > b || isNaN(b);
const numberDownCompare = (a, b) => a < b || isNaN(b);

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
        preprocess: c => {
            // yyyy-mm-dd
            if(/^\d{4}-\d{2}-\d{2}$/.test(c)) {
                return new Date(c);
            }
            // yyyy-mm
            if(/^\d{4}-\d{2}$/.test(c)) {
                return new Date(`${c}-01`);
            }
            // yyyy
            if(/^\d{4}$/.test(c)) {
                return new Date(+c, 0);
            }
            // quarter or half (Q2 2017, for example)
            if(/^[QH]\d \d{4}$/.test(c)) {
                const yyyy = c.slice(3);
                // H2 == Q3 for comparison purposes
                const q = c.slice(0, 2) === 'H2' ? 3 : +(c[1]);
                return new Date(yyyy, (q - 1) * 3, 1);
            }
            // something weird, maybe TBA?
            return new Date(0);
        },
        compare: numberUpCompare,
        postprocess: c => {
            const d = types.dateUp.preprocess(c);
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
        compare: versionCompare,
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

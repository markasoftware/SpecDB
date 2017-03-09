// pure easy to test stuff goes here for some reason

module.exports.genSubtext = data => {
    var innerData = data.data;
    switch(data.subtextType) {
        case 'architecture':
            return [
                innerData.Lithography.replace(' ','') + ' Lithography',
                'Released ' + innerData['Release Date'],
                 innerData.Sockets.join(', ') + ' Socket' + (innerData.Sockets.length > 1 ? 's' : ''),
            ];
            // I don't think these break statements are necessary but whatever
            break;
        case 'cpu':
            return [
                innerData['Core Count'] + ' Cores, ' + innerData['Thread Count'] + ' Threads',
                innerData['Base Frequency'].replace(' ','') + ' Base, ' + innerData['Boost Frequency'].replace(' ','') + ' Boost',
                innerData.TDP.replace(' ','') + ' TDP',
            ];
            break;
        default: return [];
    }
}

const cpuFieldSortValues = [
    'Base Frequency',
    'Boost Frequency',
    'Core Count',
    'Thread Count',
    'TDP',
];

const getIndex = (haystack, needle) => {
    const index = haystack.indexOf(needle);
    return index === -1 ? 9999 : index;
}

// TODO: make this work for GPUs & APUs as well instead of hard coding in cpu
module.exports.getRowNames = parts =>
    Array.from(new Set(parts.reduce((a, b) => a.concat(Object.keys(b.data)), [])))
        .sort((a, b) => getIndex(cpuFieldSortValues, a) - getIndex(cpuFieldSortValues, b));

module.exports.greaterThan = (rowName, a, b) => {
    const preprocess = c => {
        if(typeof c == 'string') {
            const splitUp = c.split(' ');
            if(rowName.includes('Frequency')) {
                return splitUp[0] * (splitUp[1] === 'GHz' ? 1024 * 1024 * 1024 : 1024 * 1024);
            }
            if(rowName.includes('Cache')) {
                return splitUp[0] * (splitUp[1] === 'MHz' ? 1024 * 1024 : 1024);
            }
        }
        return c;
    }
    a = preprocess(a);
    b = preprocess(b);
    if(rowName.includes('Frequency') || rowName.includes('Cache') ||
        rowName === 'Lithography' ||
        rowName === 'Core Count' ||
        rowName == 'Thread Count') {
            return parseFloat(a) > parseFloat(b);
    }
    if(rowName == 'TDP') {
        return parseFloat(a) < parseFloat(b);
    }
}

module.exports.postprocess = cellValue => {
    if(typeof cellValue == 'boolean') {
        return cellValue ? 'Yes' : 'No';
    }
    return cellValue;
}

module.exports.canCompareRow = rowName =>
    [
        'Base Frequency',
        'Boost Frequency',
        'Core Count',
        'Module Count',
        'Thread Count',
        'TDP',
        'Unlocked',
        'L2 Cache (Total)',
        'L3 Cache (Total)',
        'Lithography',
    ].includes(rowName);

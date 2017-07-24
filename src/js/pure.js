// pure easy to test stuff goes here for some reason

module.exports.genSubtext = data => {
    const innerData = data.data;
    switch(data.type) {
        case 'CPU Architecture':
            return [
                innerData.Lithography.replace(' ','') + ' Lithography',
                'Released ' + innerData['Release Date'],
                 innerData.Sockets.join(', ') + ' Socket' + (innerData.Sockets.length > 1 ? 's' : ''),
            ];
        case 'Graphics Architecture':
            const dx12 = parseInt(innerData['DirectX Support']) >= 12;
            const vulkan = parseInt(innerData['Vulkan Support']) >= 1;
            return [
                innerData.Lithography.replace(' ','') + ' Lithography',
                'Released ' + innerData['Release Date'],
                // who doesn't love some nice little conditionals?
                (
                    dx12 ?
                        vulkan ?
                            // dx12 and vulkan
                            'Supports DX12 and Vulkan'
                        :
                            // only dx 12
                            'Supports DX12, no Vulkan'
                    :
                        vulkan ?
                            // only vulkan
                            'Supports Vulkan, no DX12'
                        :
                            // neither
                            'No DX12 or Vulkan support'
                ),
            ];
        case 'CPU':
            return [
                innerData['Core Count'] + ' Cores, ' + innerData['Thread Count'] + ' Threads',
                innerData['Base Frequency'].replace(' ','') + ' Base, ' + (innerData['Boost Frequency'] || 'No').replace(' ','') + ' Boost',
                innerData.TDP.replace(' ','') + ' TDP',
            ];
        case 'Graphics Card':
            return [
                innerData['VRAM Capacity'].replace(' ','') + ' VRAM',
                innerData['Shader Processor Count'] + ' Shader Processors',
                (innerData['Boost Frequency'] ?
                    innerData['Base Frequency'].replace(' ','') + ' Base, ' + innerData['Boost Frequency'].replace(' ','') + ' Boost' :
                    innerData['Base Frequency'].replace(' ','') + ' Clock'
                ),
            ]
        default: return [];
    }
}

const sortValues = {
    CPU: [
        'Base Frequency',
        'Boost Frequency',
        'Core Count',
        'Thread Count',
        'L2 Cache (Total)',
        'L3 Cache (Total)',
        'TDP',
        'Architecture',
        'Release Date',
    ],
    'Graphics Card': [
        'Base Frequency',
        'Boost Frequency',
        'VRAM Capacity',
        'Shader Processor Count',
        'Texture Mapping Unit Count',
        'Render Output Unit Count',
        'TDP',
    ]
};

const getIndex = (haystack, needle) => {
    const index = haystack.indexOf(needle);
    return index === -1 ? 9999 : index;
}


const commonBasicRows = [
    'Base Frequency',
    'Boost Frequency',
    'TDP',
    'Architecture',
    'Release Date',
];

const specificBasicRows = {
    'CPU': [
        'Core Count',
        'Thread Count',
    ],
    'Graphics Card': [
        'Shader Processor Count',
        'VRAM Capacity',
    ],
}

module.exports.getRowNames = (parts, advancedRows) => {
    const curType = parts[0].type;
    const curSortVals = sortValues[curType];
    const toReturn = parts.reduce((a, b) => a.concat(Object.keys(b.data)), [])
        // fancy es5 remove duplicate thing. I actually benchmarked it, and believe it or not it's faster than the native-ish Array.from(new Set()) and has better browser support!
        .filter((c, i, s) => s.indexOf(c) === i)
        .sort((a, b) => getIndex(curSortVals, a) - getIndex(curSortVals, b));
    if(advancedRows) {
        return toReturn;
    } else {
        const basicRows = commonBasicRows.concat(specificBasicRows[curType]);
        return toReturn.filter(c => basicRows.includes(c));
    }
}


module.exports.processRow = (values, processor) => {
    const maxIndices = [];

    if(processor) {
        // Insert default values
        values = values.map(c => (c === undefined && processor.default !== undefined) ? processor.default : c);

        // find max value, if necessary
        if(processor.compare) {
            const preprocess = processor.preprocess ? processor.preprocess : (c => c);
            // filter is to get rid of any undefined values
            const maxValue = values.filter(c => typeof c !== 'undefined').reduce((a, b) => processor.compare(preprocess(a), preprocess(b)) ? a : b)
            // find which ones are equal to the maxValue, put into maxIndices
            values.forEach((c, i) => {
                if(c === maxValue) {
                    maxIndices.push(i);
                }
            });
        }
        values = values.map(c => (c !== undefined && processor.postprocess) ? processor.postprocess(c) : c);
    }

    return {
        values,
        maxIndices,
    };
}

module.exports.seo = list => {
    const tr = {};
    const sortedList = list.slice().sort();
    if(JSON.stringify(list) !== JSON.stringify(sortedList)) {
        tr.canonical = `https://specdb.markasoftware.com/#!/${sortedList.join(',')}`;
    }
    switch(list.length) {
        case 0:
            // dash is unicode u2014
            tr.title = 'SpecDB — View and Compare Graphics Cards and CPUs';
            tr.description = 'A modern, fast, and beautiful spec viewing and comparison platform for PC hardware.';
            break;
        case 1:
            tr.title = `SpecDB — ${list[0]} Specs and Comparison`;
            tr.description = 'View the specs of the ' + list[0] + ' and compare it to other similar parts on SpecDB.';
            break;
        case 2:
            tr.title = `SpecDB — ${list[0]} vs ${list[1]}`;
            tr.description = 'Compare the specs for the ' + list[0] + ' and ' + list[1] + ' side-by-side on SpecDB.';
            break;
        default:
            const humanList = list.slice(0, -1).join(', ') + ', and ' + list[list.length - 1];
            tr.title = `SpecDB — Compare the ${humanList}`;
            tr.description = `Compare the specs for the ${humanList} side-by-side on SpecDB.`;
    }
    return tr;
}

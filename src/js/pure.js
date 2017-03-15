// pure easy to test stuff goes here for some reason

module.exports.genSubtext = data => {
    const innerData = data.data;
    switch(data.type) {
        case 'cpuArchitecture':
            return [
                innerData.Lithography.replace(' ','') + ' Lithography',
                'Released ' + innerData['Release Date'],
                 innerData.Sockets.join(', ') + ' Socket' + (innerData.Sockets.length > 1 ? 's' : ''),
            ];
            // I don't think these break statements are necessary but whatever
            break;
        case 'gpuArchitecture':
            const dx12 = parseInt(innerData['DirectX Support']) >= 12;
            const vulkan = innerData['Vulkan Support'];
            return [
                innerData.Lithography.replace(' ','') + ' Lithography',
                'Released ' + innerData['Release Date'],
                // who doesn't love some nice little conditionals?
                (
                    dx12 ?
                        vulkan ?
                            // dx12 and vulkan
                            'Supports DX12 & Vulkan'
                        :
                            // only dx 12
                            'Supports DX12, no Vulkan'
                    :
                        vulkan ?
                            // only vulkan
                            'Supports Vulkan, no DX12'
                        :
                            // neither
                            'No DX12/Vulkan Support'
                ),
            ];
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


module.exports.processRow = (values, processor) => {
    const maxIndices = [];

    if(processor) {
        // Insert default values
        values = values.map(c => (c === undefined && processor.default !== undefined) ? processor.default : c);

        // find max value, if necessary
        if(processor.compare) {
            const preprocess = processor.preprocess ? processor.preprocess : (c => c);
            // filter is to get rid of any undefined values
            const maxValue = values.filter(c => c).reduce((a, b) => processor.compare(preprocess(a), preprocess(b)) ? a : b)
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

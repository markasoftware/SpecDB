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

module.exports.getTableData = (parts, sections) =>
    // generate all data here, hidden sections will be handled in spec-viewer.js
    // performance overhead is minimal
    
    sections
    .map(curSection => ({
        name: curSection.name,
        // the rows are already in order
        rows: curSection.rows
            // filter to only those that at least 1 part has
            // using parts.filter instead of parts.find for compatibility
            .filter(curRow => parts.filter(curPart => curPart.data[curRow.name]).length)
            .map(curRow => {
                const canCompare = curRow.processor.compare && parts.length > 1;
                // get a list of cells with pre and post processed values
                const fullDataCells = parts.map(curPart => {
                    const yamlValue = curPart.data[curRow.name];
                    const yamlUndefined = typeof yamlValue === 'undefined';
                    const initialUndefined = yamlUndefined && !curRow.processor.default;
                    const initial = yamlUndefined ? curRow.processor.default : yamlValue;
                    return initialUndefined ? { } : {
                        postprocessed:
                            curRow.processor.postprocess ?
                                curRow.processor.postprocess(initial) :
                                initial,
                        preprocessed:
                            curRow.processor.preprocess ?
                                curRow.processor.preprocess(initial) :
                                initial,
                    };
                });
                // find best value
                const bestPreprocessedValue = canCompare && fullDataCells.reduce((a, b) =>
                    curRow.processor.compare(a, b) ? a : b
                );
                // now, take the full data cells and the best value to create a slimmed down version
                // containing only the displayed/postprocessed value and whether this cell is a winner
                return {
                    name: curRow.name,
                    cells: fullDataCells.map((fullCell) => ({
                        value: fullCell.postprocessed,
                        winner: canCompare && fullCell.preprocessed === bestPreprocessedValue,
                    })),
                };
            }),
    }));

module.exports.seo = list => {
    const tr = {};
    const sortedList = list.slice().sort();
    if(JSON.stringify(list) !== JSON.stringify(sortedList)) {
        tr.canonical = `https://specdb.info/#!/${sortedList.join(',')}`;
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

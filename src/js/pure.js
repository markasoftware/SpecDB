// pure easy to test stuff goes here for some reason

module.exports.genSubtext = data => {
    switch(data.subtextType) {
        case 'architecture':
            return [
                data.data.Lithography.replace(' ','') + ' Lithography',
                'Released ' + data.data['Release Date'],
                 data.data.Sockets.join(', ') + ' Socket' + (data.data.Sockets.length > 1 ? 's' : ''),
            ];
            // I don't think these break statements are necessary but whatever
            break;
        case 'cpu':
            console.log(JSON.stringify(data));
            return [
                data['Core Count'] + ' Cores, ' + data['Thread Count'] + ' Threads',
                data['Base Frequency'].replace(' ','') + ' Base, ' + data['Boost Frequency'].replace(' ','') + ' Boost',
                data.TDP.replace(' ','') + ' TDP',
            ];
            break;
        default: return [];
    }
}
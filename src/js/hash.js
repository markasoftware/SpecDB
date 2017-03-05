// this file manages the hash portion of the url, which in this case shows which parts are currently being compared

module.exports = {
    // c => c does the work of geting rid of empty strings, which occurs when there is no parts (empty string input)
    getList: () => location.hash.slice(3).split(',').filter(c => c),
    add: newName => location.hash = '#!/' + module.exports.getList().concat(newName).join(','),
    remove: oldName => location.hash = '#!/' + module.exports.getList().filter(c => c !== oldName).join(','),
}

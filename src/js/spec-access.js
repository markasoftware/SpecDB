// thanks obama
module.exports = specData => {
    return {
        fromBreadcrumbs: breadcrumbs => breadcrumbs.reduce((oldObj, crumb) => oldObj.children[crumb], specData),
    }
}
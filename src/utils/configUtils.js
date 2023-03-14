function createProxyDefinition(
    classFactory,
    ui = [],
    links = [],
    definitionOptions = {},
    props = {},
) {
    console.log('createProxyDefinition - Running');
    return {
        class: classFactory,
        options: { links, ui, ...definitionOptions },
        props,
    }
}

function activateOnCreate(proxyDefinition) {
    console.log('activateOnCreate - Running');
    proxyDefinition.options.activateOnCreate = true;
    return proxyDefinition;
}

export default {
    createProxyDefinition,
    activateOnCreate,
}

let _costsMap = {};

window.saveTransferCosts = (id) => {
    
    const value = document.getElementById(id).value;

    _costsMap = {};
    value.split('\n').map(x => {
        const record = x.trim().split('=');
        _costsMap[record[0].trim().toUpperCase()] = +record[1];
    });

    window.localStorage.setItem('costsMap', JSON.stringify(_costsMap));
}

window.loadTransferCosts = (id) => {

    _costsMap = window.localStorage.getItem('costsMap') || '{}';

    try {
        _costsMap = JSON.parse(_costsMap);
        window.costsMap = _costsMap;

        if (id) {
            const textValue = Object.keys(_costsMap).map(key => key + '=' + _costsMap[key]).join('\r\n');
            document.getElementById(id).value = textValue;
        }
    } catch (error) {
        console.warn('cannot parse stored costsMap', _costsMap);
    }

    return _costsMap;
}

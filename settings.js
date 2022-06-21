
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

let _savedFlightsMap = {};

window.saveFlight = (route, date, price, link) => {

    const key = `${route}--${date}`;
    const order = Object.keys(_savedFlightsMap).length;
    _savedFlightsMap[key] = {order, route, date, price, link};
    window.localStorage.setItem('savedFlightsMap', JSON.stringify(_savedFlightsMap));
};

window.getSavedFlight = () => {

    const strData = window.localStorage.getItem('savedFlightsMap');

    try {
        _savedFlightsMap = JSON.parse(strData);
    }
    catch (error) {
        _savedFlightsMap = {};
    }

    return _savedFlightsMap;
};

window.clearsSavedFlights = () => {
    
    _savedFlightsMap = {};
    window.localStorage.setItem('savedFlightsMap', JSON.stringify(_savedFlightsMap));
}

getSavedFlight();

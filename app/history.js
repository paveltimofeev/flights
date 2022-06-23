const historyContainer = document.querySelector('#history-records-table');

window._data = [];

async function getData (dataUrl) {

    const get = (dataUrl) => {

        return fetch(dataUrl + `?_r=${Math.round(Date.now()/1000/60/60)}`)
                .then(response => response.json())
                .then(data => { return data; })
                .catch(err => { console.log(err); return {}; });
    };

    return Promise.all([
        get('./data/rus-spa-latest.json'),
        get('./data/spa-rus-latest.json'),
        get('./data/tur-spa-latest.json'),
        get('./data/rus-can-latest.json'),
        get('./data/can-rus-latest.json'),
    ]).then(datas => {
        window._data = [
            ...datas[0].results,
            ...datas[1].results,
            ...datas[2].results,
            ...datas[3].results,
            ...datas[4].results
        ];
    });
}

function getCurrentPrice (route, date) {

    const found = window._data.filter(x => x.route === route).filter(x => x.departure_at.split('T')[0] === date);
    if (found.length === 1) {
        return found[0].price;
    }

    return null;
}

function loadAndRenderHistory () {

    const records = getSavedFlight();

    Object.keys(records).sort((a,b) => records[b].order - records[a].order).forEach(key => {

        const tr = document.createElement('tr');
        const td1 = document.createElement('td');
        const td2 = document.createElement('td');
        const td3 = document.createElement('td');
        const td4 = document.createElement('td');
        const td5 = document.createElement('td');
        const link = document.createElement('a');

        const rec = records[key];

        td1.innerText = `${rec.route}`;
        td2.innerText = `${rec.date}`;
        td3.innerText = `${rec.price}`;

        const currentPrice = getCurrentPrice(rec.route, rec.date);
        if (currentPrice !== null && currentPrice !== rec.price) {
            const difference = currentPrice - rec.price;
            td4.innerText = `${currentPrice} (${difference > 0 ? '+' : ''}${difference})`;
        } 
        else if (currentPrice === null) {
            td4.innerText = '-';
        }

        link.innerText = 'open';
        link.href = rec.link;
        link.target = '_blank';
        td5.appendChild(link);

        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tr.appendChild(td4);
        tr.appendChild(td5);

        historyContainer.appendChild(tr);
    });
}

function clearHistory () {
    clearsSavedFlights();
    historyContainer.innerHTML = '';
}


getData().then(() => {
    loadAndRenderHistory();
});

tippy('[data-tippy-content]');

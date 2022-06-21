const historyContainer = document.querySelector('#history-records-table');

function loadAndRenderHistory () {

    const records = getSavedFlight();

    Object.keys(records).sort((a,b) => records[b].order - records[a].order).forEach(key => {

        const tr = document.createElement('tr');
        const td1 = document.createElement('td');
        const td2 = document.createElement('td');
        const td3 = document.createElement('td');
        const td4 = document.createElement('td');
        const link = document.createElement('a');

        const rec = records[key];
        td1.innerText = `${rec.route}`;
        td2.innerText = `${rec.date}`;
        td3.innerText = `${rec.price}`;
        link.innerText = 'open';
        link.href = rec.link;
        link.target = '_blank';
        td4.appendChild(link);

        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tr.appendChild(td4);

        historyContainer.appendChild(tr);
    });
}

function clearHistory () {

    clearsSavedFlights();
    historyContainer.innerHTML = '';
}

loadAndRenderHistory();

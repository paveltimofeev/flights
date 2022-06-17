
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const columns = document.querySelector('.columns');

function getTimespan (fromDate) {
  const timespan = new Date(Date.now() - new Date(fromDate));
  
  const days = timespan.getUTCDate() - 1;
  const hours = timespan.getUTCHours();
  const minutes = timespan.getUTCMinutes();

  const parts = [
    days > 0 ? `${days} day `: undefined,
    hours > 0 ? `${hours} hour `: undefined,
    minutes > 0 ? `${minutes} min `: undefined,
  ];

  return `${parts.filter(Boolean).join(' ')}ago`
}

const info = document.querySelector('#info');
info.innerText = 
`Prices ${data.stats.minPrice} - ${data.stats.maxPrice} ${data.params.currency.toUpperCase()}. ` + 
`Travel time ${Math.round(data.stats.minDuration/60)} - ${Math.round(data.stats.maxDuration/60)} hours. ` + 
`Checked ${data.stats.totalRequests} variants. ` + 
`For ${data.params.dateRange.days} days since ${data.params.dateRange.since.split('T')[0]}. ` + 
`Scan date: ${data.date} (${getTimespan(data.date)}).`;

let mobileSelectedLink = null;
let mobileSelectedCell = null;

function onCellClick (cellEl, idx) {

  let link = data.results[idx].link;
  if (!link.startsWith('/')) {
    link = '/' + link;
  }

  if (!isMobile) {
    window.open('https://www.aviasales.ru' + link, '_blank').focus();
    cellEl.classList.add('cell--clicked');
  }
  else {
    
    tippy.hideAll();
    const button = document.querySelector('.mobile-open-btn');

    if (mobileSelectedLink !== link) {
      mobileSelectedLink = link;
      mobileSelectedCell = cellEl;
      button.classList.add('mobile-open-btn--open');
    } 
    else {
      mobileSelectedLink = null;
      mobileSelectedCell = null;
      button.classList.remove('mobile-open-btn--open');
    }
  }
}

function onMobileOpenButtonClick () {
  if (mobileSelectedLink) {
     window.open('https://www.aviasales.ru' + mobileSelectedLink, '_blank').focus();
  }
  if (mobileSelectedCell) {
    mobileSelectedCell.classList.add('cell--clicked');
  }
}

const transferCostsMap = loadTransferCosts();
const transferCostCache = {};
function getSumTransferCost (direction) {

  if (transferCostCache[direction]) {
    return transferCostCache[direction];
  }
  
  const locs = direction.split('-');
  const total = ((+transferCostsMap[locs[0]]) || 0) + ((+transferCostsMap[locs[1]]) || 0);
  transferCostCache[direction] = total;

  return total;
}

function createRouteAbbrElement (route, cell) {

  let abbr = route;
  const transferCost = getSumTransferCost(abbr);

  if (transferCost > 0) {
    abbr = abbr + '*';
    cell.setAttribute('data-tippy-content', 'incl. transf to airport: +' + transferCost);
  }
  
  const span = document.createElement('span');
  span.classList.add('route-abbr');
  span.innerText = abbr;
  return span;
}

function createRouteLabelElement (route, airportLabelsMap) {

  airportLabelsMap = airportLabelsMap || {};
  const pairs = route.split('-');

  const span = document.createElement('span');
  span.classList.add('route-label');
  span.innerText = `${airportLabelsMap[pairs[0]] || 'unknown name'} - ${airportLabelsMap[pairs[1]] || 'unknown name'}`;
  return span;
}

function renderRowHeaders (rowsHeaders, airportLabelsMap) {

  const col = document.createElement('div');
  col.classList.add('col');
  col.classList.add('col-row-header');

  Object.keys(rowsHeaders).forEach(row => {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.classList.add('cell--row-header');

    cell.appendChild(createRouteAbbrElement(row, cell));
    cell.appendChild(createRouteLabelElement(row, airportLabelsMap));

    col.appendChild(cell);
  });

  const footer = document.createElement('div');
  footer.classList.add('cell');
  footer.classList.add('cell--row-header');
  footer.classList.add('cell--footer');
  col.appendChild(footer);
  columns.appendChild(col);
}

function render (cells, footerLabel, weekEnd) {
  
  const col = document.createElement('div');
  col.classList.add('col');
  if (weekEnd) {
    col.classList.add('we');
  }

  cells.forEach(c => {
    const cell = document.createElement('div');
    cell.classList.add('cell');

    if (c.idx) {
      cell.setAttribute('data-idx', c.idx);
      cell.addEventListener('click', () => onCellClick(cell, c.idx));
    }

    if (c.tooltip) {
      cell.setAttribute('data-tippy-content', c.tooltip);
    }

    if (c.minPrice) {
      cell.classList.add('cell--min');
    }

    if (c.quickest) {
      cell.classList.add('cell--quic');
    }

    if (c.transfers === 0) {
      cell.classList.add('cell--t0');
    }

    if (c.transfers === 1) {
      cell.classList.add('cell--t1');
    }

    const r = document.createElement('span');
    r.classList.add('r');
    r.classList.add('s' + c.s );
    r.classList.add('c' + c.c);

    cell.appendChild(r);
    col.appendChild(cell);
  });

  const footer = document.createElement('div');
  footer.classList.add('cell');
  footer.classList.add('cell--footer');
  const footerSpan = document.createElement('span');
  footerSpan.innerText = footerLabel;
  footer.appendChild(footerSpan);
  col.appendChild(footer);
  
  columns.appendChild(col);
}

const sortByDate = (a, b) => {
  const d1 = (new Date(a.departure_at.split('T')[0])).getTime();
  const d2 = +(new Date(b.departure_at.split('T')[0])).getTime();
  return d1 - d2;
}

data.results.sort(sortByDate);

const cols = {};
data.results.forEach((record, idx) => {
  record.idx = idx;
  const footerText = record.departure_at.split('T')[0];
  if(cols[footerText]) {
    cols[footerText].push(record);
  }
  else {
    cols[footerText] = [record];
  }
});

const rowsIndexMap = {};
let index = 0;
for(let i = 0; i < data.params.from.length; i++) {
  for(let j = 0; j < data.params.to.length; j++) {
    rowsIndexMap[data.params.from[i] + '-' + data.params.to[j]] = index;
    index++;
  } 
}

renderRowHeaders(rowsIndexMap, data.params.labels);

const lowPrice = data.params?.priceRange?.lowPrice || 300;
const priceStep = data.params?.priceRange?.step || 100;
const maxRows = data.params.from.length * data.params.to.length;
Object.keys(cols).forEach(date => {
  const col = cols[date];
  const cells = [];
  for(let i = 0; i < maxRows; i++) {
    cells.push({r: 0, s: 0});
  }
  col.forEach(c => {

    const i = rowsIndexMap[c.route];
  
    cells[i].idx = c.idx;
    cells[i].c = Math.round( (c.duration - data.stats.minDuration) / (data.stats.maxDuration - data.stats.minDuration) * 5 + 1 );
    cells[i].c = cells[i].c > 5 ? 5 : cells[i].c;

    // cells[i].s = Math.round( (c.price - data.stats.minPrice) / (data.stats.maxPrice - data.stats.minPrice) * 5 + 1 );
    const transfToAirport = getSumTransferCost(c.route);
    const priceLevel = Math.round((c.price + transfToAirport - lowPrice) / priceStep);
    cells[i].s = priceLevel <= 0 ? 1 : priceLevel > 5 ? 5 : priceLevel;

    const isMinPrice = c.price < data.stats.minPrice * 1.2;
    const isQuickest = c.duration < data.stats.minDuration * 1.2;
    cells[i].minPrice = isMinPrice;
    cells[i].quickest = isQuickest;
    cells[i].transfers = c.transfers;

    const priceLabel = !isMinPrice ? `Price` : `BEST Price`;
    const durationLabel = !isQuickest ? `Time` : `BEST Time`;
    const transferCost = transfToAirport > 0 ? ` (${c.price + transfToAirport})` : ``;
    cells[i].tooltip = priceLabel + ` ${c.price}` + transferCost + ` | ` + durationLabel + ` ${Math.round(c.duration/60)}H` + ` | ⇄ ` + c.transfers;
  });

  const dayOfWeek = (new Date(date)).getDay();
  const weekEnd = dayOfWeek === 6 || dayOfWeek === 0;
  render(cells, date, weekEnd);
});

tippy('[data-tippy-content]', {theme: 'light', trigger: isMobile ? 'click' : 'mouseenter focus'});

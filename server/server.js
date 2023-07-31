const express = require('express');
const ws = require('ws');
const http = require('http');
const csvtojson = require('csvtojson');
const path = require('path');
const { clearInterval } = require('timers');

const percentageChange = (oldVal, newVal) => {
  return ((newVal - oldVal) / newVal) * 100;
};

const getRandomSymbol = (set) => {
  let items = Array.from(set);
  return items[Math.floor(Math.random() * items.length)];
};

let intervalHandle;

const start = async () => {
  const symbolList = await csvtojson().fromFile(
    path.resolve('.', 'server', 'data.csv')
  );
  const symbolsMap = symbolList.reduce((acc, entry) => {
    return {
      ...acc,
      [entry.symbol]: {
        ...entry,
        last: Number(entry.last),
      },
    };
  }, {});
  const subscribedSymbols = new Set();

  // ws
  const wsAppServer = http.createServer(express());
  const wsServer = new ws.Server({ server: wsAppServer });

  wsServer.on('connection', (socket) => {
    console.log('connection');
    // Clear all subscription on connection
    subscribedSymbols.clear();

    clearInterval(intervalHandle);
    intervalHandle = setInterval(() => {
      const randomCount = Math.round(subscribedSymbols.size * Math.random());

      if (!randomCount) {
        return;
      }

      const updates = [];
      const availableSymbols = new Set(subscribedSymbols)

      for(let i = 0; i<randomCount; i++) {
        const symbol = getRandomSymbol(availableSymbols);
        availableSymbols.delete(symbol);
        
        const symbolEntry = symbolsMap[symbol];
        const change = Math.round((Math.random() - 0.5) * 100) / 100;
        const last = Math.round((symbolEntry.last + change) * 100) / 100;
        const changePct = percentageChange(symbolEntry.last, last);
        const symbolValues = {
          symbol,
          last,
          change,
          changePct,
        };

        updates.push(symbolValues);
  
        symbolsMap[symbol] = {
          ...symbolEntry,
          ...symbolValues,
        };
      }
     
      socket.send(JSON.stringify(updates));
    }, 500);

    socket.on('message', (buffer) => {
      const message = JSON.parse(buffer.toString('utf8'));
      const { type, symbols } = message;

      console.info('Received message', message);
      switch (type) {
        case 'subscribe':
          symbols.forEach((s) => {
            if (!symbolsMap[s]) {
              return;
            }
            subscribedSymbols.add(s)
          });
          socket.send(JSON.stringify(symbols.map((s) => symbolsMap[s]).filter(Boolean)));
          break;

        case 'unsubscribe':
          symbols.forEach((s) => subscribedSymbols.delete(s));
          break;
      }
    });
  });

  wsAppServer.listen(8082, () => {
    console.info(`WS Server started on port ${wsAppServer.address().port}.`);
  });

  // http
  const httpApp = express();
  httpApp.listen(8080, () => {
    console.info(`HTTP Server started on port 8080.`);
  });
  httpApp.get('/api/symbols', (req, res, next) => {
    res.json(Object.keys(symbolsMap));
  });
};

start();

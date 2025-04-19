import express from 'express';
import WebSocket from 'ws';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

let prices = {};

const symbols = ['btcusdt', 'ethusdt', 'solusdt'];
const wsUrl = `wss://stream.binance.com:9443/stream?streams=${symbols.map(s => `${s}@trade`).join('/')}`;
const ws = new WebSocket(wsUrl);

ws.on('message', (data) => {
  const parsed = JSON.parse(data);
  const symbol = parsed.stream.split('@')[0].toUpperCase();
  const trade = parsed.data;

  prices[symbol] = {
    price: trade.p,
    qty: trade.q,
    time: trade.T,
  };
});

app.get('/prices', (req, res) => {
  res.json(prices);
});

app.listen(PORT, () => {
  console.log(`✅ Proxy server çalışıyor. Port: ${PORT}`);
});

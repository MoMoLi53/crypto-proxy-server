const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// 🔹 İzlenecek coin listesi (küçük harf)
const symbols = ['btcusdt', 'ethusdt', 'solusdt', 'adausdt', 'xrpusdt', 'zkusdt', 'dotusdt', 'arkmusdt', 'eigenusdt'];

// 🔹 Başlangıçta tüm coinler boş değerle tanımlanır
let prices = {};
symbols.forEach(sym => {
  prices[sym.toUpperCase()] = {
    price: null,
    quantity: null,
    time: null
  };
});

// 🔹 Binance WebSocket bağlantısı
const url = `wss://stream.binance.com:9443/stream?streams=${symbols.map(s => `${s}@trade`).join('/')}`;
const ws = new WebSocket(url);

ws.on('open', () => {
  console.log('✅ Binance WebSocket bağlantısı kuruldu.');
});

ws.on('message', (data) => {
  const parsed = JSON.parse(data);
  const stream = parsed.stream;
  const trade = parsed.data;

  const symbol = stream.split('@')[0].toUpperCase();
  const price = trade.p;
  const quantity = trade.q;
  const time = new Date(trade.T).toLocaleTimeString();

  prices[symbol] = {
    price,
    quantity,
    time
  };

  console.log(`[${symbol}] ${time} → Fiyat: ${price} | Miktar: ${quantity}`);
});

ws.on('error', (err) => {
  console.error('❌ WebSocket HATASI:', err);
});

ws.on('close', () => {
  console.log('🔌 WebSocket bağlantısı kapatıldı.');
});

// 🔹 Replit bu endpointten veri alır
app.get('/prices', (req, res) => {
  const result = {};

  for (const [symbol, value] of Object.entries(prices)) {
    result[symbol] = value.price
      ? value
      : { price: "Bekleniyor", quantity: "-", time: "-" };
  }

  res.json(result);
});

app.listen(PORT, () => {
  console.log(`🚀 Express sunucu çalışıyor: http://localhost:${PORT}`);
});

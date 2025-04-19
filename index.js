const WebSocket = require('ws');

// 🔹 Takip etmek istediğin coin sembolleri (küçük harf)
const symbols = ['btcusdt', 'ethusdt', 'solusdt', 'adausdt', 'xrpusdt','zkusdt','dotusdt','arkmusdt','eigenusdt'];

// 🔹 WebSocket URL'sini coin listesine göre oluştur
const url = `wss://stream.binance.com:9443/stream?streams=${symbols.map(s => `${s}@trade`).join('/')}`;

// 🔹 WebSocket bağlantısını başlat
const ws = new WebSocket(url);

ws.on('open', () => {
  console.log('✅ Çoklu Coin WebSocket bağlantısı kuruldu.');
});

ws.on('message', (data) => {
  const parsed = JSON.parse(data);
  const stream = parsed.stream;     // Örnek: btcusdt@trade
  const trade = parsed.data;

  const symbol = stream.split('@')[0].toUpperCase();  // BTCUSDT
  const price = trade.p;
  const quantity = trade.q;
  const time = new Date(trade.T).toLocaleTimeString();

  console.log(`[${symbol}] ${time} → Fiyat: ${price} | Miktar: ${quantity}`);
});

ws.on('error', (err) => {
  console.error('❌ WebSocket HATASI:', err);
});

ws.on('close', () => {
  console.log('🔌 WebSocket bağlantısı kapatıldı.');
});

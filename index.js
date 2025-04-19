import express from 'express';
import axios from 'axios';
import cors from 'cors';
import path from 'path';
import { WebSocket as BinanceWS } from 'ws';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;

// 📁 Statik dosyalar (frontend için)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));

// 🌍 CORS aktif et
app.use(cors());

// 🔌 SSE (canlı veri için)
let clients = []; // SSE dinleyicileri
let currentSymbol = 'btcusdt';
let currentInterval = '1m';
let binanceSocket = null;

// 🔹 REST: geçmiş mum verilerini getir
app.get('/api/klines', async (req, res) => {
  const { symbol, interval, limit } = req.query;

  if (!symbol || !interval) {
    return res.status(400).json({ error: 'symbol ve interval zorunludur.' });
  }

  try {
    const response = await axios.get('https://api.binance.com/api/v3/klines', {
      params: {
        symbol: symbol.toUpperCase(),
        interval,
        limit: limit || 100
      }
    });

    const formatted = response.data.map(candle => ({
      time: candle[0],
      open: candle[1],
      high: candle[2],
      low: candle[3],
      close: candle[4],
      volume: candle[5]
    }));

    res.json(formatted);
  } catch (err) {
    console.error('❌ Binance REST API hatası:', err.message);
    res.status(500).json({ error: 'Veri çekilemedi.' });
  }
});

// 🔹 SSE: frontend'e canlı veri akışı
app.get('/api/live', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  clients.push(res);

  req.on('close', () => {
    clients = clients.filter(c => c !== res);
  });
});

// 🔄 WebSocket: canlı Binance verisini al
function startWebSocket(symbol, interval) {
  if (binanceSocket) binanceSocket.close();

  const wsUrl = `wss://stream.binance.com:9443/ws/${symbol}@kline_${interval}`;
  binanceSocket = new BinanceWS(wsUrl);

  binanceSocket.on('open', () => {
    console.log(`✅ Binance WS açıldı: ${symbol} @ ${interval}`);
  });

  binanceSocket.on('message', (data) => {
    const json = JSON.parse(data);
    if (!json.k) return;

    const k = json.k;
    const candle = {
      time: k.t,
      open: k.o,
      high: k.h,
      low: k.l,
      close: k.c,
      volume: k.v
    };

    // SSE ile frontend'e gönder
    for (const client of clients) {
      client.write(`data: ${JSON.stringify(candle)}\n\n`);
    }
  });

  binanceSocket.on('close', () => {
    console.log('🔌 Binance WS kapandı.');
  });

  binanceSocket.on('error', (err) => {
    console.error('❌ Binance WS hatası:', err.message);
  });
}

// 🟢 Sunucu başlatıldığında ilk bağlantı
startWebSocket(currentSymbol, currentInterval);

// 🧠 Geliştirme: ileride frontend’ten coin & timeframe değişimini bu şekilde dinamik hale getirebiliriz
// Örn: POST /api/change-stream { symbol: ..., interval: ... } ile güncelleyip startWebSocket tekrar çağırabiliriz

// 🧭 Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`🚀 Sunucu aktif: http://localhost:${PORT}`);
});

// index.js - Stabil Proxy Sunucu (Binance için anlık ve tarihsel veri desteği)

import express from 'express';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Proxy sunucu aktif 🚀');
});

// Binance: Anlık fiyat verisi
app.get('/binance/price', async (req, res) => {
  const { symbol } = req.query;
  if (!symbol) {
    return res.status(400).json({ error: 'symbol parametresi eksik' });
  }
  try {
    const response = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
    res.json(response.data);
  } catch (error) {
    console.error(`[Proxy] Binance price hatası:`, error.message);
    res.status(500).json({ error: 'Fiyat verisi çekilemedi', detail: error.message });
  }
});

// Binance: Tarihsel OHLCV verisi
// Hatalı veya eksik timestamp'larda loglama ve tip kontrolü eklendi
app.get('/binance/history', async (req, res) => {
  const { symbol, interval, startTime, endTime } = req.query;
  if (!symbol || !interval || !startTime || !endTime) {
    return res.status(400).json({ error: 'symbol, interval, startTime, endTime parametreleri zorunludur' });
  }
  console.log(`[Proxy] Tarihsel veri isteği: ${symbol}, ${interval}, ${startTime}, ${endTime}`);
  const params = new URLSearchParams();
  params.append('symbol', symbol.toString());
  params.append('interval', interval.toString());
  params.append('startTime', startTime.toString());
  params.append('endTime', endTime.toString());
  try {
    const { data } = await axios.get(`https://api.binance.com/api/v3/klines?${params}`);
    res.json(data);
  } catch (err) {
    console.error(`[Proxy] Binance history hatası:`, err.message);
    res.status(500).json({ error: 'Tarihsel veri çekilemedi', detail: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy sunucu port ${PORT} üzerinde başlatıldı ✅`);
});

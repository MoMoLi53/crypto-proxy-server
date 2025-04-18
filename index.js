// index.js - tarihsel veri ve anlık grafik desteği için proxy sunucu kodu

import express from 'express';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Proxy sunucu aktif 🚀');
});

// Binance: Anlık fiyat
app.get('/binance/price', async (req, res) => {
  const { symbol } = req.query;
  try {
    const response = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Fiyat verisi çekilemedi', detail: error.message });
  }
});

// Binance: Tarihsel OHLCV verisi
app.get('/binance/history', async (req, res) => {
  const { symbol, interval, startTime, endTime } = req.query;

  if (!symbol || !interval || !startTime || !endTime) {
    return res.status(400).json({ error: 'symbol, interval, startTime, endTime gerekli' });
  }

  const params = new URLSearchParams({ symbol, interval, startTime, endTime });

  try {
    const { data } = await axios.get(`https://api.binance.com/api/v3/klines?${params}`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Binance API hatası', detail: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy sunucu port ${PORT} üzerinde çalışıyor`);
});

import express from 'express';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Proxy sunucu aktif 🚀');
});

// Binance son fiyat verisi (anlık)
app.get('/binance/price', async (req, res) => {
  const { symbol } = req.query;
  try {
    const response = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Fiyat verisi çekilemedi', detail: error.message });
  }
});

// MEXC Kline verisi (hala aktif kalabilir)
app.get('/mexc/ohlcv', async (req, res) => {
  const { symbol, interval } = req.query;
  const url = `https://api.mexc.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=100`;
  try {
    const response = await axios.get(url);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'MEXC API hatası', detail: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy sunucu port ${PORT} üzerinde çalışıyor`);
});

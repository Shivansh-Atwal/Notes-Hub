import express from 'express';
import Trade from '../models/trade.js';

const router = express.Router();


router.get('/', async (req, res) => {
  try {
    const trades = await Trade.find();
    res.json(trades);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});


router.post('/', async (req, res) => {
  const { tradeCode, tradeName } = req.body;
  if (!tradeCode || !tradeName) {
    return res.status(400).json({ error: 'Trade code and trade name are required.' });
  }
  try {
    const trade = new Trade({ tradeCode: tradeCode.trim(), tradeName: tradeName.trim() });
    await trade.save();
    res.status(201).json({ message: 'Trade inserted successfully!', trade });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Trade code already exists. Please use a different code.' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
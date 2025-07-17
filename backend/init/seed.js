import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Trade from '../models/trade.js';

dotenv.config();

const mongoURI = process.env.MONGO_URI || 'mongodb+srv://Shivansh:S9816003623@shop.shfyv.mongodb.net/notehub';

const trades = [
  { tradeCode: 'GCS', tradeName: 'Computer Science Engineering' },
  { tradeCode: 'GEE', tradeName: 'Electrical Engineering' },
  { tradeCode: 'GEC', tradeName: 'Electronics Engineering' },
  { tradeCode: 'GFT', tradeName: 'Food Technology' },
  { tradeCode: 'GCT', tradeName: 'Chemical Technology' },
  { tradeCode: 'GME', tradeName: 'Mechanical Engineering' },
  { tradeCode: 'GIN', tradeName: 'Instrumentation Engineering' }
];

async function seedTrades() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('🧹 Deleting existing trade data...');
    await Trade.deleteMany({});

    console.log('🌱 Seeding new trade data...');
    const result = await Trade.insertMany(trades, { ordered: false });
    console.log(`✅ Inserted ${result.length} trades successfully`);
  } catch (err) {
    console.error('❌ Some trade data may not have been inserted:', err.message || err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB connection closed');
  }
}

seedTrades();

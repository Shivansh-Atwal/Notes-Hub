import mongoose from 'mongoose';

const tradeSchema = new mongoose.Schema({
  tradeCode: { type: String, required: true, unique: true },
  tradeName: { type: String, required: true }
});

const Trade = mongoose.model('Trade', tradeSchema);
export default Trade;
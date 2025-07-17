
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aptitude-platform';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', (err) => console.error('❌ MongoDB connection error:', err));
db.once('open', () => console.log('✅ MongoDB connected successfully.'));

export default mongoose;

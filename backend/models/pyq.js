import mongoose from 'mongoose';

const pyqSchema = new mongoose.Schema({
  title: { type: String, required: true },
  trade: { type: mongoose.Schema.Types.ObjectId, ref: 'Trade', required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  semester: { type: String, required: true },
  fileUrl: { type: String, required: true }, // URL or path to the uploaded file
  fileType: {
    type: String,
    enum: ['pdf', 'jpeg'],
    required: true
  },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploadedAt: { type: Date, default: Date.now }
});

const PYQ = mongoose.model('PYQ', pyqSchema);

export default PYQ; 
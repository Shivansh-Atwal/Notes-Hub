import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  code:{type:String,required:true},
  name: { type: String, required: true },
  trade: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Trade', required: true }],
  semester: { type: String, required: true }
});

const Subject = mongoose.model('Subject', subjectSchema);

export default Subject; 
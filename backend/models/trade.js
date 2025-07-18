import mongoose from 'mongoose';

const tradeSchema = new mongoose.Schema({
  tradeCode: { 
    type: String, 
    required: [true, 'Trade code is required'],
    unique: true,
    trim: true,
    uppercase: true,
    minlength: [2, 'Trade code must be at least 2 characters'],
    maxlength: [5, 'Trade code cannot exceed 5 characters'],
    match: [/^[A-Z]{2,5}$/, 'Trade code must contain only uppercase letters']
  },
  tradeName: { 
    type: String, 
    required: [true, 'Trade name is required'],
    trim: true,
    minlength: [2, 'Trade name must be at least 2 characters'],
    maxlength: [100, 'Trade name cannot exceed 100 characters']
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
tradeSchema.index({ tradeCode: 1 }, { unique: true });
tradeSchema.index({ tradeName: 1 });

// Virtual for formatted display
tradeSchema.virtual('displayName').get(function() {
  return `${this.tradeCode} - ${this.tradeName}`;
});

// Pre-save middleware to ensure uppercase tradeCode
tradeSchema.pre('save', function(next) {
  if (this.tradeCode) {
    this.tradeCode = this.tradeCode.toUpperCase().trim();
  }
  if (this.tradeName) {
    this.tradeName = this.tradeName.trim();
  }
  next();
});

// Static method to find by trade code
tradeSchema.statics.findByCode = function(tradeCode) {
  return this.findOne({ tradeCode: tradeCode.toUpperCase().trim() });
};

// Instance method to update trade
tradeSchema.methods.updateTrade = function(tradeCode, tradeName) {
  this.tradeCode = tradeCode.toUpperCase().trim();
  this.tradeName = tradeName.trim();
  return this.save();
};

const Trade = mongoose.model('Trade', tradeSchema);
export default Trade;
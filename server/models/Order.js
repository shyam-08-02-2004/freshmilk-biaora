const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  milk: { type: Number, default: 0 },
  ghee: { type: Number, default: 0 },
  chach: { type: Number, default: 0 }
});

// A user should only have one order record per day
orderSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Order', orderSchema);

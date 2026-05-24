const mongoose = require('mongoose');

const scanHistorySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  scannedAt: {
    type: Date,
    default: Date.now
  },
  ipAddress: String,
  userAgent: String,
  locationDetails: String // Derived approximate location (e.g., country/city passed by client or reverse IP)
});

module.exports = mongoose.model('ScanHistory', scanHistorySchema);

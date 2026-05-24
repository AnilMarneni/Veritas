const mongoose = require('mongoose');

const traceabilityRecordSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  batchNumber: {
    type: String,
    required: [true, 'Please add a batch number']
  },
  stage: {
    type: String,
    enum: ['seed', 'planting', 'growing', 'harvest', 'processing', 'packaging', 'shipping', 'retail'],
    required: [true, 'Please specify the production stage']
  },
  locationDetails: {
    type: String,
    required: [true, 'Please add the location details']
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  temperature: Number,
  humidity: Number,
  notes: String,
  documents: [String]
});

module.exports = mongoose.model('TraceabilityRecord', traceabilityRecordSchema);

const mongoose = require('mongoose');

const certificationSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  certificationType: {
    type: String,
    required: [true, 'Please specify the certification type (e.g., Organic, GMO-Free)']
  },
  certificateNumber: {
    type: String,
    required: [true, 'Please add a certificate number']
  },
  issuingAuthority: {
    type: String,
    required: [true, 'Please add the issuing authority']
  },
  expiryDate: {
    type: Date,
    required: [true, 'Please add the expiry date']
  },
  certificateUrl: {
    type: String,
    required: [true, 'Please provide the certificate document URL']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewNotes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Certification', certificationSchema);

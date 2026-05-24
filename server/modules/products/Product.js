const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a product description']
  },
  category: {
    type: String,
    required: [true, 'Please specify a category']
  },
  sku: {
    type: String,
    unique: true
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price cannot be negative']
  },
  unitOfMeasure: {
    type: String,
    required: [true, 'Please add a unit of measure (e.g., kg, lbs)']
  },
  stockQuantity: {
    type: Number,
    required: [true, 'Please add a stock quantity'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  organicCertified: {
    type: Boolean,
    default: false
  },
  gmoFree: {
    type: Boolean,
    default: false
  },
  qualityGrade: {
    type: String,
    enum: ['A', 'B', 'C'],
    required: [true, 'Please add a quality grade']
  },
  harvestDate: Date,
  images: [String],
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive'],
    default: 'draft'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Set auto SKU before validation
productSchema.pre('validate', function (next) {
  if (!this.sku) {
    this.sku = 'PROD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);

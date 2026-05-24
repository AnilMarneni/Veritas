const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');

// Route files
const authRoutes = require('./modules/auth/authRoutes');
const userRoutes = require('./modules/users/userRoutes');
const productRoutes = require('./modules/products/productRoutes');
const certRoutes = require('./modules/certifications/certRoutes');
const orderRoutes = require('./modules/orders/orderRoutes');
const traceRoutes = require('./modules/traceability/traceRoutes');
const adminRoutes = require('./modules/admin/adminRoutes');

const app = express();

// CORS middleware setup
app.use(cors({
  origin: '*', // Allow connections from Vite frontend client
  credentials: true
}));

// Body parsing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Development logger
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Serve local upload files statically as fallback
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/certifications', certRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/traceability', traceRoutes);
app.use('/api/v1/admin', adminRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Veritas API Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// 404 Route handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;

require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Database
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Veritas Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`🏥 Health Check endpoint: http://localhost:${PORT}/health`);
  });
}).catch(err => {
  console.error('❌ Failed to start Veritas server:', err);
  process.exit(1);
});

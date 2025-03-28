require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const paymentRoutes = require('./routes/payments');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Database connection with error handling
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/payment_gateway');
    console.log('Connected to MongoDB');
  } catch (err) {
    console.log('Using in-memory database - MongoDB not available');
    // Fallback to in-memory data storage
  }
};
connectDB();

// Routes
app.use('/api/payments', paymentRoutes);

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
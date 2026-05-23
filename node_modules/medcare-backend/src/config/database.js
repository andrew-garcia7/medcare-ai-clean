const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    // ✅ ENV fallback
    const uri =
      process.env.NODE_ENV === 'production'
        ? process.env.MONGO_URI_PROD
        : process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/medcare';

    console.log('MONGO_URI:', process.env.MONGO_URI);
    console.log('uri:', uri);

    if (!uri) {
      throw new Error('MongoDB URI not defined in .env');
    }

    // ✅ Connect MongoDB
    const conn = await mongoose.connect(uri);

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);

    // ✅ Events
    mongoose.connection.on('error', (err) => {
      logger.error(`❌ MongoDB error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️ MongoDB disconnected...');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('🔁 MongoDB reconnected');
    });

  } catch (error) {
    logger.error(`❌ MongoDB connection failed: ${error.message}`);

    // Retry after 5 sec
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
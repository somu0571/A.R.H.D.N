const mongoose = require('mongoose');
const config = require('./index');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri);
    console.log(`[ARHDN] MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[ARHDN] MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

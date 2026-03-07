const mongoose = require("mongoose");

async function connectDB() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not set in environment variables");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    // eslint-disable-next-line no-console
    console.log("✅ MongoDB connected");
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("❌ MongoDB connection error", err.message);
    process.exit(1);
  }
}

module.exports = connectDB;


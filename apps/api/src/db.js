import mongoose from 'mongoose';

export async function connectDB() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/civicai';
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
    console.log(`🍃 [MongoDB] Successfully connected to database at ${mongoUri}`);
    return true;
  } catch (err) {
    console.warn(`⚠️ [MongoDB] Connection failed (${err.message}). Falling back to active in-memory store.`);
    return false;
  }
}

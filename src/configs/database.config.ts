import mongoose from "mongoose";
import configs from "./env.config";

let isConnected = false;

export const connectToMongo = async (): Promise<void> => {
  if (isConnected) return;

  try {
    await mongoose.connect(configs.database.mongoURI, {
      autoIndex: false,
    });

    isConnected = true;
    console.log("✅ MongoDB connected (Mongoose)");
  } catch (error) {
    console.error("❌ MongoDB connection failed", error);
    process.exit(1);
  }
};

export const disconnectFromMongo = async (): Promise<void> => {
  try {
    if (!isConnected) return;

    await mongoose.disconnect();
    isConnected = false;

    console.log("🔌 MongoDB disconnected");
  } catch (error) {
    console.error("❌ MongoDB disconnect failed", error);
  }
};

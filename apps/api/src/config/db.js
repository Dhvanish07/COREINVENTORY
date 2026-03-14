import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let memoryServer;

const connectWithUri = async (uri) => {
  await mongoose.connect(uri);
};

const startMemoryMongo = async () => {
  if (!memoryServer) {
    memoryServer = await MongoMemoryServer.create({
      binary: {
        version: process.env.MONGOMS_VERSION || "6.0.6"
      }
    });
  }

  const uri = memoryServer.getUri();
  await connectWithUri(uri);
  console.log("✅ In-memory MongoDB connected");
  console.log("ℹ️ Using ephemeral dev database (data resets when server stops)");
};

export const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI?.trim();

  if (!mongoURI) {
    console.log("⚠️ MONGO_URI not set. Starting in-memory MongoDB...");
    await startMemoryMongo();
    return;
  }

  try {
    await connectWithUri(mongoURI);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.log("⚠️ Failed to connect to MONGO_URI. Falling back to in-memory MongoDB...");
    await startMemoryMongo();
  }
};
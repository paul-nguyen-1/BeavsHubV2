import { MongoClient } from "mongodb";
import { config } from "dotenv";

config();
const client = new MongoClient(process.env.MONGO_URI || 'mongodb://localhost:27017/');
let isConnected = false;
export async function connectDB() {
  try {
    if (!isConnected) {
      await client.connect();
      isConnected = true;
      console.log("Connected to MongoDB");
    }
    return client.db(process.env.MONGO_DB_NAME);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

export async function closeDB() {
  try {
    if (isConnected) {
      await client.close();
      isConnected = false;
      console.log("Closed MongoDB connection");
    }
  } catch (error) {
    console.error("Error closing MongoDB connection:", error);
    throw error;
  }
}

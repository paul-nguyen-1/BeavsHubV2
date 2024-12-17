import { MongoClient } from "mongodb";
import { GoogleAuth, OAuth2Client } from "google-auth-library";
import { google, sheets_v4 } from "googleapis";
import { config } from "dotenv";

config();
const client = new MongoClient(process.env.MONGO_URI);
let isConnected = false;
let sheets: sheets_v4.Sheets | null = null;

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

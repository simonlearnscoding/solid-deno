import mongoose from "mongoose";

export async function connectDB() {
  // Use the correct connection string for Docker Compose
  const MONGO_URI =
    Deno.env.get("MONGO_URI") ||
    "mongodb://root:example@mongo:27017/myapp?authSource=admin";

  console.log("Connecting to MongoDB...");

  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB");
}

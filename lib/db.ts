import mongoose from "mongoose";

export async function connectDB() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(
    Deno.env.get("MONGO_URI") || "mongodb://root:example@localhost:27017/",
  );
  console.log("Connected to MongoDB");
}

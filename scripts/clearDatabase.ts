import mongoose from "mongoose";
import dotenv from "dotenv";

const MONGO_URI = Deno.env.get || "mongodb://root:example@localhost:27017";

async function clearDatabase() {
  await mongoose.connect(MONGO_URI);

  const collections = Object.keys(mongoose.connection.collections);

  for (const name of collections) {
    await mongoose.connection.collections[name].deleteMany({});
    console.log(`Cleared ${name}`);
  }

  console.log("Database cleared.");
  await mongoose.disconnect();
}

clearDatabase().catch(console.error);

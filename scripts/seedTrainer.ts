import mongoose from "mongoose";
import User from "../api/models/User.ts"; // adjust path

const MONGO_URI =
  Deno.env.get("MONGO_URI") || "mongodb://root:example@localhost:27017";

async function seedTrainer() {
  console.log(`Connecting to MongoDB at ${MONGO_URI}...`);
  await mongoose.connect(MONGO_URI);

  const trainer = await User.create({
    email: "trainer@example.com",
    password: "hashed_password_here", // pre-hash or seed plain if dev-only
    name: "Trainer Tony",
    avatarUrl: "https://placehold.co/100x100",
    roles: ["trainer"], // if you store roles
  });

  console.log("Trainer created:", trainer._id.toString());
  await mongoose.disconnect();
}

seedTrainer().catch(console.error);

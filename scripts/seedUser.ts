import mongoose from "mongoose";
import User from "../api/models/User.ts"; // adjust path to your User model
import bcrypt from "npm:bcryptjs@2.4.3"; // assuming you hash passwords

const MONGO_URI =
  Deno.env.get("MONGO_URI") || "mongodb://root:example@localhost:27017";

console.log(`Connecting to MongoDB at ${MONGO_URI}...`);
async function seedUser() {
  await mongoose.connect(MONGO_URI);

  const plainPassword = "123";
  const hashed = await bcrypt.hash(plainPassword, 12);

  const user = await User.create({
    email: "simon@example.com",
    password: hashed,
    name: "Random User",
    avatarUrl: "https://placehold.co/100x100",
    roles: ["student"],
  });

  console.log("User created:");
  console.log(`Email: ${user.email}`);
  console.log(`Password: ${plainPassword}`);
  console.log(`ID: ${user._id.toString()}`);

  await mongoose.disconnect();
}

seedUser().catch(console.error);

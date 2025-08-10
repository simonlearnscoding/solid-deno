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
    name: "Gina Lawson",
    avatarUrl:
      "https://plus.unsplash.com/premium_photo-1689551671541-31a345ce6ae0?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8YXZhdGFyc3xlbnwwfHwwfHx8MA%3D%3D",
    roles: ["trainer"], // if you store roles
  });

  console.log("Trainer created:", trainer._id.toString());
  await mongoose.disconnect();
}

seedTrainer().catch(console.error);

import mongoose from "mongoose";
import CourseMembership from "../api/models/CourseMembership.ts";
const MONGO_URI =
  Deno.env.get("MONGO_URI") || "mongodb://root:example@localhost:27017";

async function seedMembership(courseId: string, userId: string) {
  await mongoose.connect(MONGO_URI);

  await CourseMembership.create({
    course: courseId,
    user: userId,
    role: "student",
    status: "active",
    joinedAt: new Date(),
  });

  console.log("Membership created");
  await mongoose.disconnect();
}

// CLI: `ts-node scripts/seedMembership.ts <courseId> <userId>`
seedMembership(process.argv[2], process.argv[3]).catch(console.error);

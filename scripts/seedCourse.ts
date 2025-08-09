import mongoose from "mongoose";
import Course from "../api/models/Course.ts";
const MONGO_URI =
  Deno.env.get("MONGO_URI") || "mongodb://root:example@localhost:27017";

async function seedCourse(trainerId: string) {
  console.log(`Connecting to MongoDB at ${MONGO_URI}...`);
  await mongoose.connect(MONGO_URI);

  const course = await Course.create({
    trainer: trainerId,
    title: "Beginner Boxing",
    description: "Learn the basics of boxing",
    imageUrl: "https://placehold.co/600x400",
  });

  console.log("Course created:", course._id.toString());
  await mongoose.disconnect();
}

// Pass trainerId from CLI arg: `ts-node scripts/seedCourse.ts <trainerId>`
seedCourse(process.argv[2]).catch(console.error);

import mongoose from "mongoose";
import TrainingAttendance from "../api/models/TrainingAttendance.ts";
const MONGO_URI =
  Deno.env.get("MONGO_URI") || "mongodb://root:example@localhost:27017";

async function seedCourse(trainerId: string) {
  console.log(`Connecting to MongoDB at ${MONGO_URI}...`);
  await mongoose.connect(MONGO_URI);

  const attendance = await TrainingAttendance.create({
    training: "6897733feb7a9ad430b4a32d",
    user: "68977151118a469901c82c5d",
    isAttending: true,
  });

  await mongoose.disconnect();
}

// Pass trainerId from CLI arg: `ts-node scripts/seedCourse.ts <trainerId>`
seedCourse().catch(console.error);

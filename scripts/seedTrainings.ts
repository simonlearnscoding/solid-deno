import mongoose from "mongoose";
import Training from "../api/models/Training.ts";
const MONGO_URI =
  Deno.env.get("MONGO_URI") || "mongodb://root:example@localhost:27017";

async function seedTrainings(courseId: string, trainerId: string) {
  await mongoose.connect(MONGO_URI);

  const now = new Date();
  const trainingsData = Array.from({ length: 5 }).map((_, i) => {
    const start = new Date(now);
    start.setDate(now.getDate() + i * 2);
    start.setHours(18, 0, 0, 0);

    const end = new Date(start);
    end.setHours(end.getHours() + 1);

    return {
      course: courseId,
      trainer: trainerId,
      title: `Boxing Session ${i + 1}`,
      description: "Drills, combos, conditioning",
      location: "Downtown Gym",
      startsAt: start,
      endsAt: end,
    };
  });

  const trainings = await Training.insertMany(trainingsData);
  console.log(`Created ${trainings.length} trainings`);
  await mongoose.disconnect();
}

// CLI args: `ts-node scripts/seedTrainings.ts <courseId> <trainerId>`
seedTrainings(process.argv[2], process.argv[3]).catch(console.error);

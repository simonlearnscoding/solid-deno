import mongoose from "mongoose";
import Course from "../api/models/Course.ts";
const MONGO_URI =
  Deno.env.get("MONGO_URI") || "mongodb://root:example@localhost:27017";

async function seedCourse(trainerId: string) {
  console.log(`Connecting to MongoDB at ${MONGO_URI}...`);
  await mongoose.connect(MONGO_URI);

  const course = await Course.create({
    trainer: trainerId,
    title: "Pilates Sundays",
    description:
      "Join us for a rejuvenating Pilates session every Sunday. This class is designed to improve your core strength, flexibility, and overall body awareness. Suitable for all levels, from beginners to advanced practitioners.",
    imageUrl:
      "https://images.ctfassets.net/8urtyqugdt2l/72aT9RfcJ0w20zXQDMDd1t/2e55e3e37c035ba44bd795c777f11f85/What_is_pilates_desktop.jpg",
  });

  console.log("Course created:", course._id.toString());
  await mongoose.disconnect();
}

// Pass trainerId from CLI arg: `ts-node scripts/seedCourse.ts <trainerId>`
seedCourse(process.argv[2]).catch(console.error);

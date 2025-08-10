// scripts/seedTrainingsForAllCourses.ts
import mongoose from "mongoose";
import Training from "../api/models/Training.ts";
import Course from "../api/models/Course.ts"; // ensure this path matches your project

// Works with Deno or Node envs
const MONGO_URI =
  (globalThis as any).Deno?.env?.get?.("MONGO_URI") ??
  process.env.MONGO_URI ??
  "mongodb://root:example@localhost:27017";

// CLI: ts-node scripts/seedTrainingsForAllCourses.ts [defaultTrainerId]
const defaultTrainerId = process.argv[2]; // optional

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// bias hours slightly towards evening sessions
function randomHour(): number {
  const buckets = [
    // morning
    ...Array(3).fill(7),
    ...Array(2).fill(8),
    ...Array(2).fill(9),
    // midday
    ...Array(2).fill(12),
    ...Array(2).fill(13),
    ...Array(2).fill(14),
    // evening (heavier weight)
    ...Array(4).fill(17),
    ...Array(4).fill(18),
    ...Array(4).fill(19),
    ...Array(3).fill(20),
  ];
  return buckets[randInt(0, buckets.length - 1)];
}

function randomMinutes(): 0 | 30 {
  return Math.random() < 0.5 ? 0 : 30;
}

async function seedForCourse(course: any, fallbackTrainerId?: string) {
  const count = randInt(5, 13);
  const created: any[] = [];

  // Ensure we don’t duplicate exact same start times for the same course
  const usedStartISO = new Set<string>();

  for (let i = 0; i < count; i++) {
    // Pick a day in the next 30 days
    const start = new Date();
    start.setDate(start.getDate() + randInt(1, 30));
    start.setHours(randomHour(), randomMinutes(), 0, 0);

    // If accidentally hit a duplicate slot, nudge by +1 hour
    let attempts = 0;
    while (usedStartISO.has(start.toISOString()) && attempts < 5) {
      start.setHours(start.getHours() + 1);
      attempts++;
    }
    usedStartISO.add(start.toISOString());

    // Duration 45–90min
    const durationMin = [45, 60, 75, 90][randInt(0, 3)];
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + durationMin);

    created.push({
      course: course._id,
      trainer: course.trainer ?? fallbackTrainerId, // prefer course.trainer if it exists
      title: course.title, // same as course title
      description: course.description ?? "Scheduled training session",
      location: course.location ?? "Main Gym",
      startsAt: start,
      endsAt: end,
    });
  }

  // Filter out any items missing trainer (if neither course.trainer nor fallback provided)
  const withTrainer = created.filter((t) => !!t.trainer);
  if (
    withTrainer.length !== created.length &&
    !fallbackTrainerId &&
    !course.trainer
  ) {
    console.warn(
      `Skipped ${created.length - withTrainer.length} trainings for course "${course.title}" due to missing trainer.`,
    );
  }

  if (withTrainer.length) {
    const res = await Training.insertMany(withTrainer);
    console.log(`Course "${course.title}": created ${res.length} trainings`);
  } else {
    console.log(
      `Course "${course.title}": no trainings created (no trainer available).`,
    );
  }
}

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to Mongo");

  const courses = await Course.find(
    {},
    { title: 1, trainer: 1, description: 1, location: 1 },
  ).lean();
  if (!courses.length) {
    console.log("No courses found. Exiting.");
    await mongoose.disconnect();
    return;
  }

  for (const course of courses) {
    await seedForCourse(course, defaultTrainerId);
  }

  await mongoose.disconnect();
  console.log("Done.");
}

main().catch(async (err) => {
  console.error(err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});

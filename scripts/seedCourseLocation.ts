// scripts/seedCourseGeo.ts
import mongoose from "mongoose";
import Course from "../api/models/Course.ts";

// ---------- Config ----------
const MONGO_URI =
  Deno.env.get("MONGO_URI") || "mongodb://root:example@localhost:27017";

const BATCH_SIZE = 500;
const SERVER_SELECTION_TIMEOUT_MS = 8000;
const SOCKET_TIMEOUT_MS = 20000;

// Turn OFF strictQuery so filters on fields you just added (location) are not stripped
mongoose.set("strictQuery", false);

// ---------- Utils ----------
function randIn(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
function randomZurichPoint(): [number, number] {
  const lng = randIn(8.47, 8.65);
  const lat = randIn(47.33, 47.43);
  return [Number(lng.toFixed(6)), Number(lat.toFixed(6))];
}

const streets = [
  "Bahnhofstrasse",
  "Langstrasse",
  "Europaallee",
  "Limmatquai",
  "Seefeldstrasse",
  "Badenerstrasse",
  "Uetlibergstrasse",
  "Schaffhauserstrasse",
  "Rigistrasse",
  "Sihlquai",
  "Zurlindenstrasse",
  "Birmensdorferstrasse",
  "Kalkbreitestrasse",
  "Rämistrasse",
  "Universitätsstrasse",
  "Rosengartenstrasse",
  "Wiedikonergasse",
  "Hottingerstrasse",
  "Feldstrasse",
  "Kanonengasse",
];
const zips = [
  8001, 8002, 8003, 8004, 8005, 8006, 8008, 8032, 8044, 8045, 8046, 8047, 8048,
  8050, 8051, 8052, 8053, 8055, 8057,
];

function randomAddress() {
  const street = streets[Math.floor(Math.random() * streets.length)];
  const number = Math.floor(Math.random() * 120) + 1;
  const zip = zips[Math.floor(Math.random() * zips.length)];
  return `${street} ${number}, ${zip} Zürich`;
}

async function bulkWriteInChunks(ops: any[]) {
  let modified = 0;
  for (let i = 0; i < ops.length; i += BATCH_SIZE) {
    const chunk = ops.slice(i, i + BATCH_SIZE);
    console.time(`bulkWrite[${i}-${i + chunk.length - 1}]`);
    const res = await Course.bulkWrite(chunk, { ordered: false });
    console.timeEnd(`bulkWrite[${i}-${i + chunk.length - 1}]`);
    modified += res.modifiedCount ?? 0;
    console.log(
      `  ✔ chunk modified=${res.modifiedCount ?? 0} upserts=${res.upsertedCount ?? 0}`,
    );
  }
  return modified;
}

async function run({ onlyMissing = true, dryRun = false } = {}) {
  console.time("connect");
  await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: SERVER_SELECTION_TIMEOUT_MS,
    socketTimeoutMS: SOCKET_TIMEOUT_MS,
  } as any);
  console.timeEnd("connect");
  console.log(
    "Connected DB:",
    mongoose.connection.name,
    "Collection:",
    Course.collection.collectionName,
  );

  // Ensure 2dsphere index (safe if exists)
  console.time("ensureIndex");
  try {
    await Course.collection.createIndex({ location: "2dsphere" });
  } catch {}
  console.timeEnd("ensureIndex");

  // Sanity counts (helps diagnose)
  const total = await Course.countDocuments({});
  const haveLoc = await Course.countDocuments({ location: { $exists: true } });
  const missingLoc = await Course.countDocuments({
    location: { $exists: false },
  });
  console.log(
    `Courses total=${total} | with location=${haveLoc} | missing location=${missingLoc}`,
  );

  // Match filter
  const match = onlyMissing
    ? {
        $or: [
          { location: { $exists: false } },
          { "location.coordinates.0": { $exists: false } },
        ],
      }
    : {};

  console.time("findCourses");
  const courses = await Course.find(match).select("_id title").lean();
  console.timeEnd("findCourses");
  console.log(`Found courses to update: ${courses.length}`);

  if (!courses.length) {
    await mongoose.disconnect();
    console.log("Nothing to update. Done.");
    return;
  }

  // Build updates
  console.time("buildOps");
  const ops = courses.map((c, idx) => {
    const coordinates = randomZurichPoint(); // [lng, lat]
    const address = randomAddress();
    const alreadyHas =
      typeof c.title === "string" && /\s+in\s+zuerich\s*$/i.test(c.title);
    const newTitle = alreadyHas ? c.title : `${c.title} in zuerich`;

    if (idx < 5) {
      console.log(
        `#${idx}: "${c.title}" -> "${newTitle}" | ${coordinates.join(", ")} | ${address}`,
      );
    }

    return {
      updateOne: {
        filter: { _id: c._id },
        update: {
          $set: {
            title: newTitle,
            address,
            city: "Zürich",
            country: "Switzerland",
            location: { type: "Point", coordinates },
          },
        },
      },
    };
  });
  console.timeEnd("buildOps");
  console.log(`Built ops: ${ops.length}`);

  if (dryRun) {
    console.warn("DRY RUN — no writes performed.");
    await mongoose.disconnect();
    return;
  }

  console.time("bulkWrite(total)");
  const modified = await bulkWriteInChunks(ops);
  console.timeEnd("bulkWrite(total)");
  console.log(`Total modified: ${modified}`);

  console.time("disconnect");
  await mongoose.disconnect();
  console.timeEnd("disconnect");
  console.log("Done.");
}

// -------- CLI --------
const args = process.argv.slice(2);
run({
  onlyMissing: !args.includes("--all"),
  dryRun: args.includes("--dry-run"),
}).catch(async (e) => {
  console.error("SEED ERROR:", e);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});

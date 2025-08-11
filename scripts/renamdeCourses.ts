// scripts/cloneCoursesToLugano.ts
import mongoose from "mongoose";
import Course from "../api/models/Course.ts";

// --- DB ---
const MONGO_URI =
  Deno.env.get("MONGO_URI") || "mongodb://root:example@localhost:27017";

// CLI flags (optional):
//   --from=Zürich
//   --to=Lugano
const args = new Map<string, string>(
  Deno.args
    .filter((a) => a.startsWith("--"))
    .map((a) => a.replace(/^--/, ""))
    .map((a) => {
      const [k, ...rest] = a.split("=");
      return [k, rest.join("=")];
    }),
);

const FROM_CITY = args.get("from") || "Zürich";
const TO_CITY = args.get("to") || "Lugano";

// --- Random Lugano helpers ---
function randIn(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

// Rough Lugano bounding box (WGS84)
// lng: ~8.90–9.02, lat: ~45.97–46.05
function randomLuganoPoint(): [number, number] {
  const lng = randIn(8.9, 9.02);
  const lat = randIn(45.97, 46.05);
  return [Number(lng.toFixed(6)), Number(lat.toFixed(6))];
}

const luganoStreets = [
  "Via Nassa",
  "Viale Castagnola",
  "Viale Cattaneo",
  "Via Pioda",
  "Via Magatti",
  "Via Cantonale",
  "Via Zurigo",
  "Via al Forte",
  "Via San Salvatore",
  "Via Maraini",
  "Via Brentani",
  "Via Balestra",
  "Via Lambertenghi",
  "Via Giacometti",
  "Via Ciani",
];

const luganoZips = [6900, 6901, 6902, 6903, 6912, 6914, 6915, 6917, 6924];

function randomLuganoAddress() {
  const street =
    luganoStreets[Math.floor(Math.random() * luganoStreets.length)];
  const number = Math.floor(Math.random() * 120) + 1;
  const zip = luganoZips[Math.floor(Math.random() * luganoZips.length)];
  return `${street} ${number}, ${zip} Lugano`;
}

// Title transform: replace “Zürich/Zuerich” with target, else append
function toCityInTitle(title: string, targetCity: string, fromCity: string) {
  const re = new RegExp(`\\b(${fromCity}|Zuerich|zuerich)\\b`, "i");
  if (re.test(title)) return title.replace(re, targetCity);
  // Also remove any legacy ":Ü" if present
  const cleaned = title.replace(/:Ü\s*$/i, "").trim();
  // And remove any trailing "in zuerich"
  const cleaned2 = cleaned.replace(/\s+in\s+zuerich\s*$/i, "").trim();
  // Append target once
  const alreadyHas = new RegExp(`\\b${targetCity}\\b`, "i").test(cleaned2);
  return alreadyHas ? cleaned2 : `${cleaned2} ${targetCity}`;
}

await mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 8000,
  socketTimeoutMS: 20000,
});

console.log(`Connected → ${MONGO_URI}`);
console.log(`Cloning courses from "${FROM_CITY}" → "${TO_CITY}"`);

const source = await Course.find({
  city: { $regex: new RegExp(`^${FROM_CITY}$`, "i") },
}).lean();

console.log(`Found ${source.length} source course(s) in ${FROM_CITY}`);
if (!source.length) {
  await mongoose.disconnect();
  console.log("Nothing to clone. Done.");
  Deno.exit(0);
}

// Build new course docs
const docs = source.map((c, i) => {
  const [lng, lat] = randomLuganoPoint();
  const address = randomLuganoAddress();

  const newTitle = toCityInTitle(
    String(c.title || "Course"),
    TO_CITY,
    FROM_CITY,
  );

  if (i < 5) {
    console.log(
      `#${i}: "${c.title}" -> "${newTitle}" | ${address} | ${lng},${lat}`,
    );
  }

  return {
    // keep trainer & image & description
    trainer: c.trainer,
    title: newTitle,
    description: c.description ?? "",
    imageUrl: c.imageUrl ?? "",
    // new city/address/country
    address,
    city: TO_CITY,
    country: "Switzerland",
    // GeoJSON
    location: {
      type: "Point",
      coordinates: [lng, lat], // [lng, lat]
    },
  };
});

// Insert as brand new docs
const res = await Course.insertMany(docs, { ordered: false });
console.log(`Inserted ${res.length} course(s) for ${TO_CITY}`);

await mongoose.disconnect();
console.log("Done.");

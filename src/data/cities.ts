// data/cities.ts
export type City = {
  name: string;
  country: "CH";
  slug: string;
  center: { lng: number; lat: number };
  radiusKm?: number; // for /near
  bbox?: [number, number, number, number]; // swLng, swLat, neLng, neLat for /in-bounds
  priority?: number; // for “top cities”
  aliases?: string[]; // e.g. “Zuerich”, “Zurigo”
};

export const CITIES: City[] = [
  {
    name: "Zurich",
    country: "CH",
    slug: "zurich",
    center: { lng: 8.5417, lat: 47.3769 },
    radiusKm: 20,
    bbox: [8.39, 47.31, 8.73, 47.46],
    priority: 100,
    aliases: ["Zürich", "Zuerich", "Zurigo"],
  },
  {
    name: "Lugano",
    country: "CH",
    slug: "lugano",
    center: { lng: 8.9511, lat: 46.0037 },
    radiusKm: 15,
    bbox: [8.86, 45.95, 9.05, 46.06],
    priority: 90,
  },
  {
    name: "Basel",
    country: "CH",
    slug: "basel",
    center: { lng: 7.5886, lat: 47.5596 },
    radiusKm: 18,
    priority: 85,
  },
  // add Geneva, Bern, Lausanne, Winterthur, St. Gallen, etc.
];

import Fuse from "https://esm.sh/fuse.js@6.6.2";
import { CITIES, type City } from "../data/cities.ts";

const fuse = new Fuse<City>(CITIES, {
  keys: ["name", "aliases", "slug"],
  threshold: 0.3,
  ignoreLocation: true,
});

export function searchCities(q: string): City[] {
  if (!q.trim())
    return CITIES.slice()
      .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
      .slice(0, 8);
  return fuse
    .search(q)
    .map((r: any) => r.item)
    .slice(0, 8);
}

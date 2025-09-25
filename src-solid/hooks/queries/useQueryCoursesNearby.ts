// hooks/queries/useQueryCoursesNearby.ts
import { useQuery } from "@tanstack/solid-query";
import type { Accessor } from "solid-js";

type Center = { lng: number; lat: number };
type City = { center: Center; radiusKm?: number };
type MaybeAccessor<T> = T | Accessor<T>;

const unwrap = <T>(v: MaybeAccessor<T>): T =>
  typeof v === "function" ? (v as any)() : v;

const fetchCoursesNearby = async (
  center: Center,
  opts?: {
    max?: number;
    limit?: number;
    format?: "flat" | "geojson";
    q?: string;
  },
): Promise<any> => {
  const url = new URL("http://localhost:8000/courses/near");
  url.searchParams.set("lng", String(center.lng));
  url.searchParams.set("lat", String(center.lat));
  if (opts?.max) url.searchParams.set("max", String(opts.max));
  if (opts?.limit) url.searchParams.set("limit", String(opts.limit));
  if (opts?.format) url.searchParams.set("format", opts.format);
  if (opts?.q) url.searchParams.set("q", opts.q);
  const res = await fetch(url.toString(), { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch nearby courses");
  return res.json();
};

export default function useQueryCoursesNearby(
  cityAcc: MaybeAccessor<City | null>,
  opts?: {
    max?: MaybeAccessor<number | undefined>;
    limit?: MaybeAccessor<number | undefined>;
    format?: "flat" | "geojson";
    q?: MaybeAccessor<string | undefined>;
  },
) {
  return useQuery(() => {
    const city = unwrap(cityAcc);
    const center = city?.center; // <-- extract here
    const max = unwrap(opts?.max);
    const limit = unwrap(opts?.limit);
    const qStr = unwrap(opts?.q);
    const fmt = opts?.format;

    return {
      queryKey: [
        "courses",
        "near",
        center?.lng,
        center?.lat,
        fmt,
        max,
        limit,
        qStr,
      ],
      enabled: !!center,
      queryFn: () =>
        fetchCoursesNearby(center!, { max, limit, format: fmt, q: qStr }),
      staleTime: 5 * 60 * 1000,
    };
  });
}

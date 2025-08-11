// hooks/queries/useQueryCoursesInBounds.ts
import { useQuery } from "@tanstack/solid-query";

export type Bounds = {
  swLng: number;
  swLat: number;
  neLng: number;
  neLat: number;
};

export type CourseInBounds = {
  _id: string;
  title: string;
  imageUrl?: string | null;
  city?: string | null;
  location: { type: "Point"; coordinates: [number, number] }; // [lng, lat]
};

// hooks/queries/useQueryCoursesInBounds.ts
import { type Accessor } from "solid-js";

export default function useQueryCoursesInBounds(
  boundsAcc: Accessor<Bounds | undefined>,
  qAcc: Accessor<string> = () => "",
) {
  return useQuery(() => {
    const bounds = boundsAcc(); // <-- reactive read
    const q = qAcc(); // <-- reactive read

    return {
      queryKey: ["courses-in-bounds", bounds, q],
      enabled: !!bounds,
      staleTime: 5_000,
      gcTime: 60_000,
      queryFn: async ({ signal }) => {
        if (!bounds) return [];
        const url = new URL("http://localhost:8000/courses/in-bounds");
        Object.entries({ ...bounds, limit: 300 }).forEach(([k, v]) =>
          url.searchParams.set(k, String(v)),
        );
        const res = await fetch(url.toString(), {
          signal,
          credentials: "include", // <-- likely needed like your other query
          mode: "cors", // optional, helps during dev
        });
        if (!res.ok) throw new Error("Failed to fetch courses in bounds");
        const data = (await res.json()) as CourseInBounds[];
        const qq = q.trim().toLowerCase();
        return qq
          ? data.filter((c) =>
              [c.title, c.city]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
                .includes(qq),
            )
          : data;
      },
    };
  });
}

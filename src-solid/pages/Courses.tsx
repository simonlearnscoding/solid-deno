import CourseCard from "../components/CourseCard.tsx";

import CityPicker from "../components/CityPicker.tsx";
import { type City, CITIES } from "../data/cities.ts";
import useQueryCoursesNearby from "../hooks/queries/useQueryCoursesNearby.ts";

import {
  createSignal,
  For,
  Suspense,
  Show,
  createMemo,
  onMount,
} from "solid-js";

import Map from "../components/Map.tsx";
import useQueryCoursesInBounds, {
  type Bounds,
} from "../hooks/queries/useQueryCoursesInBounds.ts";

function bboxFromCenterRadius(
  center: { lng: number; lat: number },
  radiusMeters: number,
): Bounds {
  const R = 6371000,
    dLat = (radiusMeters / R) * (180 / Math.PI);
  const dLng =
    (radiusMeters / (R * Math.cos((center.lat * Math.PI) / 180))) *
    (180 / Math.PI);
  return {
    swLng: center.lng - dLng,
    swLat: center.lat - dLat,
    neLng: center.lng + dLng,
    neLat: center.lat + dLat,
  };
}

export default function Courses() {
  const [bounds, setBounds] = createSignal<Bounds | undefined>(undefined);
  const [selectedId, setSelectedId] = createSignal<string | null>(null);
  const [city, setCity] = createSignal<City | null>(null);
  const q = useQueryCoursesNearby(city, {
    format: "flat",
    max: city()?.radiusKm ? city()!.radiusKm! * 1000 : 15000,
  });
  const [query, setQuery] = createSignal("");

  onMount(() => {
    if (!city()) {
      const zurich = CITIES.find((c) => c.slug === "lugano");
      if (zurich) {
        setCity(zurich);
        setBounds(
          bboxFromCenterRadius(zurich.center, (zurich.radiusKm ?? 10) * 1000),
        );
      }
    }
  });

  // --- filtering helpers ---
  const norm = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");

  const filtered = createMemo(() => {
    const data = q.data ?? [];
    const qv = norm(query().trim());
    if (!qv) return data;

    return data.filter((c: any) => {
      const hay = [
        c.title ?? c.name,
        c.description,
        c.city,
        c.location?.name,
        c.provider?.name,
        ...(Array.isArray(c.tags) ? c.tags : []),
      ]
        .filter(Boolean)
        .map((s: string) => norm(String(s)))
        .join(" ");

      return hay.includes(qv);
    });
  });
  // -------------------------
  //
  //
  // fetch markers for current bounds
  const inBounds = useQueryCoursesInBounds(bounds, query);

  const markers = createMemo(() =>
    (inBounds.data ?? []).map((c: any) => ({
      id: String(c._id ?? c.id),
      title: c.title,
      lng: c.location.coordinates[0],
      lat: c.location.coordinates[1],
    })),
  );

  const mapCenter = createMemo(() => ({
    lng: city()?.center.lng ?? 8.95,
    lat: city()?.center.lat ?? 46.17,
  }));

  return (
    <main class="h-dvh max-h-dvh flex flex-col">
      <header class="px-4 lg:px-6 py-4 flex items-center justify-between">
        <h1 class="text-xl lg:text-2xl font-semibold">
          Find your dream course today
        </h1>
        <div class="flex items-center gap-2 lg:gap-4">
          <CityPicker
            onPick={(c) => {
              setCity(c);
              setQuery(""); // reset search on city change
              setBounds(
                bboxFromCenterRadius(c.center, (c.radiusKm ?? 10) * 1000),
              ); // seed bounds
            }}
            selected={city() || null}
          />
          <div class="hidden lg:block w-80">
            <input
              type="text"
              placeholder="Search..."
              value={query()}
              onInput={(e) => setQuery(e.currentTarget.value)}
              class="input input-bordered w-full"
            />
          </div>
        </div>
      </header>

      {/* Mobile search */}
      <div class="px-4 pb-3 lg:hidden">
        <input
          type="text"
          placeholder="Search..."
          value={query()}
          onInput={(e) => setQuery(e.currentTarget.value)}
          class="input input-bordered w-full"
        />
      </div>

      <div class="flex-1 min-h-0 lg:grid lg:grid-cols-[1fr_minmax(420px,42vw)] lg:gap-4 lg:px-6 lg:pb-4">
        <section class="min-h-0 overflow-y-auto px-4 lg:px-0">
          <Suspense
            fallback={
              <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 p-1">
                {Array.from({ length: 8 }).map(() => (
                  <div class="skeleton w-full h-52 rounded-xl" />
                ))}
              </div>
            }
          >
            <Show
              when={filtered().length}
              fallback={<p class="px-1 py-8 opacity-60">No courses yet.</p>}
            >
              <div class="flex flex-col gap-4 lg:flex-row lg:flex-wrap">
                <For each={filtered()}>
                  {(course) => (
                    <div class="lg:basis-[calc(33.333%-1rem)] xl:basis-[calc(25%-1rem)] flex-shrink-0">
                      <CourseCard variant="search" course={course} />
                    </div>
                  )}
                </For>
              </div>
              <div class="h-4" />
            </Show>
          </Suspense>
        </section>

        <aside class="block">
          <div class="sticky top-4 h-[calc(100dvh-8rem)] rounded-2xl overflow-hidden shadow bg-base-100">
            <Map
              center={mapCenter} // accessor
              zoom={11} // number (optional)
              onBoundsChanged={(b) => setBounds(b)}
            />
          </div>
        </aside>
      </div>
    </main>
  );
}

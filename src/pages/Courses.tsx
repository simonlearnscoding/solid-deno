import { createSignal, For, Suspense, Show } from "solid-js";
import useQueryCourses from "../hooks/queries/useQueryCourses.ts";
import CourseCard from "../components/CourseCard.tsx";

export default function Courses() {
  const q = useQueryCourses();
  const [query, setQuery] = createSignal("");

  return (
    <main class="h-dvh max-h-dvh flex flex-col">
      {/* Top bar */}
      <header class="px-4 lg:px-6 py-4 flex items-center justify-between">
        <h1 class="text-xl lg:text-2xl font-semibold">
          Find your dream course today
        </h1>
        <div class="hidden lg:block w-80">
          <input
            type="text"
            placeholder="Search..."
            value={query()}
            onInput={(e) => setQuery(e.currentTarget.value)}
            class="input input-bordered w-full"
          />
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

      {/* Split layout at lg: list + map */}
      <div class="flex-1 min-h-0 lg:grid lg:grid-cols-[1fr_minmax(420px,42vw)] lg:gap-4 lg:px-6 lg:pb-4">
        {/* LEFT: results list (scrollable) */}
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
              when={q.data?.length}
              fallback={<p class="px-1 py-8 opacity-60">No courses yet.</p>}
            >
              {/* Mobile: rows (one per line). Desktop: flex-wrap cards */}
              <div class="flex flex-col gap-4 lg:flex-row lg:flex-wrap">
                <For each={q.data}>
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

        {/* RIGHT: sticky map on desktop */}
        <aside class="hidden lg:block">
          <div class="sticky top-4 h-[calc(100dvh-8rem)] rounded-2xl overflow-hidden shadow bg-base-100">
            {/* Replace this placeholder with your map component */}
            <div id="map" class="w-full h-full">
              {/* e.g. <Map center={...} markers={q.data} /> */}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

import { createSignal, For, Suspense } from "solid-js";
import useQueryCourses from "../hooks/queries/useQueryCourses.ts";

import CourseCard from "../components/CourseCard.tsx";

export default function Courses() {
  const q = useQueryCourses();
  const [query, setQuery] = createSignal("");

  return (
    <main class="flex flex-col h-dvh max-h-dvh items-center">
      <h1 class="mb-4 mt-6 ">Find your dream course today</h1>

      <input
        type="text"
        placeholder="Search..."
        value={query()}
        onInput={(e) => setQuery(e.currentTarget.value)}
        class="input input-bordered w-full max-w-xs mb-4"
      />

      <div class="flex flex-col flex-1 overflow-y-auto w-full px-8 gap-2 min-h-0">
        <Suspense
          fallback={Array.from({ length: 8 }, () => (
            <div class="skeleton w-full h-48 bg-gray-200 rounded-lg"></div>
          ))}
        >
          <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <For each={q.data}>
              {(course) => <CourseCard variant="search" course={course} />}
            </For>
          </div>
        </Suspense>
      </div>
    </main>
  );
}

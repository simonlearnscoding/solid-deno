import { createSignal, For, Suspense } from "solid-js";
import useQueryCourses from "../hooks/queries/useQueryCourses.ts";
import { Courses } from "../data/courses.ts";

import CourseCard from "../components/CourseCard.tsx";
export default function Profile() {
  const q = useQueryCourses(); // Uncomment this if you want to fetch from API
  const [query, setQuery] = createSignal("");

  const filteredCourses = () =>
    Courses.filter(
      (course) =>
        course.name.toLowerCase().includes(query().toLowerCase()) ||
        course.description.toLowerCase().includes(query().toLowerCase()),
    );

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
          <For each={q.data || filteredCourses()}>
            {(course) => <CourseCard course={course} />}
          </For>
        </Suspense>
      </div>
    </main>
  );
}

import { createSignal, For } from "solid-js";
import { Courses } from "../data/courses.ts";

const CourseCard = (props: { course: (typeof Courses)[0] }) => {
  return (
    <div class="card w-full h-fit card-sm hover:bg-base-300 cursor-pointer transition-colors bg-base-100 shadow-sm">
      <div class="py-5 px-4 flex">
        <div class="avatar avatar-placeholder">
          <div class="bg-neutral text-neutral-content w-10 h-10 rounded-full flex items-center justify-center">
            <span class="text-xs">UI</span>
          </div>
        </div>

        <div class="flex flex-col items-start pl-6 w-full">
          <h3>{props.course.name}</h3>
          <div class="max-w-11/12">
            <div class="truncate">{props.course.description}</div>
          </div>
          <div class="flex gap-2 mt-2">
            <For each={props.course.tags}>
              {(tag) => <div class="badge badge-outline">{tag}</div>}
            </For>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Profile() {
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
        <For each={filteredCourses()}>
          {(course) => <CourseCard course={course} />}
        </For>
      </div>
    </main>
  );
}

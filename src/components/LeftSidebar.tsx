import useQueryMyCourses from "../hooks/queries/useQueryMyCourses.ts";

import { type Course } from "./../../types/index.ts";
import CourseCard from "./CourseCard.tsx";
import type { Accessor } from "solid-js";

export default function LeftSidebar(props: {
  search: Accessor<string>;
  onSearch: (value: string) => void;
}) {
  const coursesQuery = useQueryMyCourses();

  return (
    <div class="w-96 flex-col gap-3 pr-4 pt-4 bg-base-200 hidden lg:flex">
      {/* Search card */}
      <div class="card bg-base-100 rounded-md shadow-sm">
        <div class="card-body">
          <div class="card-title">Search</div>
          <label class="input">
            <svg
              class="h-[1em] opacity-50"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <g
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeWidth="2.5"
                fill="none"
                stroke="currentColor"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </g>
            </svg>
            <input
              type="search"
              class="grow"
              value={props.search()}
              onInput={(e) => props.onSearch(e.currentTarget.value)}
              placeholder="Search trainings..."
            />
          </label>
        </div>
      </div>

      {/* My Courses */}
      <div class="card bg-base-100 rounded-md  shadow-sm flex-1">
        <div class="card-body gap-3">
          <div class="card-title">My Courses</div>

          {coursesQuery.isLoading && (
            <span class="loading loading-spinner"></span>
          )}

          {coursesQuery.isError && (
            <div class="text-error text-sm">Failed to load courses</div>
          )}

          {coursesQuery.data && coursesQuery.data.length > 0 ? (
            <ul class="menu gap-2 w-full">
              <For each={coursesQuery.data}>
                {(course: Course) => (
                  <li>
                    <CourseCard course={course} variant="sidebar" />
                  </li>
                )}
              </For>
            </ul>
          ) : (
            !coursesQuery.isLoading && (
              <div class="text-sm opacity-70">No active courses</div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

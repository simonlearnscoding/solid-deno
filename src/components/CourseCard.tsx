// components/CourseCard.tsx
import { type Course } from "./../../types/index.ts";
import { A } from "@solidjs/router";
import { For } from "solid-js";

export default function CourseCard(props: { course: Course }) {
  return (
    <A
      href={`/courses/${props.course.id}`}
      class="card w-full h-fit card-sm hover:bg-base-300 cursor-pointer transition-colors bg-base-100 shadow-sm"
    >
      <div class="py-5 px-4 flex">
        <div class="avatar avatar-placeholder">
          <div class="bg-neutral text-neutral-content w-10 h-10 rounded-full flex items-center justify-center">
            <span class="text-xs">UI</span>
          </div>
        </div>

        <div class="flex flex-col items-start pl-6 w-full">
          <h3>{props.course.title}</h3>
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
    </A>
  );
}

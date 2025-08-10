// components/CourseCard.tsx
import { type Course } from "./../../types/index.ts";
import { A } from "@solidjs/router";

export default function CourseCard(props: { course: Course }) {
  const c = props.course;

  return (
    <A
      href={`/courses/${c.id}`}
      aria-label={`${c.title} by ${c.trainer?.name ?? "Unknown"} at Downtown Gym`}
      class="card group w-full overflow-hidden rounded-2xl bg-base-100 shadow-sm hover:shadow transition"
    >
      {/* Hero image */}
      <figure class="h-40 md:h-44 overflow-hidden">
        <img
          src={c.imageUrl || "https://placehold.co/800x450"}
          alt={c.title}
          loading="lazy"
          class="h-full w-full object-cover"
        />
      </figure>

      {/* Body */}
      <div class="card-body p-4 md:p-5 gap-2">
        {/* Title */}
        <h3 class="card-title text-lg md:text-xl leading-tight">{c.title}</h3>

        {/* Trainer */}
        <div class="flex items-center gap-3">
          <img
            src={c.trainer?.avatarUrl || "https://placehold.co/96x96"}
            alt={c.trainer?.name || "Trainer avatar"}
            class="h-9 w-9 rounded-full object-cover"
          />
          <div class="leading-tight">
            <div class="font-medium">{c.trainer?.name ?? "Trainer"}</div>
            <div class="text-xs md:text-sm opacity-70">
              {c.trainer?.qualifiedName ?? "Coach"}
            </div>
          </div>
        </div>

        {/* One-line tagline/description */}
        <p class="text-sm md:text-base opacity-80 overflow-hidden text-ellipsis whitespace-nowrap">
          {c.description ?? "Learn and practice with a certified coach."}
        </p>

        {/* Meta: placeholder schedule + location */}
        <div class="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm md:text-[15px] opacity-80">
          <span class="inline-flex items-center gap-1">
            {/* calendar icon */}
            <svg
              viewBox="0 0 24 24"
              class="h-4 w-4 opacity-70"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M7 2v2H5a2 2 0 0 0-2 2v1h18V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7Zm14 7H3v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9Z"
              />
            </svg>
            Mon, Aug 11 · 16:00
          </span>

          <span class="inline-flex items-center gap-1">
            {/* location pin */}
            <svg
              viewBox="0 0 24 24"
              class="h-4 w-4 opacity-70"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z"
              />
            </svg>
            Downtown Gym
          </span>
        </div>
      </div>
    </A>
  );
}

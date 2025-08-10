import { useNavigate, useParams } from "@solidjs/router";
import { For, Show, createMemo, createEffect } from "solid-js";
import useQueryCourseDetail from "./../hooks/queries/useQueryCourseDetails.ts";

export default function CourseModal() {
  const params = useParams();
  const navigate = useNavigate();
  const closeModal = () => navigate(-1);

  const q = useQueryCourseDetail(params.id);

  createEffect(() => {
    console.log("Loading:", q.isLoading);
    console.log("Error:", q.isError, q.error?.message);
    console.log("Data:", q.data);
  });

  return (
    <div class="modal modal-open" role="dialog">
      <div class="modal-box relative w-11/12 max-w-4xl p-0 overflow-hidden">
        {/* Close button */}
        <button
          onClick={closeModal}
          class="absolute top-3 right-3 z-10 rounded-full w-9 h-9 grid place-items-center bg-base-100/80 hover:bg-base-100 shadow"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Loading */}
        <Show when={q.isLoading}>
          <div class="animate-pulse p-6">
            <div class="h-6 w-1/2 bg-base-200 rounded mb-3" />
            <div class="h-4 w-2/3 bg-base-200 rounded mb-2" />
            <div class="h-4 w-1/3 bg-base-200 rounded" />
          </div>
        </Show>

        {/* Error */}
        <Show when={q.isError}>
          <div class="p-6 text-error">
            {q.error?.message || "Failed to load course"}
          </div>
        </Show>

        {/* Data */}
        <Show when={q.data}>
          {(course) => (
            <>
              {/* Cover */}
              <div class="relative h-44 md:h-56 bg-base-200">
                <img
                  src={
                    course().imageUrl || "https://picsum.photos/1200/400?blur=2"
                  }
                  alt={course().title}
                  class="h-full w-full object-cover"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-base-100 via-base-100/20 to-transparent" />
                <div class="absolute bottom-3 left-4 right-12">
                  <h1 class="text-2xl md:text-3xl font-extrabold drop-shadow-sm">
                    {course().title}
                  </h1>
                </div>
              </div>

              {/* Content */}
              <div class="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left */}
                <div class="md:col-span-2 space-y-6">
                  {/* Trainer */}
                  <div class="flex items-center gap-3">
                    <div class="avatar">
                      <div class="w-12 h-12 rounded-full ring ring-base-200">
                        <img
                          src={
                            course().trainer.avatarUrl ||
                            "https://api.dicebear.com/7.x/initials/svg?seed=Coach"
                          }
                          alt={course().trainer.name}
                        />
                      </div>
                    </div>
                    <div>
                      <div class="font-semibold">{course().trainer.name}</div>
                      <div class="text-sm opacity-70">Certified Coach</div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 class="font-semibold mb-2">Description</h3>
                    <p class="leading-relaxed text-sm md:text-base opacity-90 whitespace-pre-line">
                      {course().description || "No description yet."}
                    </p>
                  </div>

                  {/* Schedule */}
                  <div>
                    <h3 class="font-semibold mb-2">Schedule</h3>
                    <Show
                      when={(course().upcomingTrainings?.length ?? 0) > 0}
                      fallback={
                        <p class="text-sm opacity-70">
                          No sessions in the next 7 days.
                        </p>
                      }
                    >
                      <div class="divide-y divide-base-200 rounded-md border border-base-200">
                        <For each={course().upcomingTrainings}>
                          {(t) => (
                            <div class="flex items-center gap-3 p-3">
                              <div class="text-sm md:w-32 shrink-0">
                                {new Date(t.startsAt).toLocaleDateString(
                                  undefined,
                                  {
                                    weekday: "long",
                                    month: "short",
                                    day: "numeric",
                                  },
                                )}
                              </div>
                              <div class="text-sm text-base-content/80">
                                {t.startTime} – {t.endTime}
                              </div>
                              <div class="ml-auto text-sm opacity-70">
                                {t.location || "TBA"}
                              </div>
                            </div>
                          )}
                        </For>
                      </div>
                    </Show>
                  </div>
                </div>

                {/* Right */}
                <div class="md:col-span-1">
                  <div class="rounded-xl border border-base-200 bg-base-100 p-4 sticky top-4">
                    <div class="font-semibold mb-2">Students</div>
                    <div class="text-3xl font-bold">
                      {course().studentCount}
                      <span class="text-sm font-normal opacity-60 ml-1">
                        enrolled
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </Show>
      </div>

      {/* Backdrop */}
      <div class="modal-backdrop" onClick={closeModal} />
    </div>
  );
}

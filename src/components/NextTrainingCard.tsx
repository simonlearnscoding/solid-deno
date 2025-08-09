// NextTrainingCard.tsx
import { type Training } from "./../../types/index.ts";
import useQueryNextTraining from "./../hooks/queries/useQueryNextTraining.ts";
import useMutateUpdateTrainingAttendance from "../hooks/mutations/useMutateUpdateTrainingAttendance.ts";
import { Show } from "solid-js";
import { createEffect } from "solid-js";

import { createSignal } from "solid-js";
function formatShortDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

export default function NextTrainingCard() {
  const query = useQueryNextTraining();
  createEffect(() => {
    console.log(query.data);
  });
  const [pending, setPending] = createSignal<"present" | "absent" | null>(null);
  const mutation = useMutateUpdateTrainingAttendance();

  const handleAttendance = async (id: string, status: "present" | "absent") => {
    setPending(status);
    await mutation.mutate({
      isAttending: status,
      trainingId: id,
    });
    setPending(null);
  };
  return (
    <div class="card-body">
      <h4 class="font-semibold">Next Training</h4>

      <Show when={query.isLoading}>
        <p class="text-sm text-base-content/60">Loading...</p>
      </Show>

      <Show when={query.isError}>
        <p class="text-sm text-error">
          Error: {query.error?.message || "Unknown error"}
        </p>
      </Show>

      <Show when={!query.isLoading && !query.data}>
        <p class="text-sm text-base-content/60">No upcoming training.</p>
      </Show>

      <Show when={query.data}>
        {(training) => (
          <>
            <h3>{training().title}</h3>
            <div class="flex">
              <p class="font-medium">{formatShortDate(training().date)}</p>
              <div class="divider divider-horizontal mx-1" />
              <p>
                {training().startTime} - {training().endTime}
              </p>
            </div>
            {/* Actions */}
            <div class="flex gap-2 mt-1">
              <button
                onClick={async () =>
                  await handleAttendance(training().id, "present")
                }
                disabled={mutation.isPending}
                class={`btn flex-1 ${pending() === "present" && mutation.isPending ? "loading" : ""}`}
              >
                {pending() === "present" && mutation.isPending
                  ? "Saving..."
                  : "Present"}
              </button>

              <button
                onClick={async () =>
                  await handleAttendance(training().id, "absent")
                }
                disabled={mutation.isPending}
                class={`btn btn-ghost flex-1 ${pending() === "absent" && mutation.isPending ? "loading" : ""}`}
              >
                {pending() === "absent" && mutation.isPending
                  ? "Saving..."
                  : "Absent"}
              </button>
            </div>

            {/* Optional inline error */}
            {mutation.isError && (
              <p class="text-error text-sm mt-2">
                {(mutation.error as Error)?.message ?? "Update failed"}
              </p>
            )}
          </>
        )}
      </Show>
    </div>
  );
}

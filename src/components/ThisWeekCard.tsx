// components/ThisWeekCard.tsx
import { For, Show, Suspense } from "solid-js";
import useQueryThisWeekConfirmed from "../hooks/queries/useQueryThisWeekConfirmedTraining.ts";

function weekdayLabel(dateIso: string) {
  return new Date(dateIso).toLocaleDateString(undefined, { weekday: "short" });
}

export default function ThisWeekCard() {
  const q = useQueryThisWeekConfirmed();

  return (
    <div class="card bg-base-100 shadow-sm rounded-md">
      <div class="card-body">
        <h2 class="card-title">This Week</h2>

        <Suspense
          fallback={<p class="text-sm text-base-content/60">Loading...</p>}
        >
          <For each={q.data}>
            {(t) => (
              <div class="flex">
                <div class="min-w-0 truncate">
                  {weekdayLabel(t.startsAt)} -{" "}
                  <span class="font-bold">{t.title}</span>
                </div>
                <div class="ml-auto min-w-fit">
                  {t.startTime} - {t.endTime}
                </div>
              </div>
            )}
          </For>
        </Suspense>
      </div>
    </div>
  );
}

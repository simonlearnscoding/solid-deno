import useQueryNextTraining from "./../hooks/queries/useQueryNextTraining.ts";
import { createEffect, Suspense } from "solid-js";
import NextTrainingCard from "./NextTrainingCard.tsx";
import ThisWeekCard from "./ThisWeekCard.tsx";

export default function RightSidebar(props: {}) {
  return (
    <div class="w-96  flex-col gap-3 p-4 bg-base-200 hidden xl:flex">
      <NextTrainingCard />
      <ThisWeekCard />
    </div>
  );
}

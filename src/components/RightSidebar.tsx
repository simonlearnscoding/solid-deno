import useQueryNextTraining from "./../hooks/queries/useQueryNextTraining.ts";
import { createEffect, Suspense } from "solid-js";
import NextTrainingCard from "./NextTrainingCard.tsx";

export default function RightSidebar(props: {}) {
  return (
    <div class="w-96  flex-col gap-3 p-4 bg-base-200 hidden xl:flex">
      <div class="card bg-base-100 rounded-md shadow-sm">
        <Suspense
          fallback={<div class="skeleton h-48 bg-gray-200 rounded-md" />}
        >
          <NextTrainingCard />
        </Suspense>
      </div>

      <div class="card bg-base-100 shadow-sm  rounded-md">
        <div class="card-body">
          <h2 class="card-title">This Week</h2>
          <div class="flex">
            <div>
              Tue - <span class="font-bold">Beginner Boxing</span>
            </div>
            <div class="text-end ml-auto"> 14:00 - 15:00</div>
          </div>

          <div class="flex">
            <div>
              Thu - <span class="font-bold">Soccer Practice</span>
            </div>
            <div class="text-end ml-auto"> 14:00 - 15:00</div>
          </div>
          <div class="flex  ">
            <div class="   truncate min-w-0 mr-5 ">
              Tue -{" "}
              <span class="font-bold ">Soccer Practice Beginner Boxing</span>
            </div>
            <div class="text-end ml-auto min-w-fit"> 14:00 - 15:00</div>
          </div>
        </div>
      </div>
    </div>
  );
}

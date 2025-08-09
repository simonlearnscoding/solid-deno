import { type Training } from "./../../types/index.ts";
import { useMutation, useQueryClient } from "@tanstack/solid-query";
import { createSignal } from "solid-js";
import { AiOutlineCalendar } from "solid-icons/ai";

// import useMutateUpdateTrainingAttendance from "../hooks/mutations/useMutateUpdateTrainingAttendance.ts";
import {
  FaSolidLocationDot,
  FaSolidCheck,
  FaSolidXmark,
  FaSolidQuestion,
} from "solid-icons/fa";

function formatShortDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}
type Input = {
  isAttending: "present" | "absent";
  trainingId: string;
};

const mutateFn = async (input: Input): Promise<any> => {
  const res = await fetch(
    `http://localhost:8000/trainings/${input.trainingId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ isAttending: input.isAttending }),
      credentials: "include",
    },
  );
  if (!res.ok) throw new Error("Failed to update user attendance");
  return res.json();
};
export default function TrainingCard({ training }: { training: Training }) {
  const qc = useQueryClient();
  const [pending, setPending] = createSignal<"present" | "absent" | null>(null);

  const mutation = useMutation(() => ({
    mutationFn: mutateFn,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["upcoming-trainings"] });
    },
    onError: (err) => {
      console.error(err);
      // optional: show toast
    },
    onSettled: () => setPending(null),
  }));

  const clickPresent = () => {
    setPending("present");
    mutation.mutate({ isAttending: "present", trainingId: training.id });
  };

  const clickAbsent = () => {
    setPending("absent");
    mutation.mutate({ isAttending: "absent", trainingId: training.id });
  };
  return (
    <div class="card card-sm bg-base-100 card-border rounded-md shadow-sm hover:bg-base-300 transition-colors w-full">
      <div class="card-body">
        {/* Header: course badge + title */}
        <div class="flex gap-2 items-center">
          <div class="rounded-md   overflow-hidden  h-12 w-12 ">
            <img
              src={training.imageUrl}
              class=" w-full h-full object-cover "
              alt="TL"
            />
          </div>
          <h3 class="card-title">{training.title}</h3>
        </div>

        {/* Trainer */}
        <div class="flex items-center gap-3">
          <div class="avatar">
            <div class="rounded-full w-8">
              <img src={training.trainer.avatarUrl} />
            </div>
          </div>
          <p>{training.trainer.name}</p>
        </div>

        {/* Date/Time + Attendance chips on the same row */}
        <div class="flex items-center gap-2">
          <AiOutlineCalendar class="w-5 h-5 opacity-80" />
          <p class="text-sm text-base-content/70">
            {formatShortDate(training.date)}
          </p>

          <div class="divider divider-horizontal mx-1" />
          <p class="ml-auto  text-end text-sm text-base-content/80">
            {training.startTime} - {training.endTime}
          </p>
        </div>

        {/* Location */}
        <div class="flex items-center gap-2">
          <FaSolidLocationDot class="w-5 h-5 opacity-80" />
          <p class="text-base-content/90">{training.location}</p>

          {/* compact chips */}
          <div class="flex items-center gap-1 ml-2">
            {/* Present */}
            <span
              class="badge badge-sm bg-success/15 text-success-content gap-1"
              title="Present"
              aria-label="Present"
            >
              <FaSolidCheck class="w-3.5 h-3.5" />
              {training.attending}
            </span>
            {/* Maybe / undecided */}
            <span
              class="badge badge-sm bg-warning/15 text-warning-content gap-1"
              title="Maybe"
              aria-label="Maybe"
            >
              <FaSolidQuestion class="w-3.5 h-3.5" />
              {training.unconfirmed}
            </span>
            {/* Absent */}
            <span
              class="badge badge-sm bg-error/15 text-error-content gap-1"
              title="Absent"
              aria-label="Absent"
            >
              <FaSolidXmark class="w-3.5 h-3.5" />
              {training.declined}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div class="flex gap-2 mt-1">
          <button
            onClick={clickPresent}
            disabled={mutation.isPending}
            class={`btn flex-1 ${pending() === "present" && mutation.isPending ? "loading" : ""}`}
          >
            {pending() === "present" && mutation.isPending
              ? "Saving..."
              : "Present"}
          </button>

          <button
            onClick={clickAbsent}
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
      </div>
    </div>
  );
}

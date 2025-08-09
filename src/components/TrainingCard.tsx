import { type Training } from "../data/trainings.ts";
import { AiOutlineCalendar } from "solid-icons/ai";
import {
  FaSolidLocationDot,
  FaSolidUser,
  FaSolidCheck,
  FaSolidXmark,
  FaSolidQuestion,
} from "solid-icons/fa";

export default function TrainingCard({ training }: { training: Training }) {
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
          <p class="text-sm text-base-content/70">Tue, 12 Aug</p>

          <div class="divider divider-horizontal mx-1" />
          <p class="ml-auto  text-end text-sm text-base-content/80">
            18:00 – 19:00
          </p>
        </div>

        {/* Location */}
        <div class="flex items-center gap-2">
          <FaSolidLocationDot class="w-5 h-5 opacity-80" />
          <p class="text-base-content/90">Downtown Gym</p>

          {/* compact chips */}
          <div class="flex items-center gap-1 ml-2">
            {/* Present */}
            <span
              class="badge badge-sm bg-success/15 text-success-content gap-1"
              title="Present"
              aria-label="Present"
            >
              <FaSolidCheck class="w-3.5 h-3.5" />
              {6}
            </span>
            {/* Maybe / undecided */}
            <span
              class="badge badge-sm bg-warning/15 text-warning-content gap-1"
              title="Maybe"
              aria-label="Maybe"
            >
              <FaSolidQuestion class="w-3.5 h-3.5" />
              {2}
            </span>
            {/* Absent */}
            <span
              class="badge badge-sm bg-error/15 text-error-content gap-1"
              title="Absent"
              aria-label="Absent"
            >
              <FaSolidXmark class="w-3.5 h-3.5" />
              {3}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div class="flex gap-2 mt-1">
          <button class="btn  flex-1">Present</button>
          <button class="btn btn-ghost flex-1">Absent</button>
        </div>
      </div>
    </div>
  );
}

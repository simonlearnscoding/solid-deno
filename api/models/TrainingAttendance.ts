import { Schema, model, models } from "mongoose";
import type { TrainingAttendance } from "./../../types/TrainingAttendance.ts";

const TrainingAttendanceSchema = new Schema<TrainingAttendance>(
  {
    training: { type: Schema.Types.ObjectId, ref: "Training", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isAttending: {
      type: Boolean,
    },
  },
  { timestamps: true },
);

export default (models.TrainingAttendance as any) ||
  model<TrainingAttendance>("TrainingAttendance", TrainingAttendanceSchema);

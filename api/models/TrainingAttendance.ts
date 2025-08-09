import mongoose, { Schema } from "mongoose";
import type { TrainingAttendance } from "./../../types/TrainingAttendance.ts";

const TrainingAttendanceSchema = new Schema<TrainingAttendance>(
  {
    training: { type: Schema.Types.ObjectId, ref: "Training", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isAttending: {
      type: String,
      enum: ["present", "absent", "pending"],
      default: "pending",
    },
  },
  { timestamps: true },
);

export default mongoose.models.TrainingAttendance ||
  mongoose.model<TrainingAttendance>(
    "TrainingAttendance",
    TrainingAttendanceSchema,
  );

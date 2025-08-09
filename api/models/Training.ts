import mongoose, { Schema } from "mongoose";
import { Training } from "../../types/Training";

const TrainingSchema: Schema = new Schema<Training>(
  {
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    trainer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String },
    location: { type: String },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
  },
  { timestamps: true },
);

export default mongoose.models.Training ||
  mongoose.model<Training>("Training", TrainingSchema);

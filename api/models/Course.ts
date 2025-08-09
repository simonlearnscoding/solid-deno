import mongoose, { Schema } from "mongoose";
import { Course } from "./../../types/Course.ts";

const CourseSchema: Schema = new Schema(
  {
    trainer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);

export default mongoose.models.Course ||
  mongoose.model<Course>("Course", CourseSchema);

import { Schema } from "mongoose";
import type { CourseMembership } from "../../types/CourseMembership.ts";
import mongoose from "mongoose";

const CourseMembershipSchema = new Schema<CourseMembership>(
  {
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: {
      type: String,
      enum: ["student", "trainer", "assistant"],
      required: true,
      default: "student",
    },
    status: {
      type: String,
      enum: ["active", "invited", "left", "banned"],
      required: true,
      default: "active",
    },
    joinedAt: { type: Date },
    leftAt: { type: Date },
  },
  { timestamps: true },
);

export default mongoose.models.CourseMembership ||
  mongoose.model<CourseMembership>("CourseMembership", CourseMembershipSchema);

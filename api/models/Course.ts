import mongoose, { Schema } from "mongoose";
import { Course } from "./../../types/Course.ts";

const CourseSchema: Schema = new Schema(
  {
    trainer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String },

    address: String, // "123 Main St, City"
    city: String,
    country: String,

    // GeoJSON (WGS84)
    location: {
      type: { type: String, enum: ["Point"], default: "Point", required: true },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);

// models/Course.ts
CourseSchema.index({ location: "2dsphere" });

export default mongoose.models.Course ||
  mongoose.model<Course>("Course", CourseSchema);

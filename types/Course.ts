import mongoose, { Document, Types } from "mongoose";

export interface Course extends Document {
  trainer: Types.ObjectId;
  title: string;
  description?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

import { Document, Types } from "mongoose";

export interface Training extends Document {
  course: Types.ObjectId; // Reference to the course this training belongs to
  trainer: Types.ObjectId; // Reference to the user who is the trainer
  title: string;
  description?: string;
  location?: string;
  startsAt: Date;
  endsAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

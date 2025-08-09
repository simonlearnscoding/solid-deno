import { Document, Types } from "mongoose";

export interface TrainingAttendance extends Document {
  training: Types.ObjectId; // ref: Training
  user: Types.ObjectId; // ref: User
  isAttending: boolean;
}

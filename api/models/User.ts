import mongoose, { Schema } from "mongoose";
import { User } from "./../../types/User.ts";

const UserSchema: Schema = new Schema({
  password: { type: String, required: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  avatarUrl: { type: String },
});

export default mongoose.models.User || mongoose.model<User>("User", UserSchema);

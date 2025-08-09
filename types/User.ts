import mongoose, { Document } from "mongoose";
type roleType = "user" | "admin" | "trainer"; // Define roles as needed
export interface User extends Document {
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  avatarUrl?: string;
  roles: roleType[]; // e.g., ["user", "admin"]
}

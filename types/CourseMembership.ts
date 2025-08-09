import { Document, Types } from "mongoose";

export type CourseRole = "student" | "trainer" | "assistant";
export type MembershipStatus = "active" | "invited" | "left" | "banned";

export interface CourseMembership extends Document {
  course: Types.ObjectId; // ref: Course
  user: Types.ObjectId; // ref: User
  role: CourseRole;
  status: MembershipStatus;
  joinedAt?: Date;
  leftAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

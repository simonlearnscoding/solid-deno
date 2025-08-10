import { Types } from "mongoose";
import Course from "../models/Course.ts"; // see model below
import User from "../models/User.ts";
import CourseMembership from "../models/CourseMembership.ts";
export async function fetchCourses() {
  // Sort by most recently created; change to title if you prefer
  const docs = await Course.find({})
    .select("_id title description imageUrl tags") // keep payload light
    .sort({ createdAt: -1 })
    .lean();

  // normalize id to string
  return docs.map((c: any) => ({
    id: String(c._id),
    title: c.title,
    description: c.description ?? "",
    imageUrl: c.imageUrl ?? null,
    tags: c.tags ?? [],
  }));
}

export async function updateEnrollment(
  courseId: string,
  userMail: string,
  action: "active" | "left",
) {
  const userDoc = await User.findOne({
    email: userMail,
  }).select("_id");
  if (!userDoc?._id) {
    throw new Error(`User with email ${userMail} not found`);
  }
  const courseEnrollment = await CourseMembership.updateOne(
    { course: courseId, user: userDoc._id },
    {
      $set: {
        status: action,
        leftAt: action === "left" ? new Date() : null,
        joinedAt: action === "active" ? new Date() : null,
      },
    },
    { upsert: true, new: true },
  ).lean();
  if (!courseEnrollment) {
    throw new Error(`Failed to update enrollment for course ${courseId}`);
  }
  return courseEnrollment;
}

export async function getCourseDetail(courseId: string, userMail: string) {
  if (!Types.ObjectId.isValid(courseId)) return null;

  const userDoc = await User.findOne({ email: userMail }).select("_id");
  if (!userDoc?._id) {
    throw new Error(`User with email ${userMail} not found`);
  }
  const userObjectId = userDoc._id as Types.ObjectId;

  const now = new Date();
  const oneWeekLater = new Date(now);
  oneWeekLater.setDate(oneWeekLater.getDate() + 7);

  const [doc] = await Course.aggregate([
    { $match: { _id: new Types.ObjectId(courseId) } },

    // Trainer info
    {
      $lookup: {
        from: "users",
        localField: "trainer",
        foreignField: "_id",
        as: "trainerDoc",
      },
    },
    { $unwind: "$trainerDoc" },

    // Memberships
    {
      $lookup: {
        from: "coursememberships",
        localField: "_id",
        foreignField: "course",
        as: "memberships",
      },
    },

    // Upcoming trainings (next 7 days for this course)
    {
      $lookup: {
        from: "trainings",
        let: { cid: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$course", "$$cid"] },
              startsAt: { $gte: now, $lt: oneWeekLater },
            },
          },
          { $sort: { startsAt: 1 } },
          {
            $project: {
              _id: 0,
              id: { $toString: "$_id" },
              title: 1,
              location: 1,
              startsAt: 1,
              endsAt: 1,
              date: {
                $dateToString: { date: "$startsAt", format: "%Y-%m-%d" },
              },
              startTime: {
                $dateToString: { date: "$startsAt", format: "%H:%M" },
              },
              endTime: { $dateToString: { date: "$endsAt", format: "%H:%M" } },
            },
          },
        ],
        as: "upcomingTrainings",
      },
    },

    // Counts + my membership
    {
      $addFields: {
        studentCount: {
          $size: {
            $filter: {
              input: "$memberships",
              as: "m",
              cond: {
                $and: [
                  { $eq: ["$$m.role", "student"] },
                  { $eq: ["$$m.status", "active"] },
                ],
              },
            },
          },
        },
        myMembership: {
          $first: {
            $filter: {
              input: "$memberships",
              as: "m",
              cond: { $eq: ["$$m.user", userObjectId] },
            },
          },
        },
      },
    },

    // Final shape
    {
      $project: {
        _id: 0,
        id: { $toString: "$_id" },
        title: 1,
        description: 1,
        imageUrl: 1,
        trainer: {
          id: { $toString: "$trainerDoc._id" },
          name: "$trainerDoc.name",
          avatarUrl: "$trainerDoc.avatarUrl",
        },
        studentCount: 1,
        isJoined: {
          $cond: [
            { $ne: ["$myMembership", null] },
            {
              $and: [
                { $ne: ["$myMembership.status", "left"] },
                { $ne: ["$myMembership.status", "banned"] },
              ],
            },
            false,
          ],
        },
        myMembership: {
          role: "$myMembership.role",
          status: "$myMembership.status",
        },
        upcomingTrainings: 1,
      },
    },
  ]);

  return doc ?? null;
}

// services/trainings.ts
// services/trainings.ts
import { Types } from "mongoose";
import User from "../models/User.ts";
import TrainingAttendance from "../models/TrainingAttendance.ts";
import Training from "../models/Training.ts";

type Status = "present" | "pending" | "absent";

export async function upsertTrainingAttendanceToggle(
  trainingId: string,
  userEmail: string,
  target?: "present" | "absent",
): Promise<{ status: Status; updatedAt: string }> {
  const now = new Date();

  const user = await User.findOne({ email: userEmail });
  if (!user?._id) throw new Error(`User with email ${userEmail} not found`);
  if (!Types.ObjectId.isValid(trainingId)) {
    throw new Error(`Invalid training ID: ${trainingId}`);
  }

  // Read current status
  const current = await TrainingAttendance.findOne({
    training: new Types.ObjectId(trainingId),
    user: user._id,
  });

  let next: Status;

  if (typeof target !== "undefined") {
    // if the user clicked the same state again, go back to pending
    if (current?.isAttending === target) {
      next = "pending";
    } else {
      next = target; // "present" or "absent"
    }
  } else {
    // (optional) fallback toggle when client doesn't send a target
    if (current?.isAttending === "present") next = "pending";
    else if (current?.isAttending === "absent") next = "pending";
    else next = "present";
  }

  await TrainingAttendance.updateOne(
    { training: new Types.ObjectId(trainingId), user: user._id },
    {
      $set: { isAttending: next, updatedAt: now },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true },
  );

  return { status: next, updatedAt: now.toISOString() };
}

export async function fetchTrainingsForUser(userEmail: string) {
  try {
    const now = new Date();

    const userDoc = await User.findOne({ email: userEmail }).select("_id");
    if (!userDoc) throw new Error(`User with email ${userEmail} not found`);

    const trainings = await Training.aggregate([
      // 1) Only upcoming
      { $match: { startsAt: { $gte: now } } },

      // 3) All attendance rows for counts
      {
        $lookup: {
          from: "trainingattendances",
          localField: "_id",
          foreignField: "training",
          as: "attAll",
        },
      },

      // 4) Trainer info
      {
        $lookup: {
          from: "users",
          localField: "trainer",
          foreignField: "_id",
          as: "trainerDoc",
        },
      },
      { $unwind: "$trainerDoc" },

      // 5) Course info (category/image)
      {
        $lookup: {
          from: "courses",
          localField: "course",
          foreignField: "_id",
          as: "courseDoc",
        },
      },
      { $unwind: "$courseDoc" },

      // 6) Compute counts and format
      {
        $addFields: {
          attending: {
            $size: {
              $filter: {
                input: "$attAll",
                as: "a",
                cond: { $eq: ["$$a.isAttending", "present"] },
              },
            },
          },
          declined: {
            $size: {
              $filter: {
                input: "$attAll",
                as: "a",
                cond: { $eq: ["$$a.isAttending", "absent"] },
              },
            },
          },
          // isAttending is null or missing → unconfirmed
          unconfirmed: {
            $size: {
              $filter: {
                input: "$attAll",
                as: "a",
                cond: { $eq: ["$$a.isAttending", "pending"] },
              },
            },
          },
          effectiveImageUrl: { $ifNull: ["$imageUrl", "$courseDoc.imageUrl"] },
          date: { $dateToString: { date: "$startsAt", format: "%Y-%m-%d" } },
          startTime: { $dateToString: { date: "$startsAt", format: "%H:%M" } },
          endTime: { $dateToString: { date: "$endsAt", format: "%H:%M" } },
        },
      },

      // 7) Final shape
      {
        $project: {
          _id: 0,
          id: { $toString: "$_id" },
          title: 1,
          location: 1,
          date: 1,
          startTime: 1,
          endTime: 1,
          attending: 1,
          declined: 1,
          unconfirmed: 1,
          category: "$courseDoc.title",
          imageUrl: "$effectiveImageUrl",
          trainer: {
            name: "$trainerDoc.name",
            avatarUrl: "$trainerDoc.avatarUrl",
          },
        },
      },

      // 8) Sort by soonest
      { $sort: { date: 1, startTime: 1 } },
    ]);

    return trainings; // always an array
  } catch (error) {
    console.error("Error fetching trainings for user:", error);
    throw new Error("Failed to fetch trainings");
  }
}

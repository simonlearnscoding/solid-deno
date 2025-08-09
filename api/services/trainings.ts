// services/trainings.ts
import { Types } from "mongoose";
import User from "../models/User.ts";
import Training from "../models/Training.ts";
import TrainingAttendance from "../models/TrainingAttendance.ts";

export async function upsertTrainingAttendance(
  trainingId: string,
  userEmail: string,
  isAttending: "present" | "absent" | "pending",
) {
  try {
    const userDoc = await User.findOne({ email: userEmail }).select("_id");
    if (!userDoc) throw new Error(`User with email ${userEmail} not found`);
    if (!Types.ObjectId.isValid(trainingId)) {
      throw new Error(`Invalid training ID: ${trainingId}`);
    }
    await await TrainingAttendance.findOneAndUpdate(
      {
        training: trainingId,
        user: userDoc._id,
      },
      {
        isAttending,
      },
      {
        upsert: true, // Create if not exists
        new: true, // Return the updated document
      },
    );
  } catch (error) {
    console.error("Error updating training attendance:", error);
    throw new Error("Failed to update attendance");
  }
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

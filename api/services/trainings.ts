// services/trainings.ts
// services/trainings.ts
import { Types } from "mongoose";
import User from "../models/User.ts";
import TrainingAttendance from "../models/TrainingAttendance.ts";
import Training from "../models/Training.ts";

type Status = "present" | "pending" | "absent";

export async function fetchThisWeekConfirmedTrainings(userEmail: string) {
  const now = new Date();

  const start = new Date(); // now
  const end = new Date();
  end.setDate(start.getDate() + 7);

  const userDoc = await User.findOne({ email: userEmail }).select("_id");
  if (!userDoc) throw new Error(`User with email ${userEmail} not found`);

  const trainings = await Training.aggregate([
    // In this week
    { $match: { startsAt: { $gte: start, $lt: end } } },

    // This user's attendance → only "present"
    {
      $lookup: {
        from: "trainingattendances",
        let: { tid: "$_id", uid: userDoc._id },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$training", "$$tid"] },
                  { $eq: ["$user", "$$uid"] },
                  { $eq: ["$isAttending", "present"] },
                ],
              },
            },
          },
          { $project: { _id: 1 } }, // presence-only
        ],
        as: "mine",
      },
    },
    // Keep only those with at least one matching row
    { $match: { $expr: { $gt: [{ $size: "$mine" }, 0] } } },

    // Trainer & Course
    {
      $lookup: {
        from: "users",
        localField: "trainer",
        foreignField: "_id",
        as: "trainerDoc",
      },
    },
    { $unwind: "$trainerDoc" },
    {
      $lookup: {
        from: "courses",
        localField: "course",
        foreignField: "_id",
        as: "courseDoc",
      },
    },
    { $unwind: "$courseDoc" },

    // Counts (optional, for badges)
    {
      $lookup: {
        from: "trainingattendances",
        localField: "_id",
        foreignField: "training",
        as: "attAll",
      },
    },
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
        unconfirmed: {
          $size: {
            $filter: {
              input: "$attAll",
              as: "a",
              cond: { $eq: ["$$a.isAttending", "pending"] },
            },
          },
        },
      },
    },

    // Shape (match your other endpoints)
    {
      $project: {
        _id: 0,
        id: { $toString: "$_id" },
        title: 1,
        description: 1,
        location: 1,
        startsAt: 1,
        endsAt: 1,
        date: { $dateToString: { date: "$startsAt", format: "%Y-%m-%d" } },
        startTime: { $dateToString: { date: "$startsAt", format: "%H:%M" } },
        endTime: { $dateToString: { date: "$endsAt", format: "%H:%M" } },
        attending: 1,
        declined: 1,
        unconfirmed: 1,
        trainer: {
          name: "$trainerDoc.name",
          avatarUrl: "$trainerDoc.avatarUrl",
        },
        course: {
          id: { $toString: "$courseDoc._id" },
          title: "$courseDoc.title",
          imageUrl: "$courseDoc.imageUrl",
        },
        imageUrl: { $ifNull: ["$imageUrl", "$courseDoc.imageUrl"] },
      },
    },

    { $sort: { startsAt: 1 } },
  ]);

  return trainings; // [] when none
}
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

export async function fetchNextTrainingForUser(userEmail: string) {
  const now = new Date();

  const userDoc = await User.findOne({ email: userEmail }).select("_id");
  if (!userDoc) throw new Error(`User with email ${userEmail} not found`);

  const [next] = await Training.aggregate([
    // 1) future trainings only
    { $match: { startsAt: { $gte: now } } },

    // 2) this user's attendance for each training (left join)
    {
      $lookup: {
        from: "trainingattendances",
        let: { tid: "$_id", uid: userDoc._id },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$training", "$$tid"] },
                  { $eq: ["$user", "$$uid"] },
                ],
              },
            },
          },
          { $project: { _id: 0, isAttending: 1 } },
        ],
        as: "mine",
      },
    },
    // derive myStatus = first(mine.isAttending) or "pending"
    {
      $addFields: {
        myStatus: {
          $ifNull: [{ $first: "$mine.isAttending" }, "pending"],
        },
      },
    },
    // 3) exclude if I'm absent
    { $match: { myStatus: { $ne: "absent" } } },

    // 4) trainer & course lookups (for display)
    {
      $lookup: {
        from: "users",
        localField: "trainer",
        foreignField: "_id",
        as: "trainerDoc",
      },
    },
    { $unwind: "$trainerDoc" },
    {
      $lookup: {
        from: "courses",
        localField: "course",
        foreignField: "_id",
        as: "courseDoc",
      },
    },
    { $unwind: "$courseDoc" },

    // 5) (optional) counts for badges
    {
      $lookup: {
        from: "trainingattendances",
        localField: "_id",
        foreignField: "training",
        as: "attAll",
      },
    },
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
        unconfirmed: {
          $size: {
            $filter: {
              input: "$attAll",
              as: "a",
              cond: { $eq: ["$$a.isAttending", "pending"] },
            },
          },
        },
        // Add formatted date/time fields
        date: { $dateToString: { date: "$startsAt", format: "%Y-%m-%d" } },
        startTime: { $dateToString: { date: "$startsAt", format: "%H:%M" } },
        endTime: { $dateToString: { date: "$endsAt", format: "%H:%M" } },
        // Use course image as fallback
        effectiveImageUrl: { $ifNull: ["$imageUrl", "$courseDoc.imageUrl"] },
      },
    },

    // 6) shape + sort/limit
    {
      $project: {
        _id: 0,
        id: { $toString: "$_id" },
        title: 1,
        description: 1,
        location: 1,
        startsAt: 1,
        endsAt: 1,
        date: 1,
        startTime: 1,
        endTime: 1,
        myStatus: 1,
        attending: 1,
        declined: 1,
        unconfirmed: 1,
        trainer: {
          name: "$trainerDoc.name",
          avatarUrl: "$trainerDoc.avatarUrl",
        },
        course: {
          id: { $toString: "$courseDoc._id" },
          title: "$courseDoc.title",
          imageUrl: "$courseDoc.imageUrl",
        },
        imageUrl: "$effectiveImageUrl",
      },
    },
    { $sort: { startsAt: 1 } },
    { $limit: 1 },
  ]);

  return next ?? null;
}
export async function fetchTrainingsForUser(userEmail: string, q?: string) {
  try {
    const now = new Date();

    const userDoc = await User.findOne({ email: userEmail }).select("_id");
    if (!userDoc) throw new Error(`User with email ${userEmail} not found`);

    const matchStage: any = {
      startsAt: { $gte: now },
    };

    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), "i");
      matchStage.$or = [{ title: regex }, { location: regex }];
    }

    const trainings = await Training.aggregate([
      // 1) Filter by upcoming + search query
      { $match: matchStage },

      // 2) Attendance counts
      {
        $lookup: {
          from: "trainingattendances",
          localField: "_id",
          foreignField: "training",
          as: "attAll",
        },
      },

      // 3) Trainer info
      {
        $lookup: {
          from: "users",
          localField: "trainer",
          foreignField: "_id",
          as: "trainerDoc",
        },
      },
      { $unwind: "$trainerDoc" },

      // 4) Course info
      {
        $lookup: {
          from: "courses",
          localField: "course",
          foreignField: "_id",
          as: "courseDoc",
        },
      },
      { $unwind: "$courseDoc" },

      // 5) Counts + formatting
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

      // 6) Final shape
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

      // 7) Sort
      { $sort: { date: 1, startTime: 1 } },
    ]);

    return trainings;
  } catch (error) {
    console.error("Error fetching trainings for user:", error);
    throw new Error("Failed to fetch trainings");
  }
}

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
  const userId = userDoc._id;

  const [next] = await Training.aggregate([
    // 1) Only future trainings
    { $match: { startsAt: { $gte: now } } },

    // 1.5) Keep only trainings where I have an ACTIVE membership in the course
    {
      $lookup: {
        from: "coursememberships", // <- check your actual collection name
        let: { cid: "$course", uid: userId },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$course", "$$cid"] },
                  { $eq: ["$user", "$$uid"] },
                  { $eq: ["$status", "active"] },
                ],
              },
            },
          },
          { $project: { _id: 1 } },
        ],
        as: "myMembership",
      },
    },
    // require at least one active membership row
    { $match: { $expr: { $gt: [{ $size: "$myMembership" }, 0] } } },

    // 2) This user's attendance (left join)
    {
      $lookup: {
        from: "trainingattendances",
        let: { tid: "$_id", uid: userId },
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
        as: "myAtt",
      },
    },
    // derive myAttendance = first(myAtt.isAttending) or "pending"
    {
      $addFields: {
        myAttendance: {
          $ifNull: [{ $arrayElemAt: ["$myAtt.isAttending", 0] }, "pending"],
        },
      },
    },

    // 3) Exclude if I'm absent
    { $match: { myAttendance: { $ne: "absent" } } },

    // 4) Trainer & Course (for display, category, image fallback)
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

    // 5) All attendance rows for counts
    {
      $lookup: {
        from: "trainingattendances",
        localField: "_id",
        foreignField: "training",
        as: "attAll",
      },
    },

    // 6) Derived fields (counts, formatting, image fallback)
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
        date: { $dateToString: { date: "$startsAt", format: "%Y-%m-%d" } },
        startTime: { $dateToString: { date: "$startsAt", format: "%H:%M" } },
        endTime: { $dateToString: { date: "$endsAt", format: "%H:%M" } },
        effectiveImageUrl: { $ifNull: ["$imageUrl", "$courseDoc.imageUrl"] },
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
        myAttendance: 1,
        category: "$courseDoc.title",
        imageUrl: "$effectiveImageUrl",
        trainer: {
          name: "$trainerDoc.name",
          avatarUrl: "$trainerDoc.avatarUrl",
        },
      },
    },

    // 8) Soonest upcoming
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
    const userId = userDoc._id;

    const matchStage: any = { startsAt: { $gte: now } };
    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), "i");
      matchStage.$or = [{ title: regex }, { location: regex }];
    }

    const trainings = await Training.aggregate([
      // 1) Upcoming (and optional search)
      { $match: matchStage },

      // 1.5) Keep only trainings where THIS user has an ACTIVE membership in the course
      {
        $lookup: {
          from: "coursememberships", // <— ensure collection name matches your model
          let: { cid: "$course", uid: userId },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$course", "$$cid"] },
                    { $eq: ["$user", "$$uid"] },
                    { $eq: ["$status", "active"] },
                  ],
                },
              },
            },
            { $project: { _id: 1 } },
          ],
          as: "myMembership",
        },
      },
      { $match: { $expr: { $gt: [{ $size: "$myMembership" }, 0] } } },

      // 2) All attendance rows (for counts)
      {
        $lookup: {
          from: "trainingattendances",
          localField: "_id",
          foreignField: "training",
          as: "attAll",
        },
      },

      // 3) This user's attendance (for myAttendance)
      {
        $lookup: {
          from: "trainingattendances",
          let: { trainingId: "$_id", userId: userId },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$training", "$$trainingId"] },
                    { $eq: ["$user", "$$userId"] },
                  ],
                },
              },
            },
            { $project: { _id: 0, isAttending: 1 } },
          ],
          as: "myAtt",
        },
      },

      // 4) Trainer
      {
        $lookup: {
          from: "users",
          localField: "trainer",
          foreignField: "_id",
          as: "trainerDoc",
        },
      },
      { $unwind: "$trainerDoc" },

      // 5) Course (for title/image fallback)
      {
        $lookup: {
          from: "courses",
          localField: "course",
          foreignField: "_id",
          as: "courseDoc",
        },
      },
      { $unwind: "$courseDoc" },

      // 6) Derived fields
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
          myAttendance: {
            $ifNull: [{ $arrayElemAt: ["$myAtt.isAttending", 0] }, "pending"],
          },
          effectiveImageUrl: { $ifNull: ["$imageUrl", "$courseDoc.imageUrl"] },
        },
      },

      // 7) Sort
      { $sort: { startsAt: 1 } },

      // 8) Final shape
      {
        $project: {
          _id: 0,
          id: { $toString: "$_id" },
          title: 1,
          location: 1,
          date: { $dateToString: { date: "$startsAt", format: "%Y-%m-%d" } },
          startTime: { $dateToString: { date: "$startsAt", format: "%H:%M" } },
          endTime: { $dateToString: { date: "$endsAt", format: "%H:%M" } },
          attending: 1,
          declined: 1,
          unconfirmed: 1,
          myAttendance: 1,
          category: "$courseDoc.title",
          imageUrl: "$effectiveImageUrl",
          trainer: {
            name: "$trainerDoc.name",
            avatarUrl: "$trainerDoc.avatarUrl",
          },
        },
      },
    ]);

    return trainings;
  } catch (error) {
    console.error("Error fetching trainings for user:", error);
    throw new Error("Failed to fetch trainings");
  }
}

import { Hono } from "@hono/hono";
import { HTTPException } from "hono/http-exception";
import { Context } from "jsr:@hono/hono";
import { Types } from "mongoose";
import { upsertTrainingAttendanceToggle } from "../services/trainings.ts";

import { HonoVars } from "./../../types/index.ts";

const trainings = new Hono<{ Variables: HonoVars }>();

type Target = "present" | "absent";

const jsonOrUndefined = async <T>(req: Request): Promise<T | undefined> => {
  try {
    return (await req.json()) as T;
  } catch {
    return undefined;
  }
};

trainings.put("/:id", async (c: Context) => {
  const email = c.var.email as string;
  const trainingId = c.req.param("id");
  if (!trainingId || !Types.ObjectId.isValid(trainingId)) {
    throw new HTTPException(400, { message: "Invalid training ID" });
  }

  const body = await jsonOrUndefined<{ isAttending?: Target }>(c.req.raw);
  const target =
    body?.isAttending === "present" || body?.isAttending === "absent"
      ? body.isAttending
      : undefined;

  const result = await upsertTrainingAttendanceToggle(
    trainingId,
    email,
    target,
  );

  return c.json(
    {
      message: "Attendance updated",
      trainingId,
      status: result.status, // "present" | "pending" | "absent"
      updatedAt: result.updatedAt,
    },
    200,
  );
});

export default trainings;

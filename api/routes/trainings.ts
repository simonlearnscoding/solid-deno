// routes/trainings.ts
import { Hono } from "@hono/hono";
import { HTTPException } from "hono/http-exception";
import { Context } from "jsr:@hono/hono";
import { Types } from "mongoose";
import { verifyToken } from "../services/auth.ts";
import { upsertTrainingAttendance } from "../services/trainings.ts";

const trainings = new Hono();

type Rsvp = "present" | "absent" | "pending";
function isRsvp(x: unknown): x is Rsvp {
  return x === "present" || x === "absent" || x === "pending";
}

trainings.patch("/:id", async (c: Context) => {
  try {
    const trainingId = c.req.param("id");
    if (!trainingId || !Types.ObjectId.isValid(trainingId)) {
      throw new HTTPException(400, { message: "Invalid training ID" });
    }

    // parse body (await!)
    let body: any;
    try {
      body = await c.req.json();
    } catch {
      throw new HTTPException(400, { message: "Body must be JSON" });
    }
    const isAttending = body?.isAttending;
    if (!isRsvp(isAttending)) {
      throw new HTTPException(400, { message: "Invalid isAttending value" });
    }

    // auth (Bearer <token>)
    const token = c.req.header("Authorization")?.replace("Bearer ", "");
    if (!token) throw new HTTPException(401, { message: "No token provided" });
    const payload = await verifyToken(token);
    if (!payload?.email)
      throw new HTTPException(401, { message: "Invalid token" });

    const updated = await upsertTrainingAttendance(
      trainingId,
      payload.email as string,
      isAttending,
    );

    return c.json(
      { message: "Training updated successfully", updatedTraining: updated },
      200,
    );
  } catch (err) {
    if (err instanceof HTTPException) return err.getResponse();
    console.error("Unexpected error in /trainings/:id:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default trainings;

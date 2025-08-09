import { Hono } from "@hono/hono";
import { HTTPException } from "hono/http-exception";
import { Context } from "jsr:@hono/hono";
import { Types } from "mongoose";
import { verifyToken } from "../services/auth.ts";
import { upsertTrainingAttendanceToggle } from "../services/trainings.ts";

import { getCookie } from "jsr:@hono/hono/cookie";
const trainings = new Hono();

type Target = "present" | "absent"; // only when client wants an explicit state

trainings.put("/:id", async (c: Context) => {
  try {
    console.log("Updating training attendance...");
    const trainingId = c.req.param("id");
    console.log("param trainingId:", trainingId);
    if (!trainingId || !Types.ObjectId.isValid(trainingId)) {
      throw new HTTPException(400, { message: "Invalid training ID" });
    }

    // Optional body (explicit set). If missing → toggle.
    let target: Target | undefined = undefined;
    try {
      const maybeJson = await c.req.json();
      if (
        maybeJson &&
        (maybeJson.isAttending === "present" ||
          maybeJson.isAttending === "absent")
      ) {
        target = maybeJson.isAttending;
      }
    } catch {
      /* ignore — treat as toggle */
    }

    const token = getCookie(c, "token");
    if (!token) throw new HTTPException(401, { message: "No token provided" });
    const payload = await verifyToken(token);
    if (!payload?.email)
      throw new HTTPException(401, { message: "Invalid token" });
    console.log("target:", target);
    const result = await upsertTrainingAttendanceToggle(
      trainingId,
      payload.email as string,
      target,
    );

    console.log("result:", result);
    return c.json(
      {
        message: "Attendance updated",
        trainingId,
        status: result.status, // "present" | "pending" | "absent"
        updatedAt: result.updatedAt,
      },
      200,
    );
  } catch (err) {
    if (err instanceof HTTPException) return err.getResponse();
    console.error("Unexpected error in PATCH /trainings/:id:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default trainings;

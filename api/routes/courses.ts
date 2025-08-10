import { Hono } from "@hono/hono";
import { Context } from "jsr:@hono/hono";
import { HTTPException } from "hono/http-exception";
import { Types } from "mongoose";

import { HonoVars } from "./../../types/index.ts";
import {
  fetchCourses,
  getCourseDetail,
  updateEnrollment,
} from "../services/courses.ts";

const courses = new Hono<{ Variables: HonoVars }>();

courses.get("/", async (c: Context) => {
  try {
    const list = await fetchCourses();
    return c.json(list, 200);
  } catch (err) {
    console.error("GET /courses failed:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

courses.post("/:id/enrollment", async (c: Context) => {
  // "left"| "banned"
  const { action } = await c.req.json();
  const email = c.var.email as string;
  const courseId = c.req.param("id");
  if (!courseId || !Types.ObjectId.isValid(courseId)) {
    throw new HTTPException(400, { message: "Invalid course id" });
  }

  const result = await updateEnrollment(courseId, email, action);
  return c.json(result, 200);
});

courses.get("/:id", async (c: Context) => {
  const id = c.req.param("id");
  const email = c.var.email;
  if (!id || !Types.ObjectId.isValid(id)) {
    throw new HTTPException(400, { message: "Invalid course id" });
  }
  const detail = await getCourseDetail(id, email);
  if (!detail) {
    throw new HTTPException(404, { message: "Course not found" });
  }

  return c.json(detail, 200);
});

export default courses;

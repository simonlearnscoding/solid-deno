import { Hono } from "@hono/hono";
import { Context } from "jsr:@hono/hono";
import { HTTPException } from "hono/http-exception";
import { getCookie } from "jsr:@hono/hono/cookie";
import { Types } from "mongoose";
import { verifyToken } from "../services/auth.ts";
import { fetchCourses, getCourseDetail } from "../services/courses.ts";

const courses = new Hono();

courses.get("/", async (c: Context) => {
  try {
    const list = await fetchCourses();
    return c.json(list, 200);
  } catch (err) {
    console.error("GET /courses failed:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

courses.get("/:id", async (c: Context) => {
  try {
    const courseId = c.req.param("id");
    if (!courseId) {
      throw new HTTPException(400, { message: "Missing id" });
    }
    if (!Types.ObjectId.isValid(courseId)) {
      throw new HTTPException(400, { message: "Invalid course id" });
    }

    // Auth is required because getCourseDetail needs user email
    const token = getCookie(c, "token");
    if (!token) {
      throw new HTTPException(401, { message: "No token provided" });
    }

    let userMail: string;
    try {
      const payload = await verifyToken(token);
      if (!payload?.email) {
        throw new HTTPException(401, { message: "Invalid token payload" });
      }
      userMail = payload.email as string;
    } catch (err: any) {
      if (err?.name === "JwtTokenExpired") {
        throw new HTTPException(401, { message: "Token expired" });
      }
      if (err instanceof HTTPException) throw err;
      throw new HTTPException(401, { message: "Invalid token" });
    }

    const detail = await getCourseDetail(courseId, userMail);
    if (!detail) {
      throw new HTTPException(404, { message: "Course not found" });
    }

    return c.json(detail, 200);
  } catch (err) {
    if (err instanceof HTTPException) return err.getResponse();
    console.error("GET /courses/:id failed:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default courses;

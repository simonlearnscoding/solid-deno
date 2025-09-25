import { Hono } from "@hono/hono";
import { Context } from "jsr:@hono/hono";
import { HTTPException } from "@hono/hono/http-exception";
import { Types } from "mongoose";

import { toNumber } from "./../utils/geo.ts";

import { HonoVars } from "./../../types/index.ts";
import {
  fetchCourses,
  fetchCoursesNearbyFlat,
  fetchCoursesInBounds,
  fetchCoursesNearbyGeoJSON,
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

// routes/courses.ts
courses.get("/in-bounds", async (c) => {
  const q = c.req.query();
  const swLng = Number(q.swLng),
    swLat = Number(q.swLat);
  const neLng = Number(q.neLng),
    neLat = Number(q.neLat);
  const limit = Math.min(Number(q.limit ?? 300), 500);

  if ([swLng, swLat, neLng, neLat].some((v) => Number.isNaN(v)))
    throw new HTTPException(400, { message: "Invalid bounds" });

  const list = await fetchCoursesInBounds({
    swLng,
    swLat,
    neLng,
    neLat,
    limit,
  });
  return c.json(list, 200);
});

courses.get("/near", async (c) => {
  const q = c.req.query();
  const lng = toNumber(q.lng);
  const lat = toNumber(q.lat);
  const max = toNumber(q.max) ?? 10000;
  const limit = Math.min(toNumber(q.limit) ?? 200, 500);
  const format = (q.format ?? "flat").toLowerCase();

  if (
    lng === undefined ||
    lat === undefined ||
    lng < -180 ||
    lng > 180 ||
    lat < -90 ||
    lat > 90
  ) {
    throw new HTTPException(400, {
      message: "lng and lat are required numbers",
    });
  }

  const result =
    format === "geojson"
      ? await fetchCoursesNearbyGeoJSON({ lng, lat, max, limit })
      : await fetchCoursesNearbyFlat({ lng, lat, max, limit });

  return c.json(result, 200);
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

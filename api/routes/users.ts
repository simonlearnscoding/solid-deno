import { Hono } from "@hono/hono";
import { HTTPException } from "@hono/hono/http-exception";
import { Context } from "jsr:@hono/hono";
import User from "./../models/User.ts";
import { HonoVars } from "./../../types/index.ts";

import { getMyCourses } from "../services/courses.ts";
import {
  fetchTrainingsForUser,
  fetchNextTrainingForUser,
  fetchThisWeekConfirmedTrainings,
} from "../services/trainings.ts";

const users = new Hono<{ Variables: HonoVars }>();

users.get("/me", async (c: Context) => {
  const email = c.var.email; // set by auth middleware

  const user = await User.findOne({ email })
    .select({ id: 1, name: 1, email: 1, avatarUrl: 1 })
    .lean()
    .exec();

  if (!user) throw new HTTPException(404, { message: "User not found" });
  return c.json({ user }, 200);
});

users.get("/courses", async (c: Context) => {
  const email = c.var.email; // set by auth middleware

  const user = await User.findOne({ email })
    .select({ id: 1, name: 1, email: 1, avatarUrl: 1 })
    .lean()
    .exec();

  const res = await getMyCourses(email as string);
  if (!user) throw new HTTPException(404, { message: "User not found" });
  return c.json(res, 200);
});
users.get("/me/trainings/week/confirmed", async (c) => {
  const email = c.var.email;
  const list = await fetchThisWeekConfirmedTrainings(email as string);
  return c.json(list, 200);
});
users.get("/me/trainings/next", async (c) => {
  const email = c.var.email;
  const res = await fetchNextTrainingForUser(email as string);
  return c.json(res, 200);
});

users.get("/me/trainings", async (c: Context) => {
  const email = c.var.email;
  const q = c.req.query("q")?.trim();
  const res = await fetchTrainingsForUser(email as string, q);
  return c.json(res, 200);
});

export default users;

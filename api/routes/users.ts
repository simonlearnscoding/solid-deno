import { Hono } from "@hono/hono";
import { HTTPException } from "hono/http-exception"; // Add this import
import { Context } from "jsr:@hono/hono";

import User from "./../models/User.ts";

import { setCookie, deleteCookie, getCookie } from "jsr:@hono/hono/cookie";

import { verifyToken } from "../services/auth.ts";

import {
  fetchTrainingsForUser,
  fetchNextTrainingForUser,
  fetchThisWeekConfirmedTrainings,
} from "../services/trainings.ts";
const users = new Hono();

users.get("/me", async (c: Context) => {
  try {
    console.log("Getting user info...");

    const token = getCookie(c, "token");
    if (!token) throw new HTTPException(401, { message: "No token provided" });

    const payload = await verifyToken(token); // throws if expired/invalid

    if (!payload?.email) {
      throw new HTTPException(401, { message: "Invalid token payload" });
    }

    // Lookup user in DB by payload.sub or email
    const user = await User.findOne({ email: payload.email }).exec();
    if (!user) throw new HTTPException(404, { message: "User not found" });

    return c.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (err: any) {
    if (err.name === "JwtTokenExpired") {
      return c.json({ error: "Token expired" }, 401);
    }
    if (err instanceof HTTPException) {
      return err.getResponse();
    }
    console.error("Unexpected error in /me:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});
users.get("/me/trainings/week/confirmed", async (c: Context) => {
  try {
    const token = getCookie(c, "token");
    if (!token) throw new HTTPException(401, { message: "No token provided" });

    const payload = await verifyToken(token);
    if (!payload?.email)
      throw new HTTPException(401, { message: "Invalid token payload" });

    const list = await fetchThisWeekConfirmedTrainings(payload.email as string);

    // For lists, prefer 200 with [] instead of 204 – simpler for the client.
    console.log("Confirmed trainings for this week:", list);
    return c.json(list, 200);
  } catch (err: any) {
    if (err.name === "JwtTokenExpired")
      return c.json({ error: "Token expired" }, 401);
    if (err instanceof HTTPException) return err.getResponse();
    console.error("Unexpected error in /me/trainings/week/confirmed:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});
users.get("/me/trainings/next", async (c) => {
  try {
    const token = getCookie(c, "token");
    if (!token) throw new HTTPException(401, { message: "No token provided" });

    const payload = await verifyToken(token); // throws if invalid/expired
    if (!payload?.email)
      throw new HTTPException(401, { message: "Invalid token payload" });

    const next = await fetchNextTrainingForUser(payload.email as string);
    if (!next) return c.body(null, 204); // no content

    return c.json(next, 200);
  } catch (err: any) {
    if (err.name === "JwtTokenExpired")
      return c.json({ error: "Token expired" }, 401);
    if (err instanceof HTTPException) return err.getResponse();
    console.error("Unexpected error in /me/trainings/next:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

users.get("/me/trainings", async (c: Context) => {
  try {
    console.log("Getting user trainings...");

    const token = getCookie(c, "token");
    if (!token) throw new HTTPException(401, { message: "No token provided" });

    const payload = await verifyToken(token); // throws if expired/invalid

    if (!payload?.email) {
      throw new HTTPException(401, { message: "Invalid token payload" });
    }

    const q = c.req.query("q")?.trim();
    console.log("Query parameter:", q);

    const res = await fetchTrainingsForUser(payload.email as string, q);

    // trainings return

    return c.json(res, 200);
  } catch (err: any) {
    if (err.name === "JwtTokenExpired") {
      return c.json({ error: "Token expired" }, 401);
    }
    if (err instanceof HTTPException) {
      return err.getResponse();
    }
    console.error("Unexpected error in /me/trainings:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default users;

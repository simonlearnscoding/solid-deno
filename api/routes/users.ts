import { Hono } from "@hono/hono";
import { HTTPException } from "hono/http-exception"; // Add this import
import { Context } from "jsr:@hono/hono";

import User from "./../models/User.ts";

import { setCookie, deleteCookie, getCookie } from "jsr:@hono/hono/cookie";

import { verifyToken } from "../services/auth.ts";

import { fetchTrainingsForUser } from "../services/trainings.ts";
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

users.get("/me/trainings", async (c: Context) => {
  try {
    console.log("Getting user trainings...");

    const token = getCookie(c, "token");
    if (!token) throw new HTTPException(401, { message: "No token provided" });

    const payload = await verifyToken(token); // throws if expired/invalid

    if (!payload?.email) {
      throw new HTTPException(401, { message: "Invalid token payload" });
    }

    const res = await fetchTrainingsForUser(payload.email);
    console.log("Fetched trainings for user:", payload.email);
    console.log(res);
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

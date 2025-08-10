import { Hono } from "@hono/hono";
import { HTTPException } from "hono/http-exception"; // Add this import
import { Context } from "jsr:@hono/hono";
import { saveImageToUploads } from "../lib/uploadImage.ts";
const isProd = Deno.env.get("NODE_ENV") === "production";

import {
  verifyToken,
  validateUser,
  generateToken,
  registerUser,
} from "../services/auth.ts";
import { setCookie, deleteCookie, getCookie } from "jsr:@hono/hono/cookie";

const auth = new Hono();

auth.post("/logout", (c: Context) => {
  deleteCookie(c, "token");

  // Delete refresh token with the same path it was set with
  deleteCookie(c, "refreshToken", {
    path: "/auth/refresh", // Must match the path used when setting the cookie
  });
  return c.json({ message: "Logout successful" }, 200, {});
});

auth.post("/refresh", async (c: Context) => {
  console.log("Refreshing token...");
  const refreshToken = getCookie(c, "refreshToken");
  console.log("refreshToken:", refreshToken);
  if (!refreshToken) return c.json({ error: "No refresh token" }, 401);

  try {
    const { email } = await verifyToken(refreshToken);

    const newAccessToken = await generateToken({ email }, 60 * 15);
    setCookie(c, "token", newAccessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "Strict",
      path: "/",
      maxAge: 60 * 15,
    });

    return c.json({ message: "Access token refreshed" });
  } catch {
    return c.json({ error: "Invalid refresh token" }, 401);
  }
});

auth.post("/login", async (c: Context) => {
  const { email, password } = await c.req.json();

  const user = await validateUser(email, password);
  if (!user) return c.json({ error: "Invalid credentials" }, 401);

  const token = await generateToken({ email: user.email }, 60 * 30); // 15 minutes
  const refreshToken = await generateToken({ email }, 24 * 60 * 60 * 30); // 30 days

  setCookie(c, "token", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "Strict",
    path: "/",
    maxAge: 60 * 15,
  });

  setCookie(c, "refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "Strict",
    path: "/auth/refresh", // 🔒 only sent to refresh endpoint
    maxAge: 60 * 60 * 24 * 30,
  });
  // Set secure HTTP-only cookie
  return c.json({ message: "Login successful", user }, 200, {});
});

auth.post("/register", async (c: Context) => {
  const form = await c.req.formData();

  // text fields
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");
  const name = String(form.get("name") ?? "");

  if (!email || !password || !name) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  let avatarUrl: string | undefined;
  const avatar = form.get("avatar");
  if (avatar instanceof File && avatar.size > 0) {
    try {
      const saved = await saveImageToUploads(avatar, "avatars");
      avatarUrl = saved.publicUrl;
      // (optional) keep saved.diskPath in case you want to delete later
    } catch (e: any) {
      return c.json({ error: e.message ?? "Avatar upload failed" }, 400);
    }
  }
  const user = await registerUser(email, password, name, { avatarUrl });
  if (!user) return c.json({ error: "User already exists" }, 409);

  const token = await generateToken({ email: user.email }, 60 * 30); // 15 minutes
  const refreshToken = await generateToken({ email }, 24 * 60 * 60 * 30); // 30 days

  setCookie(c, "token", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "Strict",
    maxAge: 60 * 15,
    path: "/",
  });

  setCookie(c, "refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "Strict",
    path: "/auth/refresh", // 🔒 only sent to refresh endpoint
    maxAge: 60 * 60 * 24 * 30,
  });
  return c.json({ user });
});

export default auth;

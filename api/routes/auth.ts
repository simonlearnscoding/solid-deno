import { Hono } from "@hono/hono";

import {
  verifyToken,
  validateUser,
  generateToken,
  registerUser,
} from "../services/auth.ts";
import { setCookie, deleteCookie, getCookie } from "jsr:@hono/hono/cookie";

const auth = new Hono();

auth.post("/logout", (c) => {
  deleteCookie(c, "token");
  deleteCookie(c, "refreshToken");
  return c.json({ message: "Logout successful" }, 200, {});
});

auth.post("/refresh", async (c) => {
  const refreshToken = getCookie(c, "refreshToken");
  if (!refreshToken) return c.json({ error: "No refresh token" }, 401);

  try {
    const { email } = await verifyToken(refreshToken);

    const newAccessToken = await generateToken({ email }, 60 * 15);
    setCookie(c, "token", newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      path: "/",
    });

    return c.json({ message: "Access token refreshed" });
  } catch {
    return c.json({ error: "Invalid refresh token" }, 401);
  }
});

auth.post("/login", async (c) => {
  const { email, password } = await c.req.json();

  const user = await validateUser(email, password);
  if (!user) return c.json({ error: "Invalid credentials" }, 401);

  const token = await generateToken({ email: user.email }, 15); // 15 minutes
  const refreshToken = await generateToken({ email }, 60); // 30 days

  setCookie(c, "token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    path: "/",
  });

  setCookie(c, "refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    path: "/refresh", // 🔒 only sent to refresh endpoint
  });
  // Set secure HTTP-only cookie
  return c.json({ message: "Login successful", user }, 200, {});
});

//TODO: shouldnt I pass all user data all the time?
auth.get("/me", async (c: any) => {
  const token = getCookie(c, "token");
  if (!token) return c.json({ error: "Token non existent" }, 401);
  const { email } = await verifyToken(token);
  if (!email) return c.json({ error: "Token Invalid" }, 401);
  return c.json({ user: { email } });
});

//TODO: fix any with actual cookies type
auth.post("/register", async (c: any) => {
  const { email, password, name } = await c.req.json();

  const user = await registerUser(email, password, name);
  if (!user) return c.json({ error: "User already exists" }, 409);

  const token = await generateToken({ email: user.email }, 60 * 15); // 15 minutes
  const refreshToken = await generateToken({ email }, 60 * 60 * 24 * 30); // 30 days

  setCookie(c, "token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    path: "/",
  });

  setCookie(c, "refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    path: "/refresh", // 🔒 only sent to refresh endpoint
  });
  return c.json({ user });
});

export default auth;

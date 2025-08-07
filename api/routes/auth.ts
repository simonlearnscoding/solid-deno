import { Hono } from "@hono/hono";
import { HTTPException } from "hono/http-exception"; // Add this import

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
  console.log("Refreshing token...");
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

auth.get("/me", async (c) => {
  try {
    console.log("Getting user info...");

    const token = getCookie(c, "token");
    if (!token) {
      throw new HTTPException(401, { message: "No token provided" });
    }

    try {
      // Verify token and get the payload
      const payload = await verifyToken(token);

      if (!payload?.email) {
        throw new HTTPException(401, { message: "Invalid token payload" });
      }

      // Calculate remaining time if exp exists in payload
      if (payload.exp) {
        const now = Math.floor(Date.now() / 1000); // Current time in seconds
        const expiresIn = payload.exp - now;

        console.log(`Token expires in: ${expiresIn} seconds`);

        // You could also include this in the response if needed:
        return c.json({
          user: { email: payload.email },
          expiresIn,
        });
      }

      return c.json({ user: { email: payload.email } });
    } catch (e) {
      // Handle JWT-specific errors
      if (e instanceof Error && e.name === "JwtTokenExpired") {
        const error = e as { expiredAt?: number };
        const expiredAt = error.expiredAt
          ? new Date(error.expiredAt * 1000)
          : null;

        console.log(
          `Token expired at: ${expiredAt?.toISOString() || "unknown time"}`,
        );
        throw new HTTPException(401, { message: "Token expired" });
      }
      throw new HTTPException(401, { message: "Token verification failed" });
    }
  } catch (error) {
    console.error("Error in /me endpoint:", error);
    if (error instanceof HTTPException) {
      return error.getResponse();
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

//TODO: fix any with actual cookies type
auth.post("/register", async (c: any) => {
  const { email, password, name } = await c.req.json();

  const user = await registerUser(email, password, name);
  if (!user) return c.json({ error: "User already exists" }, 409);

  const token = await generateToken({ email: user.email }, 15); // 15 minutes
  const refreshToken = await generateToken({ email }, 30); // 30 days

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

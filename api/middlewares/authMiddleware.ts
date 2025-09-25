// middleware/logger.ts
import { createMiddleware } from "jsr:@hono/hono/factory";
import { HTTPException } from "@hono/hono/http-exception";
import type { MiddlewareHandler } from "jsr:@hono/hono";

import { getCookie } from "jsr:@hono/hono/cookie";
import { verifyToken } from "../services/auth.ts";

const authMiddleware: MiddlewareHandler = async (c, next) => {
  console.log("getting token from cookie...");

  const token = getCookie(c, "token");
  if (!token) throw new HTTPException(401, { message: "No token provided" });

  const payload = await verifyToken(token); // throws if expired/invalid
  if (!payload?.email) {
    throw new HTTPException(401, { message: "Invalid token payload" });
  }
  c.set("email", payload.email);
  await next();
};

export default authMiddleware;

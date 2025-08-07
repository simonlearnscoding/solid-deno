import { Hono } from "@hono/hono";
// import authMiddleware from "./../middlewares/authMiddleware.ts";
import { verifyToken } from "../services/auth.ts";
import { MiddlewareHandler } from "jsr:@hono/hono";
import { getCookie } from "jsr:@hono/hono/cookie";

const api = new Hono();

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const token = getCookie(c, "token");
  console.log("Token from cookie:", token);

  // if (!token) {
  //   return c.json({ error: "Unauthorized" }, 401);
  // }

  try {
    // const payload = await verifyToken(token);
    // c.set("user", payload); // Store user data in context
    await next();
  } catch (error) {
    return c.json({ error: "Invalid token" }, 401);
  }
};

api.use("*", authMiddleware);

api.get("/test", (c) => {
  return c.json({ message: "API is working!" });
});

export default api;

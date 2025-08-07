// middleware/logger.ts
import { createMiddleware } from "jsr:@hono/hono/factory";
import type { MiddlewareHandler } from "jsr:@hono/hono";

const loggerMiddleware: MiddlewareHandler = async (c, next) => {
  console.log(`[${c.req.method}] ${c.req.url}`);
  await next();
};

export default loggerMiddleware;

import { load } from "jsr:@std/dotenv";

import { HTTPException } from "hono/http-exception";

// Load variables from .env into Deno.env
await load({ export: true });
import { Hono } from "@hono/hono";
import { connectDB } from "./../lib/db.ts";
import authMiddleware from "./middlewares/authMiddleware.ts";
import loggerMiddleware from "./middlewares/loggerMiddleware.ts";
import authRoutes from "./routes/auth.ts";
import usersRoutes from "./routes/users.ts";
import trainingRoutes from "./routes/trainings.ts";
import coursesRoutes from "./routes/courses.ts";
import { serveStatic } from "jsr:@hono/hono/serve-static";

import { cors } from "jsr:@hono/hono/cors";
const app = new Hono();
// 1. Initialize Database
await connectDB().catch((err: Error) => {
  console.error("Failed to connect to MongoDB:", err);
  Deno.exit(1);
});

//  Serve Static Files
app.use("/uploads/*", serveStatic({ root: "./uploads" }));

// CORS Configuration
app.use(
  "*",
  cors({
    origin: ["http://localhost:5173"], // Array of allowed origins
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type"],
    exposeHeaders: ["Content-Type"],
  }),
);

app.use("*", loggerMiddleware);
// Apply to everything except /auth/*
app.use("*", async (c, next) => {
  const p = c.req.path;
  if (c.req.path.startsWith("/auth")) {
    console.log("Skipping auth middleware for path:", c.req.path);
    return next(); // skip auth
  }
  console.log("checking auth middleware for path:", c.req.path);
  await authMiddleware(c, next);
});
// app.use("/api", authMiddleware);
app.route("/auth", authRoutes);
app.route("/users", usersRoutes);
app.route("/trainings", trainingRoutes);
app.route("/courses", coursesRoutes);

app.onError((err, c) => {
  if (err instanceof HTTPException) return err.getResponse();
  console.error(err);
  return c.json({ error: "Internal server error" }, 500);
});

app.notFound((c) => c.json({ message: "Not Found" }, 404));
Deno.serve({ port: 8000 }, app.fetch);

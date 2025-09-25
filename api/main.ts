import { load } from "jsr:@std/dotenv";
import { HTTPException } from "@hono/hono/http-exception";
import { serveStatic } from "@hono/hono/serve-static";
import { cors } from "@hono/hono/cors";
import { Hono } from "@hono/hono";

import { connectDB } from "./../lib/db.ts";
import authMiddleware from "./middlewares/authMiddleware.ts";
import loggerMiddleware from "./middlewares/loggerMiddleware.ts";

import authRoutes from "./routes/auth.ts";
import usersRoutes from "./routes/users.ts";
import trainingRoutes from "./routes/trainings.ts";
import coursesRoutes from "./routes/courses.ts";

// Load .env
await load({ export: true });

const app = new Hono();

// 1. Connect DB
await connectDB().catch((err: Error) => {
  console.error("Failed to connect to MongoDB:", err);
  Deno.exit(1);
});

// 2. Static uploads
app.use("/uploads/*", serveStatic({ root: "./uploads" }));

// 3. CORS
app.use(
  "*",
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type"],
    exposeHeaders: ["Content-Type"],
  }),
);

// 4. Health check
app.get("/api/ping", (c) =>
  c.json({ message: "pong from API", ts: Date.now() }, 200, {
    "Cache-Control": "no-store",
  }),
);

// 5. Global logging
app.use("*", loggerMiddleware);

// 6. Public routes
app.route("/api/auth", authRoutes);

// 7. Protected routes (attach authMiddleware only here)
app.use("/api/users/*", authMiddleware);
app.use("/api/trainings/*", authMiddleware);
app.use("/api/courses/*", authMiddleware);

app.route("/api/users", usersRoutes);
app.route("/api/trainings", trainingRoutes);
app.route("/api/courses", coursesRoutes);

// 8. Error handling
app.onError((err, c) => {
  if (err instanceof HTTPException) return err.getResponse();
  console.error(err);
  return c.json({ error: "Internal server error" }, 500);
});

app.notFound((c) => c.json({ message: "Not Found" }, 404));

// 9. Serve
Deno.serve({ port: 8000 }, app.fetch);

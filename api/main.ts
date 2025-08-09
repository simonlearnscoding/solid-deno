import { load } from "jsr:@std/dotenv";

// Load variables from .env into Deno.env
await load({ export: true });
import { Hono } from "@hono/hono";
import { connectDB } from "./../lib/db.ts";
import authRoutes from "./routes/auth.ts";
import usersRoutes from "./routes/users.ts";
import apiRoutes from "./routes/api.ts";
import trainingRoutes from "./routes/trainings.ts";
import authMiddleware from "./middlewares/authMiddleware.ts";
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

// app.use("/api", authMiddleware);
app.route("/auth", authRoutes);
app.route("/api", apiRoutes);
app.route("/users", usersRoutes);
app.route("/trainings", trainingRoutes);

app.get("/auth/test", (c) => {
  return c.json({ message: "Middleware passed hahahaha!" });
});

Deno.serve({ port: 8000 }, app.fetch);

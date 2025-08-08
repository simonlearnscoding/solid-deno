import { Hono } from "@hono/hono";
import { HTTPException } from "hono/http-exception"; // Add this import

const users = new Hono();

export default users;

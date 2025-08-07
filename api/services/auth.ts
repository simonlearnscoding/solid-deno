import { sign, verify } from "@hono/jwt";
import User from "./../models/User.ts";

const secret = "your-secret-key";

export async function validateUser(email: string, password: string) {
  const user = await User.findOne({ email }).exec();
  if (!user) return null;

  if (user.password !== password) return null; // Replace with bcrypt later

  return { email: user.email, id: user._id };
}

export async function generateToken(
  payload: Record<string, unknown>,
  expiresInSeconds,
) {
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  return await sign({ ...payload, exp }, secret);
}

export async function verifyToken(token: string) {
  return await verify(token, secret); // HS256 is default, so optional
}

export async function registerUser(
  email: string,
  password: string,
  name: string,
) {
  const existing = await User.findOne({ email }).exec();
  if (existing) return null;

  const user = await User.create({
    email,
    //TODO: hash later
    password,
    name,
  });

  return { email: user.email, id: user._id };
}

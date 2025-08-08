import { sign, verify } from "@hono/jwt";
import User from "./../models/User.ts";
import bcrypt from "bcryptjs";

const secret = "your-secret-key";

// ------- LOGIN VALIDATION -------
export async function validateUser(email: string, password: string) {
  const doc = await User.findOne({ email }).exec();
  if (!doc) return null;

  const ok = await bcrypt.compare(password, doc.password);
  if (!ok) return null;

  // return only safe/public fields
  return {
    id: doc._id.toString(),
    email: doc.email,
    name: doc.name,
    avatarUrl: doc.avatarUrl as string | undefined,
  };
}

export async function registerUser(
  email: string,
  password: string,
  name: string,
  opts: RegisterOpts = {},
) {
  // guard against dupes
  const existing = await User.findOne({ email }).lean().exec();
  if (existing) return null;

  // hash
  const hashed = await bcrypt.hash(password, 12);

  const doc = await User.create({
    email,
    password: hashed,
    name,
    avatarUrl: opts.avatarUrl, // schema should allow this field
  });

  return {
    id: doc._id.toString(),
    email: doc.email,
    name: doc.name,
    avatarUrl: doc.avatarUrl as string | undefined,
  };
}

export async function generateToken(
  payload: Record<string, unknown>,
  expiresInSeconds: number,
) {
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  return await sign({ ...payload, exp }, secret);
}

export async function verifyToken(token: string) {
  return await verify(token, secret); // HS256 is default, so optional
}

type RegisterOpts = {
  avatarUrl?: string;
};

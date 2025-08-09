import "https://deno.land/std@0.224.0/dotenv/load.ts";

export const BASE_URL = Deno.env.get("BASE_URL") ?? "http://localhost:8000";

export function randomEmail() {
  return `test_${Date.now()}_${Math.floor(Math.random() * 1e6)}@example.com`;
}

export function cookieHeaderFrom(headers: Headers): string {
  const any = headers as any;
  const pairs: string[] = [];
  if (typeof any.getSetCookie === "function") {
    for (const sc of any.getSetCookie()) pairs.push(sc.split(";")[0]);
  } else {
    for (const [k, v] of headers)
      if (k.toLowerCase() === "set-cookie") pairs.push(v.split(";")[0]);
  }
  return pairs.join("; ");
}

export async function register(email: string, password: string, name: string) {
  const fd = new FormData();
  fd.append("email", email);
  fd.append("password", password);
  fd.append("name", name);

  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    body: fd,
  });
  const bodyText = await res.text(); // consume once
  const body = bodyText ? JSON.parse(bodyText) : null;
  return {
    status: res.status,
    headers: res.headers,
    body,
    bodyText,
    cookie: cookieHeaderFrom(res.headers),
  };
}

export async function login(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const bodyText = await res.text(); // consume once
  let body: any = null;
  try {
    body = JSON.parse(bodyText);
  } catch {}
  return {
    status: res.status,
    headers: res.headers,
    body,
    bodyText,
    cookie: cookieHeaderFrom(res.headers),
  };
}

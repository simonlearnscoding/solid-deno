// tests/auth_test.ts
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import {
  assert,
  assertEquals,
  assertMatch,
} from "https://deno.land/std@0.224.0/testing/asserts.ts";

const BASE_URL = Deno.env.get("BASE_URL") ?? "http://localhost:8000";

function randomEmail() {
  return `test_${Date.now()}_${Math.floor(Math.random() * 1e6)}@example.com`;
}

function buildCookieHeaderFromHeaders(headers: Headers): string {
  const pairs: string[] = [];
  // Deno has getSetCookie on Headers in newer versions
  const anyHeaders = headers as any;
  if (typeof anyHeaders.getSetCookie === "function") {
    for (const sc of anyHeaders.getSetCookie()) pairs.push(sc.split(";")[0]);
  } else {
    for (const [k, v] of headers)
      if (k.toLowerCase() === "set-cookie") pairs.push(v.split(";")[0]);
  }
  return pairs.join("; ");
}

async function register(email: string, password: string, name: string) {
  const fd = new FormData();
  fd.append("email", email);
  fd.append("password", password);
  fd.append("name", name);

  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    body: fd,
  });
  const bodyText = await res.text(); // consume ONCE
  const body = bodyText ? JSON.parse(bodyText) : null;
  return {
    status: res.status,
    headers: res.headers,
    cookieHeader: buildCookieHeaderFromHeaders(res.headers),
    body,
    bodyText,
  };
}

async function login(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const bodyText = await res.text(); // consume ONCE
  let body: any = null;
  try {
    body = JSON.parse(bodyText);
  } catch {}
  return {
    status: res.status,
    headers: res.headers,
    cookieHeader: buildCookieHeaderFromHeaders(res.headers),
    body,
    bodyText,
  };
}

Deno.test(
  "Register: creates user, sets token cookie, returns user DTO",
  async () => {
    const email = randomEmail();
    const { status, body, cookieHeader, bodyText } = await register(
      email,
      "Password123!",
      "Test User",
    );
    if (status !== 200)
      throw new Error(`register failed: ${status} ${bodyText}`);
    assert(body?.user);
    assertEquals(body.user.email, email);
    assert(cookieHeader.includes("token="));
  },
);

Deno.test(
  "Login: returns 200, sets token cookie, /users/me works",
  async () => {
    const email = randomEmail();
    await register(email, "Password123!", "Login Test");

    const { status, cookieHeader, bodyText } = await login(
      email,
      "Password123!",
    );
    if (status !== 200) throw new Error(`login failed: ${status} ${bodyText}`);
    assert(cookieHeader.includes("token="));

    const meRes = await fetch(`${BASE_URL}/users/me`, {
      headers: { Cookie: cookieHeader },
    });
    const meText = await meRes.text(); // consume ONCE
    const me = meText ? JSON.parse(meText) : null;
    assertEquals(me?.user?.email, email);
  },
);

Deno.test("Login: wrong password returns non-200", async () => {
  const email = randomEmail();
  await register(email, "Password123!", "WrongPwd Test");

  const { status, bodyText } = await login(email, "WRONG_PASSWORD");
  if (!(status >= 400 && status < 500)) {
    throw new Error(`expected 4xx, got ${status}. Body: ${bodyText}`);
  }
});

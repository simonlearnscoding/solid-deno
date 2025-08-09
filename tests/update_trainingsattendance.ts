import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.224.0/testing/asserts.ts";
import { BASE_URL, randomEmail, register, login } from "./_helpers.ts";

function extractTokenFromSetCookie(headers: Headers): string | null {
  const any = headers as any;
  const setCookies: string[] =
    typeof any.getSetCookie === "function" ? any.getSetCookie() : [];
  const all: string[] = setCookies.length
    ? setCookies
    : Array.from(headers.entries())
        .filter(([k]) => k.toLowerCase() === "set-cookie")
        .map(([, v]) => v);

  for (const sc of all) {
    const m = sc.match(/\btoken=([^;]+)/);
    if (m) return m[1];
  }
  return null;
}

async function getAnyUpcomingTrainingId(
  cookieHeader: string,
): Promise<string | null> {
  const res = await fetch(`${BASE_URL}/users/me/trainings`, {
    headers: { Cookie: cookieHeader },
  });
  if (res.status === 204) {
    await res.text();
    return null;
  }
  const txt = await res.text();
  if (!res.ok) throw new Error(`trainings failed: ${res.status} ${txt}`);
  const data = txt ? JSON.parse(txt) : [];
  if (!Array.isArray(data) || data.length === 0) return null;
  return data[0]?.id ?? null;
}

Deno.test(
  "PATCH /trainings/:id (toggle, no body) → present then pending",
  async () => {
    // You can use a fixed seeded user if you prefer
    const email = randomEmail();
    const password = "Password123!";
    const name = "Toggle Test";
    const reg = await register(email, password, name);
    assert(
      reg.status === 200,
      `register failed: ${reg.status} ${reg.bodyText}`,
    );

    const log = await login(email, password);
    assert(log.status === 200, `login failed: ${log.status} ${log.bodyText}`);

    const bearer = extractTokenFromSetCookie(log.headers);
    assert(!!bearer, "failed to extract token");
    const auth = `Bearer ${bearer}`;

    const trainingId = await getAnyUpcomingTrainingId(log.cookie);
    if (!trainingId) {
      console.warn("[SKIP] No upcoming trainings to toggle.");
      return;
    }

    // First toggle — should set to "present"
    const r1 = await fetch(`${BASE_URL}/trainings/${trainingId}`, {
      method: "PATCH",
      headers: { Authorization: auth },
    });
    const t1 = await r1.text();
    assert(r1.ok, `toggle 1 failed: ${r1.status} ${t1}`);
    const j1 = JSON.parse(t1);
    assertEquals(j1.status, "present");

    // Second toggle — should set to "pending"
    const r2 = await fetch(`${BASE_URL}/trainings/${trainingId}`, {
      method: "PATCH",
      headers: { Authorization: auth },
    });
    const t2 = await r2.text();
    assert(r2.ok, `toggle 2 failed: ${r2.status} ${t2}`);
    const j2 = JSON.parse(t2);
    assertEquals(j2.status, "pending");
  },
);

Deno.test("PATCH /trainings/:id explicit set to absent", async () => {
  const email = randomEmail();
  const password = "Password123!";
  const name = "Explicit Set Test";
  const reg = await register(email, password, name);
  assert(reg.status === 200, `register failed: ${reg.status} ${reg.bodyText}`);

  const log = await login(email, password);
  assert(log.status === 200, `login failed: ${log.status} ${log.bodyText}`);

  const bearer = extractTokenFromSetCookie(log.headers);
  assert(!!bearer, "failed to extract token");
  const auth = `Bearer ${bearer}`;

  const trainingId = await getAnyUpcomingTrainingId(log.cookie);
  if (!trainingId) {
    console.warn("[SKIP] No upcoming trainings to set absent.");
    return;
  }

  const res = await fetch(`${BASE_URL}/trainings/${trainingId}`, {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
      Authorization: auth,
    },
    body: JSON.stringify({ isAttending: "absent" }),
  });
  const txt = await res.text();
  assert(res.ok, `explicit set failed: ${res.status} ${txt}`);
  const json = JSON.parse(txt);
  assertEquals(json.status, "absent");
});

Deno.test("PATCH /trainings/:id 401 when no Authorization", async () => {
  const res = await fetch(`${BASE_URL}/trainings/64a1f2c8a1f2c8a1f2c8a1f2`, {
    method: "PATCH",
  });
  const body = await res.text();
  assertEquals(
    res.status,
    401,
    `Expected 401, got ${res.status}. Body: ${body}`,
  );
});

Deno.test("PATCH /trainings/:id 400 invalid id", async () => {
  const email = randomEmail();
  const password = "Password123!";
  const name = "BadId";
  await register(email, password, name);
  const log = await login(email, password);
  const bearer = extractTokenFromSetCookie(log.headers);
  const auth = `Bearer ${bearer}`;

  const res = await fetch(`${BASE_URL}/trainings/not-a-valid-id`, {
    method: "PATCH",
    headers: { Authorization: auth },
  });
  const body = await res.text();
  assertEquals(
    res.status,
    400,
    `Expected 400, got ${res.status}. Body: ${body}`,
  );
});

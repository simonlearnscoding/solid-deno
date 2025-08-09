import {
  assert,
  assertEquals,
  assertMatch,
} from "https://deno.land/std@0.224.0/testing/asserts.ts";
import { BASE_URL, randomEmail, register, login } from "./_helpers.ts";

// If your seed guarantees upcoming trainings for new users, great.
// If not, you can ensure membership/attendance via another seed or endpoint.

Deno.test("GET /users/me/trainings returns 200 or 204", async () => {
  const email = "simon@example.com";
  const password = "123";

  const log = await login(email, password);
  assert(log.status === 200, `Login failed: ${log.status} ${log.bodyText}`);

  const res = await fetch(`${BASE_URL}/users/me/trainings`, {
    headers: { Cookie: log.cookie },
  });

  assert(
    res.status === 200 || res.status === 204,
    `Expected 200 or 204, got ${res.status} ${await res.text()}`,
  );
});

Deno.test("GET /users/me/trainings returns 401 without cookie", async () => {
  const res = await fetch(`${BASE_URL}/users/me/trainings`);
  const body = await res.text(); // drain
  assertEquals(
    res.status,
    401,
    `Expected 401, got ${res.status}. Body: ${body}`,
  );
});

// 🧪 Shape test (only runs when there IS data)
Deno.test(
  "GET /users/me/trainings returns items with the expected shape",
  async () => {
    const email = randomEmail();
    const password = "Password123!";
    const name = "Test User";

    // register
    const reg = await register(email, password, name);
    assert(
      reg.status === 200,
      `Register failed: ${reg.status} ${reg.bodyText}`,
    );

    // login
    const log = await login(email, password);
    assert(log.status === 200, `Login failed: ${log.status} ${log.bodyText}`);

    // fetch
    const res = await fetch(`${BASE_URL}/users/me/trainings`, {
      headers: { Cookie: log.cookie },
    });
    const data = await res.json();

    console.log("Status:", res.status);
    console.log("Raw response JSON:", JSON.stringify(data, null, 2));

    assert(Array.isArray(data), "Response must be an array");

    for (const item of data) {
      console.log("Training item:", item); // log each item separately
    }
    // Validate each item matches the desired model
    for (const t of data) {
      // Required top-level fields
      assert("id" in t && typeof t.id === "string", "id missing or not string");
      assert(
        "title" in t && typeof t.title === "string",
        "title missing or not string",
      );
      assert(
        "date" in t && typeof t.date === "string",
        "date missing or not string",
      );
      assert(
        "startTime" in t && typeof t.startTime === "string",
        "startTime missing or not string",
      );
      assert(
        "endTime" in t && typeof t.endTime === "string",
        "endTime missing or not string",
      );
      assert(
        "location" in t && typeof t.location === "string",
        "location missing or not string",
      );
      assert(
        "category" in t && typeof t.category === "string",
        "category missing or not string",
      );
      assert(
        "imageUrl" in t && typeof t.imageUrl === "string",
        "imageUrl missing or not string",
      );

      // Count fields
      assert(
        "attending" in t && typeof t.attending === "number",
        "attending missing or not number",
      );
      assert(
        "declined" in t && typeof t.declined === "number",
        "declined missing or not number",
      );
      assert(
        "unconfirmed" in t && typeof t.unconfirmed === "number",
        "unconfirmed missing or not number",
      );

      // Trainer object
      assert(
        "trainer" in t && typeof t.trainer === "object" && t.trainer !== null,
        "trainer missing",
      );
      assert(
        "name" in t.trainer && typeof t.trainer.name === "string",
        "trainer.name missing or not string",
      );
      assert(
        "avatarUrl" in t.trainer && typeof t.trainer.avatarUrl === "string",
        "trainer.avatarUrl missing or not string",
      );

      // Formats
      assertMatch(t.date, /^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD");
      assertMatch(t.startTime, /^\d{2}:\d{2}$/, "startTime must be HH:MM");
      assertMatch(t.endTime, /^\d{2}:\d{2}$/, "endTime must be HH:MM");
    }
  },
);

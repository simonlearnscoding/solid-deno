// tests/auth.test.ts
import { assertEquals } from "jsr:@std/assert@0.224.0";

const testUser = {
  email: "testuser@example.com",
  password: "hunter2",
  name: "Test User",
};

Deno.test(
  "POST /api/register creates a new user and returns a JWT",
  async () => {
    const res = await fetch("http://localhost:8000/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testUser),
    });

    // Allow re-running test even if user exists
    if (res.status === 409) {
      console.warn("User already exists, skipping creation test");
      return;
    }

    assertEquals(res.status, 200);
    const data = await res.json();
    console.log("Register Token:", data.token);
    if (!data.token) throw new Error("Missing token in response");
  },
);

Deno.test("POST /api/login returns a JWT on success", async () => {
  const res = await fetch("http://localhost:8000/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: testUser.email,
      password: testUser.password,
    }),
  });

  assertEquals(res.status, 200);
  const data = await res.json();
  console.log("Login Token:", data.token);
  if (!data.token) throw new Error("Missing token in response");
});

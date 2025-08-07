// src/lib/api/authFetch.ts
export async function authFetch(
  fetchFn: typeof fetch,
  input: RequestInfo,
  init: RequestInit = {},
): Promise<Response> {
  const url = typeof input === "string" ? input : input.url;

  // **Don’t intercept your own login or refresh calls**
  if (url.endsWith("/login") || url.endsWith("/refresh")) {
    return fetchFn(input, init);
  }

  init.credentials = init.credentials ?? "include";

  let res = await fetchFn(input, init);
  if (res.status !== 401) return res;

  // **If we’re already on /login, bail out instead of redirecting again**
  if (window.location.pathname === "/login") {
    return res;
  }

  // try refresh…
  const refreshRes = await fetchFn("/refresh", {
    method: "POST",
    credentials: "include",
  });
  if (!refreshRes.ok) {
    window.location.href = "/login";
    throw new Error("Not authenticated");
  }

  // retry original…
  res = await fetchFn(input, init);
  if (res.status === 401) {
    window.location.href = "/login";
    throw new Error("Not authenticated");
  }
  return res;
}

// src/lib/api/authFetch.ts
export async function authFetch(
  fetchFn: typeof fetch,
  input: RequestInfo,
  init: RequestInit = {},
): Promise<Response> {
  const url = typeof input === "string" ? input : input.url;

  // **Don’t intercept your own login or refresh calls**
  if (url.endsWith("/login") || url.endsWith("/refresh")) {
    console.log("Skipping authFetch for login or refresh URL:", url);
    return fetchFn(input, init);
  }

  console.log("authFetch called with URL:", url);
  init.credentials = init.credentials ?? "include";

  let res = await fetchFn(input, init);
  console.log("Initial response status:", res.status);
  if (res.status !== 401) return res;
  console.log("Unauthorized response, attempting to refresh token...");

  // try refresh…
  //
  try {
    console.log("hitting refresh endpoint...");
    const refreshRes = await fetchFn("/refresh", {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    console.error("Error during token refresh:", error);
    window.location.href = "/login";
    throw new Error("Not authenticated");
  }

  if (window.location.pathname === "/login") {
    return res;
  }

  console.log("refresh successful, retrying original request...");
  // retry original…
  res = await fetchFn(input, init);
  if (res.status === 401) {
    window.location.href = "/login";
    throw new Error("Not authenticated");
  }
  return res;
}

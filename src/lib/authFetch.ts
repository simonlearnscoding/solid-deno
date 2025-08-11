// src/lib/api/authFetch.ts
const nativeFetch = globalThis.fetch.bind(globalThis);
const API_BASE = new URL(
  import.meta.env.VITE_API_URL ?? "http://localhost:8000",
);

function isOurApi(urlStr: string) {
  // Support relative URLs
  const u = new URL(urlStr, location.origin);
  return (
    u.origin === API_BASE.origin &&
    u.pathname.startsWith(API_BASE.pathname || "")
  );
}

export async function authFetch(
  fetchFn: typeof fetch,
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const url = typeof input === "string" ? input : (input as Request).url;

  // ✅ Only intercept your own API
  if (!isOurApi(url)) {
    return nativeFetch(input as any, init);
  }

  // For login/refresh, just include cookies and pass-through
  if (url.endsWith("/login") || url.endsWith("/refresh")) {
    return nativeFetch(input as any, { ...init, credentials: "include" });
  }

  // Add credentials/headers for API calls
  const nextInit: RequestInit = {
    ...init,
    credentials: "include",
    headers: new Headers(init.headers as any),
  };

  let res = await nativeFetch(input as any, nextInit);
  if (res.status !== 401) return res;

  // try refresh
  await nativeFetch(new URL("/auth/refresh", API_BASE).toString(), {
    method: "POST",
    credentials: "include",
  });

  res = await nativeFetch(input as any, nextInit);
  if (res.status === 401) {
    // optional: redirect
    // window.location.href = "/login";
    throw new Error("Not authenticated");
  }
  return res;
}

// src/setupFetch.ts
import { authFetch } from "./lib/authFetch.ts";

// Override the browser’s fetch
window.fetch = authFetch;

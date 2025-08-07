/* @refresh reload */
import { authFetch } from "./lib/authFetch.ts";

// grab the real fetch once
const realFetch = window.fetch.bind(window);

// override global fetch
window.fetch = async (input: RequestInfo, init?: RequestInit) => {
  // delegate to your authFetch, but pass realFetch in
  return authFetch(realFetch, input, init);
};
import { render } from "solid-js/web";
import "./index.css";
import App from "./App.tsx";

const root = document.getElementById("root");

render(() => <App />, root!);

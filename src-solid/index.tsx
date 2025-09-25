import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./Appp";
import { authFetch } from "./lib/authFetch";

// grab the real fetch once
const realFetch = window.fetch.bind(window);

// override global fetch
window.fetch = async (input: RequestInfo, init?: RequestInit) => {
  return authFetch(realFetch, input, init);
};

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

createRoot(root).render(<App />);

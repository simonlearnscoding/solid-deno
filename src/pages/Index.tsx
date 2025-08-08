import { createSignal, For, onMount } from "solid-js";
import LogoutButton from "../components/LogoutButton.tsx";
import { A } from "@solidjs/router";
export default function Index() {
  return (
    <main class="flex justify-center items-center flex-col h-screen bg-base-200">
      {/* <input */}
      {/*   type="checkbox" */}
      {/*   value="synthwave" */}
      {/*   class="toggle theme-controller" */}
      {/* /> */}
      <h1>Welcome to the Dinosaur app</h1>
      <p>Click on a dinosaur below to learn more.</p>
    </main>
  );
}

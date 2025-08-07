import { createSignal, For, onMount } from "solid-js";
import LogoutButton from "../components/LogoutButton.tsx";
import { A } from "@solidjs/router";
export default function Index() {
  return (
    <main>
      <h1>Welcome to the Dinosaur app</h1>
      <p>Click on a dinosaur below to learn more.</p>
      <A href={"/login"}>Login</A>
      <LogoutButton />
    </main>
  );
}

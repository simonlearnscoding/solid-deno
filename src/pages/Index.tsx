import { createSignal, For, onMount } from "solid-js";
import LogoutButton from "../components/LogoutButton.tsx";
import { A } from "@solidjs/router";
export default function Index() {
  const [timeLeft, setTimeLeft] = createSignal(15);
  setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 0) return 0;
      return prev - 1;
    });
  }, 1000);
  return (
    <main>
      <h1>Welcome to the Dinosaur app</h1>
      <p>Click on a dinosaur below to learn more.</p>
      <A href={"/login"}>Login</A>
      <p>Time left: {timeLeft()} seconds</p>
      <LogoutButton />
    </main>
  );
}

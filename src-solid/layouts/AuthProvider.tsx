import { createEffect, createSignal, onMount } from "solid-js";
import { useAuthStore } from "../stores/authStore";

export default function AuthProvider(props: { children: any }) {
  const auth = useAuthStore();
  const [initialized, setInitialized] = createSignal(false);

  onMount(async () => {
    await auth.actions.verifyToken();
    setInitialized(true);
  });

  createEffect(() => {
    console.log("Auth state changed:", auth.state.user);
  });

  return initialized() ? props.children : <div>Checking session...</div>;
}

import { Navigate, type RouteSectionProps } from "@solidjs/router";
import { useAuthStore } from "../../stores/authStore";
import { Show } from "solid-js";

export default function ProtectedRoute(props: RouteSectionProps) {
  const auth = useAuthStore();

  return (
    <Show when={auth.state.user} fallback={<Navigate href="/login" />}>
      {props.children}
    </Show>
  );
}

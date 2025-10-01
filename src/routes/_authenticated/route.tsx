// routes/_authenticated/route.tsx
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useAuthStore } from "../../stores/useAuth";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ location }) => {
    const { user } = useAuthStore();
    if (!user) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: () => <Outlet />,
});

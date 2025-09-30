import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRoute({
  component: () => (
    <>
      {/* Your app layout */}
      <Outlet />
      {/* TODO: remove devtools in production */}
      <TanStackRouterDevtools />
    </>
  ),
});

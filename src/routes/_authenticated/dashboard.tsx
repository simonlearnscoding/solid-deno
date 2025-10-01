import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: () => <h1>Dashboard (Protected)</h1>,
});

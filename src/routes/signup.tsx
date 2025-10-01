import { createFileRoute } from "@tanstack/react-router";
import RegisterForm from "../components/auth/RegisterForm";

export const Route = createFileRoute("/signup")({
  component: RouteComponent,
});

function RouteComponent() {
  return <RegisterForm />;
}

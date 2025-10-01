import { createFileRoute, redirect } from "@tanstack/react-router";
import LoginForm from "../components/auth/LoginForm";
// import { useAuthStore } from "../stores/useAuth";

export const Route = createFileRoute("/login")({
  component: LoginComponent,
  // Add route-specific logic here:
  beforeLoad: ({ context }) => {
    // Redirect if already authenticated
    // if (context.auth.isAuthenticated) {
    //   throw redirect({ to: '/' });
    // }
  },
});

function LoginComponent() {
  // const auth = useAuthStore();
  const navigate = Route.useNavigate();

  const handleLogin = async (email: string, password: string) => {
    // await auth.actions.login(email, password);
    console.log("Login attempt:", { email, password });
    // Navigate on success
    navigate({ to: "/" });
  };

  const handleNavigateToSignup = () => {
    navigate({ to: "/signup" });
  };

  return (
    <LoginForm
      onSubmit={handleLogin}
      // loading={auth.state.loading}
      // error={auth.state.error}
      onNavigateToSignup={handleNavigateToSignup}
    />
  );
}

import { createFileRoute, redirect } from "@tanstack/react-router";
import LoginForm from "../components/auth/LoginForm";
import { useAuthStore } from "../stores/useAuth";

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
  const login = useAuthStore((state) => state.actions.login);

  const handleLogin = async (email: string, password: string) => {
    // await auth.actions.login(email, password);
    console.log("Login attempt:", { email, password });
    await login(email, password);
    // Navigate on success
    navigate({ to: "/" });
  };

  const handleNavigateToSignup = () => {
    navigate({ to: "/signup" });
  };

  return (
    <LoginForm
      onSubmit={handleLogin}
      error={useAuthStore((state) => state.error)}
      loading={useAuthStore((state) => state.loading)}
      // loading={auth.state.loading}
      // error={auth.state.error}
      onNavigateToSignup={handleNavigateToSignup}
    />
  );
}

import { createStore } from "solid-js/store";

type AuthState = {
  user: { email: string } | null;
  loading: boolean;
  error: string | null;
};

const [authState, setAuthState] = createStore<AuthState>({
  user: null,
  loading: false,
  error: null,
});

const actions = {
  async verifyToken() {
    try {
      const res = await fetch("http://localhost:8000/auth/me", {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error();
      }

      //TODO: this should return more than just the email token lets just 
      //fetch the user one time won't hurt
      const resp = await res.json();
      setAuthState({ user: resp.user, loading: false });
    } catch (err: any) {
      console.log("error getting token");
    }
  },
  async register(email: string, password: string, name: string) {
    setAuthState({ loading: true, error: null });
    try {
      const res = await fetch("http://localhost:8000/auth/register", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      if (!res.ok) {
        const text = await res.json();
        throw new Error((await text?.error) || "Registration failed");
      }
      // Auto-login after registration
      const resp = await res.json();
      setAuthState({ user: resp.user, loading: false });
    } catch (err: any) {
      setAuthState({
        error: err.message || "Registration failed",
        loading: false,
      });
      throw err;
    }
  },
  async login(email: string, password: string) {
    setAuthState({ loading: true, error: null });
    try {
      const res = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      //TODO: kinda nasty but it'll do for now
      if (!res.ok) throw new Error("error logging in");

      const resp = await res.json();
      console.log("resp", resp);
      setAuthState({ user: resp.user, loading: false });
    } catch (err) {
      setAuthState({ error: "User or Password wrong", loading: false });
    }
  },
  logout() {
    setAuthState({ user: null });
    fetch("/auth/logout", { method: "POST" });
  },
};

// Hook-style accessor (like Zustand)
export function useAuthStore() {
  // Optional: Add derived state (like Zustand's selectors)

  return {
    state: authState,
    actions,
  };
}

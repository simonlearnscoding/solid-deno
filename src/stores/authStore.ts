import { createStore } from "solid-js/store";

type User = {
  id?: string;
  email: string;
  name?: string;
  avatarUrl?: string;
};

type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
};

const [authState, setAuthState] = createStore<AuthState>({
  user: null,
  loading: false,
  error: null,
});

type RegisterInput = {
  email: string;
  password: string;
  name: string;
  avatar?: File; // optional
};
const actions = {
  async verifyToken() {
    try {
      const res = await fetch("http://localhost:8000/users/me", {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error();
      }
      const resp = await res.json();
      console.log(resp);
      setAuthState({ user: resp.user, loading: false });
    } catch (err: any) {
      console.log("error getting token", err.message);
    }
  },

  async register(input: RegisterInput) {
    setAuthState({ loading: true, error: null });
    try {
      const fd = new FormData();
      fd.append("email", input.email);
      fd.append("password", input.password);
      fd.append("name", input.name);
      if (input.avatar) fd.append("avatar", input.avatar);

      const res = await fetch("http://localhost:8000/auth/register", {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Registration failed");
      setAuthState({ loading: false });
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      //TODO: kinda nasty but it'll do for now
      if (!res.ok) throw new Error("error logging in");

      setAuthState({ loading: false });
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

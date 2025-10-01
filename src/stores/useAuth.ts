import { create } from "zustand";

type User = {
  id?: string;
  email: string;
  name?: string;
  avatarUrl?: string;
};

type RegisterInput = {
  email: string;
  password: string;
  name: string;
  avatar?: File;
};

const authApi = {
  verifyToken: async (): Promise<User> => {
    const res = await fetch("/api/users/me", {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Token verification failed");
    const data = await res.json();
    return data.user;
  },

  login: async (email: string, password: string): Promise<void> => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error("Login failed");
  },

  register: async (input: RegisterInput): Promise<void> => {
    const fd = new FormData();
    fd.append("email", input.email);
    fd.append("password", input.password);
    fd.append("name", input.name);
    if (input.avatar) fd.append("avatar", input.avatar);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      credentials: "include",
      body: fd,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Registration failed");
  },

  logout: async (): Promise<void> => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  },
};

type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
  actions: {
    verifyToken: () => Promise<void>;
    register: (input: RegisterInput) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
  };
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  error: null,

  actions: {
    verifyToken: async () => {
      try {
        set({ loading: true, error: null });
        const user = await authApi.verifyToken();
        set({ user, loading: false });
      } catch (error: any) {
        set({ user: null, loading: false, error: error.message });
      }
    },

    register: async (input: RegisterInput) => {
      set({ loading: true, error: null });
      try {
        await authApi.register(input);
        // After successful registration, verify token to get user data
        await get().actions.verifyToken();
      } catch (error: any) {
        set({
          error: error.message || "Registration failed",
          loading: false,
        });
        throw error;
      }
    },

    login: async (email: string, password: string) => {
      set({ loading: true, error: null });
      try {
        await authApi.login(email, password);
        // After successful login, verify token to get user data
        await get().actions.verifyToken();
      } catch (error: any) {
        set({ error: "User or Password wrong", loading: false });
        throw error;
      }
    },

    logout: () => {
      set({ user: null, error: null });
      // Fire and forget - don't wait for response
      authApi.logout().catch(console.error);
    },
  },
}));

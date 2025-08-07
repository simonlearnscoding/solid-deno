import { createSignal } from "solid-js";
import { A } from "@solidjs/router";
import { useAuthStore } from "../stores/authStore.ts";

export default function Register() {
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [name, setName] = createSignal("");
  const auth = useAuthStore();

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    await auth.actions.register(email(), password(), name());
  };

  return (
    <div class="max-w-md mx-auto mt-10 p-6 card shadow-2xl bg-base-100 rounded-lg ">
      <h2 class="text-2xl font-bold mb-6 text-center">Create Account</h2>

      {auth.state.error && (
        <div class="mb-4 p-2  text-red-700 rounded">{auth.state.error}</div>
      )}

      {auth.state.user ? (
        <div class="text-center space-y-4">
          <div class="p-4 bg-green-100 text-green-700 rounded">
            Registration successful!
          </div>
          <p>
            <A href="/" class="text-indigo-600 hover:underline">
              Continue to your dashboard
            </A>
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} class="space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={name()}
              onInput={(e) => setName(e.currentTarget.value)}
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email()}
              onInput={(e) => setEmail(e.currentTarget.value)}
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label
              for="password"
              class="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password()}
              onInput={(e) => setPassword(e.currentTarget.value)}
              required
              minlength="6"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div class="flex items-center justify-between">
            <div class="text-sm">
              Already have an account?{" "}
              <A href="/login" class="text-indigo-600 hover:underline">
                Sign in
              </A>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={auth.state.loading}
              class={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                auth.state.loading
                  ? "bg-gray-400"
                  : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              }`}
            >
              {auth.state.loading ? "Registering..." : "Register"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

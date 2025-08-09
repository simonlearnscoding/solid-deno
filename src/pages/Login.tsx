import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { Show } from "solid-js";
import { useAuthStore } from "../stores/authStore.ts";
import { createEffect } from "solid-js";

export default function Login() {
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const auth = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    await auth.actions.login(email(), password());
    navigate("/", { replace: true });
  };

  return (
    <div class="hero min-h-screen bg-base-200">
      <div class="hero-content flex-col w-full max-w-md">
        <div class="text-center">
          <h1 class="text-3xl font-bold">Login</h1>
          <p class="py-4">Welcome back! Please enter your credentials</p>
        </div>

        <div class="card w-full shadow-2xl bg-base-100">
          <div class="card-body">
            <Show when={auth.state.error}>
              <div class="alert alert-error">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="stroke-current shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{auth.state.error}</span>
              </div>
            </Show>

            <form onSubmit={handleSubmit} class="space-y-4">
              <div class="form-control mt-10">
                <label class="label">
                  <span class="label-text">Email</span>
                </label>
                <input
                  type="email"
                  value={email()}
                  onInput={(e) => setEmail(e.currentTarget.value)}
                  required
                  class="input ml-3 input-bordered"
                  placeholder="your@email.com"
                />
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text">Password</span>
                </label>
                <input
                  type="password"
                  value={password()}
                  onInput={(e) => setPassword(e.currentTarget.value)}
                  required
                  class="input ml-3 input-bordered"
                  placeholder="••••••••"
                />
              </div>

              <div class="form-control flex flex-col gap-2 mt-14">
                <button
                  type="submit"
                  class="btn btn-primary"
                  disabled={auth.state.loading}
                >
                  {auth.state.loading ? (
                    <>
                      <span class="loading loading-spinner"></span>
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </button>
                <div class="divider"> or </div>
                <div
                  class="cursor-pointer text-blue-500"
                  onClick={() => {
                    // Login logic
                    navigate("/signup", { replace: true });
                  }}
                >
                  Sign up
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

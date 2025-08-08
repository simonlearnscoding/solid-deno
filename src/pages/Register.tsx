import { createSignal, onCleanup } from "solid-js";
import { A } from "@solidjs/router";
import { useAuthStore } from "../stores/authStore.ts";

export default function Register() {
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [name, setName] = createSignal("");
  const [file, setFile] = createSignal<File | null>(null);
  const [preview, setPreview] = createSignal<string | null>(null);
  const [imgError, setImgError] = createSignal<string | null>(null);

  const auth = useAuthStore();

  function onFileChange(e: Event) {
    const f = (e.currentTarget as HTMLInputElement).files?.[0] ?? null;
    setImgError(null);
    setFile(null);
    if (!f) {
      if (preview()) URL.revokeObjectURL(preview()!);
      setPreview(null);
      return;
    }
    const ok = ["image/jpeg", "image/png", "image/webp"];
    if (!ok.includes(f.type)) return setImgError("Choose a JPG, PNG, or WEBP.");
    if (f.size > 5 * 1024 * 1024) return setImgError("Max size is 5MB.");
    setFile(f);
    if (preview()) URL.revokeObjectURL(preview()!);
    setPreview(URL.createObjectURL(f));
  }

  onCleanup(() => preview() && URL.revokeObjectURL(preview()!));

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    await auth.actions.register({
      email: email(),
      password: password(),
      name: name(),
      avatar: file() ?? undefined,
    });
    if (auth.state.user) {
      // Redirect to home or dashboard after successful registration
      window.location.href = "/";
    }
  };

  return (
    <section class="hero min-h-screen flex justify-center items-center  bg-gradient-to-br from-base-200 to-base-300">
      <div class="hero-content  flex-col">
        <div class="card w-full max-w-md glass shadow-xl rounded-2xl">
          <div class="card-body space-y-5">
            {/* Title */}
            <h2 class="text-3xl font-extrabold text-center text-primary">
              Create Account
            </h2>

            {/* Avatar */}
            <div class="flex flex-col items-center">
              <div class="avatar">
                <div class="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden">
                  {preview() ? (
                    <img src={preview()!} alt="Avatar preview" />
                  ) : (
                    <div class="flex items-center justify-center bg-base-300 h-full w-full text-sm text-base-content/60">
                      No avatar
                    </div>
                  )}
                </div>
              </div>
              <label class="btn btn-link mt-2">
                <input
                  type="file"
                  accept="image/*"
                  onInput={onFileChange}
                  hidden
                />
                Change avatar
              </label>
              {imgError() && <p class="text-error text-sm">{imgError()}</p>}
            </div>

            {/* Inputs */}
            <div class="form-control">
              <label class="label">
                <span class="label-text">Full Name</span>
              </label>
              <input
                type="text"
                value={name()}
                onInput={(e) => setName(e.currentTarget.value)}
                class="input input-bordered w-full"
                required
              />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Email</span>
              </label>
              <input
                type="email"
                value={email()}
                onInput={(e) => setEmail(e.currentTarget.value)}
                class="input input-bordered w-full"
                required
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
                class="input input-bordered w-full"
                required
                minlength="6"
              />
            </div>

            {/* Actions */}
            <button
              type="submit"
              onClick={handleSubmit}
              class={`btn btn-primary w-full ${auth.state.loading ? "loading" : ""}`}
            >
              {auth.state.loading ? "Registering…" : "Register"}
            </button>

            <p class="text-center text-sm">
              Already have an account?{" "}
              <A class="link link-primary" href="/login">
                Sign in
              </A>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

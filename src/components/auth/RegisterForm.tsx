import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "../../stores/useAuth";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imgError, setImgError] = useState<string | null>(null);

  const { loading, error } = useAuthStore();
  const { register } = useAuthStore().actions;
  const navigate = useNavigate();

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setImgError(null);
    setFile(null);

    if (!f) {
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      return;
    }

    const ok = ["image/jpeg", "image/png", "image/webp"];
    if (!ok.includes(f.type)) return setImgError("Choose a JPG, PNG, or WEBP.");
    if (f.size > 5 * 1024 * 1024) return setImgError("Max size is 5MB.");

    setFile(f);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(f));
  }

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await register({
        email,
        password,
        name,
        avatar: file ?? undefined,
      });
      navigate({ to: "/" });
    } catch (error) {
      // Error is already handled in the store
      console.error("Registration failed:", error);
    }
  };

  const handleNavigateToLogin = () => {
    navigate({ to: "/login" });
  };

  return (
    <section className="hero min-h-screen flex justify-center items-center bg-gradient-to-br from-base-200 to-base-300">
      <div className="hero-content flex-col">
        <div className="card w-full max-w-md glass shadow-xl rounded-2xl">
          <div className="card-body space-y-5">
            {/* Title */}
            <h2 className="text-3xl font-extrabold text-center text-primary">
              Create Account
            </h2>

            {/* Avatar */}
            <div className="flex flex-col items-center">
              <div className="avatar">
                <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden">
                  {preview ? (
                    <img src={preview} alt="Avatar preview" />
                  ) : (
                    <div className="flex items-center justify-center bg-base-300 h-full w-full text-sm text-base-content/60">
                      No avatar
                    </div>
                  )}
                </div>
              </div>
              <label className="btn btn-link mt-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={onFileChange}
                  className="hidden"
                />
                Change avatar
              </label>
              {imgError && <p className="text-error text-sm">{imgError}</p>}
            </div>

            {/* Inputs */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Full Name</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input input-bordered w-full"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input input-bordered w-full"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input input-bordered w-full"
                required
                minLength={6}
              />
            </div>

            {/* Error Display */}
            {error && (
              <div className="alert alert-error">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Actions */}
            <button
              type="submit"
              onClick={handleSubmit}
              className={`btn btn-primary w-full ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? "Registering…" : "Register"}
            </button>

            <p className="text-center text-sm">
              Already have an account?{" "}
              <span
                className="link link-primary cursor-pointer"
                onClick={handleNavigateToLogin}
              >
                Sign in
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

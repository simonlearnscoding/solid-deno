import { useState } from "react";

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  onNavigateToSignup?: () => void;
}

export default function LoginForm({
  onSubmit,
  loading = false,
  error = null,
  onNavigateToSignup,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(email, password);
  };

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content flex-col w-full max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Login</h1>
          <p className="py-4">Welcome back! Please enter your credentials</p>
        </div>

        <div className="card w-full shadow-2xl bg-base-100">
          <div className="card-body">
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control mt-10">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input ml-3 input-bordered"
                  placeholder="your@email.com"
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
                  required
                  className="input ml-3 input-bordered"
                  placeholder="••••••••"
                />
              </div>

              <div className="form-control flex flex-col gap-2 mt-14">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="loading loading-spinner"></span>
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </button>
                <div className="divider"> or </div>
                <div
                  className="cursor-pointer mx-auto text-blue-500"
                  onClick={onNavigateToSignup}
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

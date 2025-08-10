import LogoutButton from "../components/LogoutButton.tsx";
import { AiOutlineMail } from "solid-icons/ai";
import { FaSolidLocationDot } from "solid-icons/fa";
import { useAuthStore } from "../stores/authStore.ts";
import { Show } from "solid-js";

type UserProfile = {
  name: string;
  role: "Trainer" | "Student";
  email: string;
  location?: string;
  avatarUrl?: string;
};

export default function ProfilePage() {
  const auth = useAuthStore();

  return (
    <div class="min-h-dvh bg-base-200">
      <Show
        when={auth.state.user}
        fallback={
          <div class="min-h-dvh bg-base-200 flex items-center justify-center">
            <div class="text-center">
              <h1 class="text-2xl font-bold">
                Please log in to view your profile
              </h1>
              <LogoutButton />
            </div>
          </div>
        }
      >
        {(u) => {
          // Call the accessor to get the actual user object
          const user = u();
          return (
            <>
              <header class="max-w-3xl mx-auto px-4 pt-8 pb-4">
                <h1 class="text-3xl font-extrabold text-base-content">
                  Profile
                </h1>
              </header>

              <main class="max-w-3xl mx-auto px-4 pb-12">
                <section class="card bg-base-100 shadow-md">
                  <div class="card-body gap-6">
                    <div class="flex flex-col items-center text-center gap-3">
                      <div class="avatar">
                        <div class="w-28 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                          <img
                            src={
                              user.avatarUrl ??
                              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&h=300&fit=crop"
                            }
                            alt={`${user.name} avatar`}
                          />
                        </div>
                      </div>

                      <div>
                        <h2 class="text-2xl font-bold">{user.name}</h2>
                        <div class="mt-2">
                          <span class="badge badge-lg badge-primary">
                            {user.role || "Student"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div class="grid gap-3 sm:grid-cols-2">
                      <div class="flex items-center gap-3 p-3 rounded-xl bg-base-200">
                        <AiOutlineMail class="w-5 h-5 opacity-80" />
                        <a
                          href={`mailto:${user.email}`}
                          class="link link-hover break-all"
                          title={user.email}
                        >
                          {user.email}
                        </a>
                      </div>

                      <div class="flex items-center gap-3 p-3 rounded-xl bg-base-200">
                        <FaSolidLocationDot class="w-5 h-5 opacity-80" />
                        <span class="truncate">{user.location || "Sister blvd 24, Sesame Street"}</span>
                      </div>
                    </div>

                    <div class="grid grid-cols-3 gap-3">
                      <div class="stat bg-base-200 rounded-xl">
                        <div class="stat-title">Trainings</div>
                        <div class="stat-value text-primary">24</div>
                        <div class="stat-desc">this month</div>
                      </div>
                      <div class="stat bg-base-200 rounded-xl">
                        <div class="stat-title">Present</div>
                        <div class="stat-value text-success">18</div>
                        <div class="stat-desc">+3 this week</div>
                      </div>
                      <div class="stat bg-base-200 rounded-xl">
                        <div class="stat-title">Absences</div>
                        <div class="stat-value text-error">2</div>
                        <div class="stat-desc">last 30 days</div>
                      </div>
                    </div>
                  </div>
                </section>
              </main>
            </>
          );
        }}
      </Show>
    </div>
  );
}

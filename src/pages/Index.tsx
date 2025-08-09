import { For, Suspense } from "solid-js";
import RightSidebar from "../components/RightSidebar.tsx";
import useQueryUpcomingTrainings from "../hooks/queries/useQueryUpcomingTraining.ts";
import LeftSidebar from "../components/LeftSidebar.tsx";
import TrainingCard from "../components/TrainingCard.tsx";

import { useAuthStore } from "../stores/authStore.ts";

export default function Index() {
  const auth = useAuthStore();
  const user = auth.state.user;
  const query = useQueryUpcomingTrainings();
  return (
    <div class="flex flex-col gap-3 px-4 pt-8 h-screen overflow-hidden">
      <div class="flex">
        <h1 class="font-bold">Welcome, {user?.name}</h1>
        <div class="ml-auto avatar md:hidden">
          <div class="rounded-full w-12 h-12">
            <img
              src={
                user?.avatarUrl ||
                "https://api.dicebear.com/5.x/initials/svg?seed=User"
              }
              alt="User Avatar"
            />
          </div>
        </div>
      </div>

      <div class="flex flex-1 min-h-0">
        <LeftSidebar />
        <div class="flex flex-col flex-grow min-h-0">
          {/* Scrollable content container */}
          <div class="flex-1 min-h-0 overflow-y-auto">
            <div class="flex flex-col gap-3 py-4">
              <Suspense
                fallback={Array.from({ length: 8 }, (_, i) => (
                  <div class="skeleton w-full h-48 bg-gray-200 rounded-lg"></div>
                ))}
              >
                <For each={query.data}>
                  {(training) => <TrainingCard training={training} />}
                </For>
              </Suspense>
            </div>
          </div>
        </div>
        <RightSidebar />
      </div>
    </div>
  );
}

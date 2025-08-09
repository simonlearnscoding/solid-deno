import { For } from "solid-js";
import RightSidebar from "../components/RightSidebar.tsx";
import LeftSidebar from "../components/LeftSidebar.tsx";
import TrainingCard from "../components/TrainingCard.tsx";
import { trainings } from "../data/trainings.ts";
import { useAuthStore } from "../stores/authStore.ts";

export default function Index() {
  const auth = useAuthStore();
  const user = auth.state.user;
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
              <For each={trainings}>
                {(training) => <TrainingCard training={training} />}
              </For>
            </div>
          </div>
        </div>
        <RightSidebar />
      </div>
    </div>
  );
}

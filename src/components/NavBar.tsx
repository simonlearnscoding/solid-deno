// ResponsiveNav.tsx
import { A, useLocation } from "@solidjs/router";
import { createMemo, For, type Accessor } from "solid-js";
import { AiFillHome } from "solid-icons/ai";
import { AiOutlineSearch } from "solid-icons/ai";
import { BsPersonFill } from "solid-icons/bs";
import { useAuthStore } from "../stores/authStore.ts";

const NAV = [
  {
    to: "/search",
    label: "Search",
    icon: AiOutlineSearch,
  },

  {
    to: "/",
    label: "Home",
    icon: AiFillHome,
  },
  {
    to: "/profile",
    label: "Profile",
    icon: BsPersonFill,
  },
];

type ActiveFn = (to: string) => Accessor<boolean>;
const MobileBottomDock = ({ active }: { active: ActiveFn }) => {
  return (
    <div class="dock md:hidden">
      <For each={NAV}>
        {(item) => (
          <A href={item.to} classList={{ active: active(item.to)() }}>
            <button>
              <item.icon class="btm-nav-icon" />
            </button>
            <span class="btm-nav-label">{item.label}</span>
          </A>
        )}
      </For>
    </div>
  );
};

const TopNavBar = ({ active }: { active: ActiveFn }) => {
  const auth = useAuthStore();
  const user = auth.state.user;
  return (
    <div class="navbar bg-base-100 shadow-sm hidden md:flex">
      {" "}
      {/* ← hide whole bar on mobile */}
      <div class="flex-none mx-auto">
        <ul class="menu menu-horizontal p-0">
          <For each={NAV}>
            {(item) => (
              <li classList={{ active: active(item.to)() }}>
                <A href={item.to}>
                  <item.icon class="inline-block mr-2" />
                  {item.label}
                </A>
              </li>
            )}
          </For>
        </ul>
      </div>
      <div class="">
        <div class="rounded-full flex relative w-12 h-12">
          <img
            class="rounded-full w-full h-full object-cover"
            src={
              user?.avatarUrl ||
              "https://api.dicebear.com/5.x/initials/svg?seed=User"
            }
            alt="User Avatar"
          />
        </div>
      </div>
    </div>
  );
};
export default function ResponsiveNav() {
  const loc = useLocation();
  const active = (to: string) => createMemo(() => loc.pathname === to);

  return (
    <>
      <TopNavBar active={active} />

      <MobileBottomDock active={active} />
    </>
  );
}

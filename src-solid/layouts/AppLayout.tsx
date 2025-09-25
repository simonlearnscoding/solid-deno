// import { Outlet } from "@solidjs/router";
import ResponsiveNav from "../components/NavBar.tsx"; // the navbar/dock we made

// AppLayout.tsx
export default function AppLayout(props: { children: any }) {
  return (
    <div class="h-dvh min-h-0 max-h-dvh overflow-hidden flex flex-col bg-base-200">
      <ResponsiveNav />
      {/* Change overflow-hidden to overflow-auto for scrollable content */}
      <main class="flex-1 min-h-0 overflow-auto pb-16 md:pb-0">
        {props.children}
      </main>
    </div>
  );
}

// import { Outlet } from "@solidjs/router";
import ResponsiveNav from "../components/NavBar.tsx"; // the navbar/dock we made

export default function AppLayout(props: { children: any }) {
  return (
    <div class="h-dvh min-h-0 flex flex-col bg-base-200">
      <ResponsiveNav />
      {/* space for top navbar on desktop and bottom dock on mobile */}
      <main class="flex-1 min-h-0 overflow-hidden pb-16 md:pb-0">
        {props.children}
      </main>
    </div>
  );
}

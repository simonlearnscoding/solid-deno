import { ErrorBoundary, Suspense, For } from "solid-js";
import { useQuery } from "@tanstack/solid-query";
import { createEffect } from "solid-js";

const fetchDinosaurs = async () => {
  const res = await fetch("api/test");
  console.log("Raw response:", res); // Debug raw response
  if (!res.ok) throw new Error("Failed to fetch dinosaurs");
  return await res.json();
};

export default function Index() {
  const query = useQuery(() => ({
    queryKey: ["dinosaurs"],
    queryFn: fetchDinosaurs,
    staleTime: 100 * 60 * 5,
  }));

  return (
    <main>
      <Suspense fallback={<div>Loading...</div>}>
        <div>{query.data?.message}</div>
      </Suspense>
    </main>
  );
}

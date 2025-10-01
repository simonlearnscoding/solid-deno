import { createFileRoute } from "@tanstack/react-router";

import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { data, error, isLoading } = useQuery({
    queryKey: ["ping"],
    queryFn: async () => {
      const res = await fetch("/api/ping", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  if (isLoading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-600">Error fetching API</p>;
  return (
    <div className="p-2">
      <h3>Welcome Home!</h3>

      <p>API says: {data.message}</p>
    </div>
  );
}

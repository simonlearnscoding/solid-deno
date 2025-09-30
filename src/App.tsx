import { useQuery } from "@tanstack/react-query";

export default function Home() {
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
    <div className="p-6">
      <h1 className="text-xl font-bold">Backend Testyy</h1>
      <p>API says: {data.message}</p>
    </div>
  );
}

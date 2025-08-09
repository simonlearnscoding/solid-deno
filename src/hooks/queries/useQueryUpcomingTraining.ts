import { useQuery } from "@tanstack/solid-query";
import type { Training } from "./../../../types/index.ts"; // adjust path as needed

const fetchUpcomingTrainings = async (search: string): Promise<Training[]> => {
  console.log("Fetching upcoming trainings with search:", search);
  const params = new URLSearchParams();
  if (search) params.append("q", search);

  const res = await fetch(
    `http://localhost:8000/users/me/trainings?${params.toString()}`,
    { credentials: "include" },
  );
  if (!res.ok) throw new Error("Failed to fetch upcoming trainings");
  return res.json();
};

export default function useQueryUpcomingTrainings(search: () => string) {
  console.log("Fetching upcoming trainings with search:", search());
  return useQuery(() => ({
    queryKey: ["upcoming-trainings", search()],
    queryFn: () => fetchUpcomingTrainings(search()),
    staleTime: 1000 * 60 * 5,
  }));
}

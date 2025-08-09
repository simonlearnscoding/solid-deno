import { useQuery } from "@tanstack/solid-query";
import type { Training } from "./../../../types/index.ts"; // adjust path as needed

const fetchUpcomingTrainings = async (): Promise<Training[]> => {
  const res = await fetch("http://localhost:8000/users/me/trainings", {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch upcoming trainings");
  return res.json();
};

export default function useQueryUpcomingTrainings() {
  return useQuery(() => ({
    queryKey: ["upcoming-trainings"],
    queryFn: fetchUpcomingTrainings,
    staleTime: 1000 * 60 * 5, // optional: 5 minutes
  }));
}

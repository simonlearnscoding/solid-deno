
import { useQuery } from "@tanstack/solid-query";
import type { Training } from "../../../types";

const fetchThisWeekConfirmed = async (): Promise<Training[]> => {
  const res = await fetch("http://localhost:8000/users/me/trainings/week/confirmed", {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch confirmed trainings for this week");
  return res.json();
};

export default function useQueryThisWeekConfirmed() {
  return useQuery(() => ({
    queryKey: ["this-week", "confirmed-trainings"],
    queryFn: fetchThisWeekConfirmed,
    staleTime: 1000 * 60 * 5,
  }));
}

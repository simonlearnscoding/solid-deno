// useQueryNextTraining.ts
import { useQuery } from "@tanstack/solid-query";
import type { Training } from "../../../types/index.ts";

const fetchNextTraining = async (): Promise<Training | null> => {
  const res = await fetch("http://localhost:8000/users/me/trainings/next", {
    credentials: "include",
  });

  console.log("API Response:", { status: res.status }); // Debug logging

  if (res.status === 204) return null;
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch next training");
  }

  const data = await res.json();
  console.log("API Data:", data); // Debug logging
  return data;
};

export default function useQueryNextTraining() {
  return useQuery(() => ({
    queryKey: ["next-training"],
    queryFn: fetchNextTraining,
    retry: false, // Disable automatic retries for clearer debugging
  }));
}

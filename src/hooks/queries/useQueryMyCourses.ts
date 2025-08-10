import { useQuery } from "@tanstack/solid-query";
import type { Course } from "../../../types/index.ts";

const fetchCourses = async (): Promise<Course[]> => {
  const res = await fetch("http://localhost:8000/users/courses", {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch courses");
  return res.json();
};

export default function useQueryMyCourses() {
  return useQuery(() => ({
    queryKey: ["courses", "my"],
    queryFn: fetchCourses,
    staleTime: 5 * 60 * 1000,
  }));
}

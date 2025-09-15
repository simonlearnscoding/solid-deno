// hooks/queries/useQueryCourseDetail.ts
import { useQuery } from "@tanstack/solid-query";

const fetchCourseDetail = async (id: string): Promise<any> => {
  const res = await fetch(`/api/courses/${id}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch course detail");
  const resp = res.json();
  return resp;
};

export default function useQueryCourseDetail(id: string) {
  return useQuery(() => ({
    queryKey: ["courses", "detail", id],
    queryFn: () => fetchCourseDetail(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  }));
}

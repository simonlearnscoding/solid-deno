import { useMutation, useQueryClient } from "@tanstack/solid-query";

type AttendanceInput = {
  action: "left" | "active";
  trainingId: string;
};

const mutateFn = async (input: AttendanceInput): Promise<any> => {
  const res = await fetch(
    `http://localhost:8000/courses/${input.trainingId}/enrollment`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: input.action }),
      credentials: "include",
    },
  );
  if (!res.ok) throw new Error("Failed to update user attendance");
  return res.json();
};

export default function useMutateCourseMembership() {
  const queryClient = useQueryClient();

  return useMutation(() => ({
    mutationFn: mutateFn,

    onSuccess: async (_data, vars) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["upcoming-trainings"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["courses", "my"],
          exact: true,
        }),
        queryClient.invalidateQueries({
          queryKey: ["next-training"],
          exact: true,
        }),
        queryClient.invalidateQueries({
          queryKey: ["this-week", "confirmed-trainings"],
          exact: true,
        }),

        queryClient.invalidateQueries({
          queryKey: ["courses", "detail", vars.trainingId],
          exact: true,
        }),
      ]);
    },
    onError: (error) => {
      console.error("Attendance update failed:", error);
    },
  }));
}

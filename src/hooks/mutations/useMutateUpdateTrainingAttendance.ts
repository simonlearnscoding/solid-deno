import { useMutation, useQueryClient } from "@tanstack/solid-query";

type AttendanceInput = {
  isAttending: "present" | "absent";
  trainingId: string;
};

const mutateFn = async (input: AttendanceInput): Promise<any> => {
  const res = await fetch(
    `http://localhost:8000/trainings/${input.trainingId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ isAttending: input.isAttending }),
      credentials: "include",
    },
  );
  if (!res.ok) throw new Error("Failed to update user attendance");
  return res.json();
};

export default function useMutateTrainingAttendance() {
  const queryClient = useQueryClient();

  return useMutation(() => ({
    mutationFn: mutateFn,
    onSuccess: () => {
      // Invalidate both upcoming and next training queries
      queryClient.invalidateQueries({ queryKey: ["upcoming-trainings"] });
      queryClient.invalidateQueries({ queryKey: ["next-training"] });
      queryClient.invalidateQueries({
        queryKey: ["this-week", "confirmed-trainings"],
      });
    },
    onError: (error) => {
      console.error("Attendance update failed:", error);
    },
  }));
}

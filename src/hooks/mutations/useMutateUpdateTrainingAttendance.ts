import { useMutation } from "@tanstack/solid-query";

type Input = {
  isAttending: "present" | "absent";
  trainingId: string;
};

const mutateFn = async (input: Input): Promise<any> => {
  const res = await fetch(
    `http://localhost:8000/trainings/${input.trainingId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ target: input.isAttending }),
      credentials: "include",
    },
  );
  if (!res.ok) throw new Error("Failed to update user attendance");
  return res.json();
};

export default function useMutateUpdateTrainingAttendance() {
  const mtn = () =>
    useMutation({
      //@ts-ignore
      mutationFn: mutateFn,
    });
  return mtn;
}

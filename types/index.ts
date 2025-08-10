//
//TODO: I should consider storing the user id in the token
export type HonoVars = {
  email?: string;
};
export interface Course {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string | null;
  tags?: string[];
  trainer: {
    id: string;
    name: string;
    avatarUrl?: string | null;
    qualifiedName?: string; // e.g., "Certified Coach"
  };
}
export type Training = {
  id: string;
  title: string;
  trainer: {
    name: string;
    avatarUrl: string; // URL to trainer's profile image
  };
  date: string; // ISO format: YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  location: string;
  declined: number; // Number of users who declined
  unconfirmed: number; // Number of users who haven't confirmed
  attending: number;
  category: string; // For color-coding or grouping
  imageUrl: string; // Representative training image
};

// types/CourseDetail.ts
export interface CourseDetail {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string | null;
  trainer: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
  studentCount: number;
  isJoined: boolean;
  myMembership: null | {
    role: "student" | "trainer";
    status: "active" | "invited" | "left" | "banned";
  };
  upcomingTrainings: Array<{
    id: string;
    title: string;
    location?: string;
    startsAt: string; // ISO
    endsAt: string; // ISO
    date: string; // "YYYY-MM-DD"
    startTime: string; // "HH:mm"
    endTime: string; // "HH:mm"
  }>;
}

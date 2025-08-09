
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

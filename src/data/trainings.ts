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

export const trainings: Training[] = [
  {
    id: "1",
    title: "Beginner Boxing",
    trainer: {
      name: "Marco Bianchi",
      avatarUrl:
        "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YXZhdGFyfGVufDB8fDB8fHww",
    },
    date: "2025-08-12",
    startTime: "10:00",
    endTime: "11:00",
    location: "Downtown Gym",
    attending: 12,
    declined: 3,
    unconfirmed: 3,
    category: "Boxing",
    imageUrl:
      "https://plus.unsplash.com/premium_photo-1681400614910-2e80fa375521?q=80&w=977&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // boxing gloves
  },
  {
    id: "2",
    title: "Soccer Practice",
    trainer: {
      name: "Emma Wilson",
      avatarUrl:
        "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=200&h=200&fit=crop",
    },
    date: "2025-08-13",
    startTime: "16:00",
    endTime: "17:30",
    location: "Greenfield Park",
    declined: 3,
    unconfirmed: 5,
    attending: 20,
    category: "Soccer",
    imageUrl:
      "https://plus.unsplash.com/premium_photo-1661868926397-0083f0503c07?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // soccer field
  },
  {
    id: "3",
    title: "Strength Training",
    trainer: {
      name: "Simon Novak",
      avatarUrl:
        "https://plus.unsplash.com/premium_photo-1671656349218-5218444643d8?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8YXZhdGFyfGVufDB8fDB8fHww",
    },
    date: "2025-08-14",
    startTime: "09:00",
    endTime: "10:00",
    location: "Fitness Center",
    declined: 3,
    unconfirmed: 5,
    attending: 10,
    category: "Strength",
    imageUrl:
      "https://plus.unsplash.com/premium_photo-1664536968441-2c68da36ea84?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8d2VpZ2h0c3xlbnwwfHwwfHx8MA%3D%3D", // weightlifting
  },
  {
    id: "4",
    title: "Yoga Flow",
    trainer: {
      name: "Clara Rossi",
      avatarUrl:
        "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=200&h=200&fit=crop",
    },
    date: "2025-08-15",
    startTime: "18:00",
    endTime: "19:15",
    location: "Wellness Studio",
    declined: 3,
    unconfirmed: 5,
    attending: 15,
    category: "Yoga",
    imageUrl:
      "https://plus.unsplash.com/premium_photo-1674675646725-5b4aca5adb21?q=80&w=871&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // yoga pose
  },
  {
    id: "5",
    title: "HIIT Blast",
    trainer: {
      name: "James Lee",
      avatarUrl:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop",
    },
    date: "2025-08-16",
    startTime: "07:00",
    endTime: "07:45",
    location: "Main Gym Hall",
    declined: 3,
    unconfirmed: 5,
    attending: 19,
    category: "HIIT",
    imageUrl:
      "https://images.unsplash.com/photo-1518459031867-a89b944bffe4?w=800&h=600&fit=crop", // cardio/hiit
  },
  {
    id: "6",
    title: "Swimming Fundamentals",
    trainer: {
      name: "Laura Chen",
      avatarUrl:
        "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=200&h=200&fit=crop",
    },
    date: "2025-08-17",
    startTime: "15:00",
    endTime: "16:00",
    location: "Community Pool",
    declined: 3,
    unconfirmed: 5,
    attending: 8,
    category: "Swimming",
    imageUrl:
      "https://plus.unsplash.com/premium_photo-1664475361436-e37f6f2ba407?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // swimming pool
  },
  {
    id: "7",
    title: "Advanced Boxing",
    trainer: {
      name: "Marco Bianchi",
      avatarUrl:
        "https://images.unsplash.com/photo-1591117207239-788bf8de6c3b?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Ym94aW5nfGVufDB8fDB8fHww",
    },
    date: "2025-08-18",
    startTime: "11:30",
    endTime: "12:30",
    location: "Downtown Gym",
    declined: 3,
    unconfirmed: 5,
    attending: 13,
    category: "Boxing",
    imageUrl:
      "https://images.unsplash.com/photo-1591117207239-788bf8de6c3b?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Ym94aW5nfGVufDB8fDB8fHww", // boxing ring
  },
  {
    id: "8",
    title: "Pilates Core",
    trainer: {
      name: "Anna Müller",
      avatarUrl:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop",
    },
    date: "2025-08-19",
    startTime: "17:00",
    endTime: "18:00",
    location: "Wellness Studio",
    declined: 3,
    unconfirmed: 5,
    attending: 12,
    category: "Pilates",
    imageUrl:
      "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=800&h=600&fit=crop", // pilates mat
  },
  {
    id: "9",
    title: "CrossFit Challenge",
    trainer: {
      name: "Tom Harris",
      avatarUrl:
        "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=200&h=200&fit=crop",
    },
    date: "2025-08-20",
    startTime: "06:30",
    endTime: "07:30",
    location: "CrossFit Arena",
    declined: 3,
    unconfirmed: 5,
    attending: 15,
    category: "CrossFit",
    imageUrl:
      "https://images.unsplash.com/photo-1558611848-73f7eb4001a1?w=800&h=600&fit=crop", // crossfit workout
  },
  {
    id: "10",
    title: "Running Club",
    trainer: {
      name: "Sophia Klein",
      avatarUrl:
        "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=200&h=200&fit=crop",
    },
    date: "2025-08-21",
    startTime: "08:00",
    endTime: "09:00",
    location: "City Park Entrance",
    declined: 3,
    unconfirmed: 5,
    attending: 23,
    category: "Running",
    imageUrl:
      "https://images.unsplash.com/photo-1607968565044-c84e74a5d5f0?w=800&h=600&fit=crop", // runners
  },
];

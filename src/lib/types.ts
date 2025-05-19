
export type User = {
  id: string;
  email: string;
  name: string;
  preferences: UserPreferences;
  createdAt: string;
};

export type UserPreferences = {
  timeCapsuleMode: boolean;
  notificationsEnabled: boolean;
  backgroundAmbience: 'silence' | 'rain' | 'piano';
  highContrastMode: boolean;
};

export type Mood = 
  | 'happy' 
  | 'calm' 
  | 'reflective' 
  | 'anxious' 
  | 'excited' 
  | 'sad' 
  | 'grateful' 
  | 'inspired';

export type AudioEntry = {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  unlockAt: string;
  mood: Mood;
  audioURL: string;
  isUnlocked: boolean;
  reflection?: string;
  backgroundAmbience?: 'silence' | 'rain' | 'piano';
};

export type TimelineGroup = {
  year: number;
  month: number;
  entries: AudioEntry[];
};

// Adding missing types needed by components
export type Project = {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed';
};

export type UserProfile = {
  name: string;
  email: string;
  description: string;
  links?: { title: string; url: string }[];
  projects?: Project[];
};

export type NeuralNodeData = {
  id: string;
  title: string;
  type: 'note' | 'link' | 'file' | 'image' | 'project';
  connections: string[];
  x?: number | string;
  y?: number | string;
  size?: number;
  color?: string;
  content?: string;
};

export type ImportSource = {
  id: string;
  name: string;
  type: 'csv' | 'api' | 'url' | 'file' | 'text';
  icon: string;
  description: string;
};

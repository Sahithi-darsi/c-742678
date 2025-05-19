
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

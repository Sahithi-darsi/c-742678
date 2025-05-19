
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Mood } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Mood to emoji mapping
export const moodToEmoji: Record<Mood, string> = {
  happy: '😊',
  calm: '😌',
  reflective: '🤔',
  anxious: '😰',
  excited: '😃',
  sad: '😔',
  grateful: '🙏',
  inspired: '✨'
};

// Returns text description for a mood
export const getMoodDescription = (mood: Mood): string => {
  const descriptions: Record<Mood, string> = {
    happy: 'Feeling joyful and content',
    calm: 'Feeling peaceful and serene',
    reflective: 'In a thoughtful state of mind',
    anxious: 'Feeling worried or uneasy',
    excited: 'Filled with enthusiasm and eagerness',
    sad: 'Feeling down or unhappy',
    grateful: 'Feeling thankful and appreciative',
    inspired: 'Feeling creative and motivated'
  };
  
  return descriptions[mood] || '';
};

// Format duration in seconds to MM:SS
export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, '0');
  
  return `${minutes}:${remainingSeconds}`;
};

// Create audio blob URL from base64 string
export const base64ToBlob = (base64: string, mimeType: string): Blob => {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
};

// Generate a waveform data visualization array from an audio file
// This is a simplified version - in production, you'd use WebAudio API to analyze the actual audio
export const generateMockWaveformData = (length: number = 50): number[] => {
  const result = [];
  
  for (let i = 0; i < length; i++) {
    // Generate a semi-random height between 2 and 20
    const height = Math.max(2, Math.floor(Math.random() * 20));
    result.push(height);
  }
  
  return result;
};

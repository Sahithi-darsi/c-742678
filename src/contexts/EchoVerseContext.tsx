
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AudioEntry, TimelineGroup, Mood } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

type EchoVerseContextType = {
  entries: AudioEntry[];
  timelineGroups: TimelineGroup[];
  loading: boolean;
  createEntry: (entry: Omit<AudioEntry, 'id' | 'userId' | 'createdAt' | 'isUnlocked'>) => Promise<void>;
  getEntry: (id: string) => AudioEntry | undefined;
  saveReflection: (id: string, reflection: string) => Promise<void>;
  checkForUnlockedEntries: () => Promise<AudioEntry[]>;
};

const EchoVerseContext = createContext<EchoVerseContextType | undefined>(undefined);

// Storage key for saving entries to localStorage
const STORAGE_KEY = 'echoverse_user_entries';

// Demo entries for the demo user
const demoEntries: AudioEntry[] = [
  {
    id: 'demo-entry-1',
    userId: '123', // This is the ID of our demo user
    title: 'First reflection',
    createdAt: '2025-05-15T12:00:00Z',
    unlockAt: '2025-05-16T12:00:00Z', 
    mood: 'reflective',
    audioURL: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=', // Empty audio file
    isUnlocked: true,
    reflection: 'This was my first recording and it brings back memories.'
  },
  {
    id: 'demo-entry-2',
    userId: '123',
    title: 'Feeling grateful',
    createdAt: '2025-05-17T14:30:00Z',
    unlockAt: '2025-05-18T14:30:00Z',
    mood: 'grateful',
    audioURL: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=',
    isUnlocked: true
  }
];

const groupEntriesByYearAndMonth = (entries: AudioEntry[]): TimelineGroup[] => {
  const groups: Record<string, TimelineGroup> = {};
  
  entries.forEach(entry => {
    const date = new Date(entry.createdAt);
    const year = date.getFullYear();
    const month = date.getMonth();
    const key = `${year}-${month}`;
    
    if (!groups[key]) {
      groups[key] = {
        year,
        month,
        entries: []
      };
    }
    
    groups[key].entries.push(entry);
  });
  
  // Sort by date (newest first)
  return Object.values(groups).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });
};

export function EchoVerseProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<AudioEntry[]>([]);
  const [timelineGroups, setTimelineGroups] = useState<TimelineGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, [user]);

  const loadEntries = async () => {
    setLoading(true);
    try {
      if (!user) {
        // No entries for unauthenticated users
        setEntries([]);
        setTimelineGroups([]);
        setLoading(false);
        return;
      }

      // For the demo user (id: 123), load the demo entries
      if (user.id === '123') {
        setEntries(demoEntries);
        setTimelineGroups(groupEntriesByYearAndMonth(demoEntries));
        setLoading(false);
        return;
      }
      
      // For other users, load entries from localStorage
      const storageKey = `${STORAGE_KEY}_${user.id}`;
      const storedEntries = localStorage.getItem(storageKey);
      
      let userEntries: AudioEntry[] = [];
      if (storedEntries) {
        userEntries = JSON.parse(storedEntries);
      }
      
      setEntries(userEntries);
      setTimelineGroups(groupEntriesByYearAndMonth(userEntries));
      
      // Check for newly unlocked entries
      const unlockedEntries = await checkForUnlockedEntries();
      if (unlockedEntries.length > 0) {
        toast({
          title: "New messages unlocked!",
          description: `You have ${unlockedEntries.length} new message${unlockedEntries.length > 1 ? 's' : ''} from your past self.`,
        });
      }
    } catch (error) {
      console.error("Error loading entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveEntriesToStorage = (updatedEntries: AudioEntry[]) => {
    try {
      if (!user) return; // Don't save if user is not authenticated
      
      const storageKey = `${STORAGE_KEY}_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(updatedEntries));
    } catch (error) {
      console.error("Error saving entries to storage:", error);
    }
  };

  const createEntry = async (entryData: Omit<AudioEntry, 'id' | 'userId' | 'createdAt' | 'isUnlocked'>) => {
    try {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to create entries.",
          variant: "destructive"
        });
        throw new Error("User not authenticated");
      }
      
      // Create a new entry
      const newEntry: AudioEntry = {
        id: Date.now().toString(),
        userId: user.id,
        createdAt: new Date().toISOString(),
        isUnlocked: false,
        ...entryData
      };
      
      const updatedEntries = [newEntry, ...entries];
      setEntries(updatedEntries);
      setTimelineGroups(groupEntriesByYearAndMonth(updatedEntries));
      
      // Save to localStorage with user-specific key
      saveEntriesToStorage(updatedEntries);
      
      toast({
        title: "Entry created!",
        description: `Your message will be waiting for you on ${new Date(entryData.unlockAt).toLocaleDateString()}.`,
      });
    } catch (error) {
      console.error("Error creating entry:", error);
      throw error;
    }
  };

  const getEntry = (id: string) => {
    return entries.find(entry => entry.id === id);
  };

  const saveReflection = async (id: string, reflection: string) => {
    try {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to save reflections.",
          variant: "destructive"
        });
        throw new Error("User not authenticated");
      }
      
      const updatedEntries = entries.map(entry => 
        entry.id === id ? { ...entry, reflection } : entry
      );
      
      setEntries(updatedEntries);
      setTimelineGroups(groupEntriesByYearAndMonth(updatedEntries));
      
      // Save to localStorage with user-specific key
      saveEntriesToStorage(updatedEntries);
      
      toast({
        title: "Reflection saved",
        description: "Your thoughts have been added to this memory.",
      });
    } catch (error) {
      console.error("Error saving reflection:", error);
      throw error;
    }
  };

  const checkForUnlockedEntries = async (): Promise<AudioEntry[]> => {
    try {
      if (!user) return [];
      
      const now = new Date();
      const unlockedEntries: AudioEntry[] = [];
      
      const updatedEntries = entries.map(entry => {
        if (!entry.isUnlocked && new Date(entry.unlockAt) <= now) {
          unlockedEntries.push({ ...entry, isUnlocked: true });
          return { ...entry, isUnlocked: true };
        }
        return entry;
      });
      
      if (unlockedEntries.length > 0) {
        setEntries(updatedEntries);
        setTimelineGroups(groupEntriesByYearAndMonth(updatedEntries));
        
        // Save to localStorage with user-specific key
        saveEntriesToStorage(updatedEntries);
      }
      
      return unlockedEntries;
    } catch (error) {
      console.error("Error checking for unlocked entries:", error);
      return [];
    }
  };

  return (
    <EchoVerseContext.Provider
      value={{
        entries,
        timelineGroups,
        loading,
        createEntry,
        getEntry,
        saveReflection,
        checkForUnlockedEntries
      }}
    >
      {children}
    </EchoVerseContext.Provider>
  );
}

export function useEchoVerse() {
  const context = useContext(EchoVerseContext);
  
  if (context === undefined) {
    throw new Error('useEchoVerse must be used within an EchoVerseProvider');
  }
  
  return context;
}


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
      // Load entries from localStorage
      const storedEntries = localStorage.getItem(STORAGE_KEY);
      
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
    } catch (error) {
      console.error("Error saving entries to storage:", error);
    }
  };

  const createEntry = async (entryData: Omit<AudioEntry, 'id' | 'userId' | 'createdAt' | 'isUnlocked'>) => {
    try {
      // Create a new entry
      const newEntry: AudioEntry = {
        id: Date.now().toString(),
        userId: user?.id || 'anonymous',
        createdAt: new Date().toISOString(),
        isUnlocked: false,
        ...entryData
      };
      
      const updatedEntries = [newEntry, ...entries];
      setEntries(updatedEntries);
      setTimelineGroups(groupEntriesByYearAndMonth(updatedEntries));
      
      // Save to localStorage
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
      const updatedEntries = entries.map(entry => 
        entry.id === id ? { ...entry, reflection } : entry
      );
      
      setEntries(updatedEntries);
      setTimelineGroups(groupEntriesByYearAndMonth(updatedEntries));
      
      // Save to localStorage
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
        
        // Save to localStorage
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

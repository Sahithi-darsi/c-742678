
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

// Mock data for development
const mockEntries: AudioEntry[] = [
  {
    id: '1',
    userId: '123',
    title: 'Thoughts on my new job',
    createdAt: new Date(2024, 4, 15).toISOString(),
    unlockAt: new Date(2024, 5, 15).toISOString(),
    mood: 'excited',
    audioURL: '/assets/audio/demo1.mp3',
    isUnlocked: true
  },
  {
    id: '2',
    userId: '123',
    title: 'Birthday reflections',
    createdAt: new Date(2024, 3, 10).toISOString(),
    unlockAt: new Date(2025, 3, 10).toISOString(),
    mood: 'reflective',
    audioURL: '/assets/audio/demo2.mp3',
    isUnlocked: false
  },
  {
    id: '3',
    userId: '123',
    title: 'Travel plans',
    createdAt: new Date(2024, 2, 5).toISOString(),
    unlockAt: new Date(2024, 4, 5).toISOString(),
    mood: 'grateful',
    audioURL: '/assets/audio/demo3.mp3',
    isUnlocked: true,
    reflection: 'It\'s amazing how my plans evolved over time!'
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
    if (user) {
      loadEntries();
    } else {
      setEntries([]);
      setTimelineGroups([]);
    }
  }, [user]);

  const loadEntries = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // For demo, we'll use the mock entries
      setEntries(mockEntries);
      setTimelineGroups(groupEntriesByYearAndMonth(mockEntries));
      
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

  const createEntry = async (entryData: Omit<AudioEntry, 'id' | 'userId' | 'createdAt' | 'isUnlocked'>) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo, we'll create a new entry
      const newEntry: AudioEntry = {
        id: Date.now().toString(),
        userId: user?.id || '',
        createdAt: new Date().toISOString(),
        isUnlocked: false,
        ...entryData
      };
      
      setEntries(prev => [newEntry, ...prev]);
      setTimelineGroups(groupEntriesByYearAndMonth([newEntry, ...entries]));
      
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setEntries(prev => 
        prev.map(entry => 
          entry.id === id ? { ...entry, reflection } : entry
        )
      );
      
      setTimelineGroups(groupEntriesByYearAndMonth(
        entries.map(entry => entry.id === id ? { ...entry, reflection } : entry)
      ));
      
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
      // In a real app, this would make an API call to check for newly unlocked entries
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

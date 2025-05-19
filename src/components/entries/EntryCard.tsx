
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Lock, Unlock, Calendar, Clock, Headphones } from 'lucide-react';
import { AudioEntry, Mood } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Mood to emoji mapping
const moodToEmoji: Record<Mood, string> = {
  happy: '😊',
  calm: '😌',
  reflective: '🤔',
  anxious: '😰',
  excited: '😃',
  sad: '😔',
  grateful: '🙏',
  inspired: '✨'
};

interface EntryCardProps {
  entry: AudioEntry;
  onPlay?: (entry: AudioEntry) => void;
}

export const EntryCard = ({ entry, onPlay }: EntryCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const createdAt = new Date(entry.createdAt);
  const unlockAt = new Date(entry.unlockAt);
  const isUnlocked = entry.isUnlocked;
  const isPast = unlockAt < new Date();
  
  // Handle play button click
  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onPlay && isUnlocked) {
      onPlay(entry);
    }
  };

  return (
    <Link
      to={isUnlocked ? `/entry/${entry.id}` : "#"}
      className={cn(
        "block relative rounded-xl border transition-all duration-300",
        "transform hover:-translate-y-1 hover:shadow-md",
        isUnlocked ? "border-primary/20 hover:border-primary/50" : "border-muted",
        isUnlocked ? "unlocked-entry" : "locked-entry"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-medium text-lg">
            {entry.title}
          </h3>
          <span className="text-xl" aria-label={`Mood: ${entry.mood}`}>
            {moodToEmoji[entry.mood]}
          </span>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar size={14} className="mr-1.5" />
            <span>Created: {format(createdAt, 'MMM d, yyyy')}</span>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock size={14} className="mr-1.5" />
            <span>
              {isUnlocked 
                ? `Unlocked: ${format(unlockAt, 'MMM d, yyyy')}`
                : `Unlocks: ${format(unlockAt, 'MMM d, yyyy')}`
              }
            </span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          {isUnlocked ? (
            <Badge variant="outline" className="flex items-center gap-1 bg-primary/10">
              <Unlock size={12} />
              <span>Unlocked</span>
            </Badge>
          ) : (
            <Badge variant="outline" className="flex items-center gap-1">
              <Lock size={12} />
              <span>Locked</span>
            </Badge>
          )}
          
          {isUnlocked && (
            <Button
              size="sm"
              variant="ghost"
              className="flex items-center gap-1"
              onClick={handlePlay}
            >
              <Headphones size={16} />
              <span>Listen</span>
            </Button>
          )}
        </div>
      </div>
      
      {!isUnlocked && isPast && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl">
          <div className="text-center p-4">
            <Unlock size={24} className="mx-auto mb-2 text-primary" />
            <p className="font-medium text-primary">Ready to unlock!</p>
            <p className="text-sm text-muted-foreground mt-1">Tap to reveal this message</p>
          </div>
        </div>
      )}
      
      {!isUnlocked && !isPast && isHovered && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
          <div className="text-white text-center p-4">
            <Lock size={24} className="mx-auto mb-2" />
            <p>This message is still locked</p>
            <p className="text-sm mt-1 text-white/80">Unlocks on {format(unlockAt, 'MMM d, yyyy')}</p>
          </div>
        </div>
      )}
    </Link>
  );
};

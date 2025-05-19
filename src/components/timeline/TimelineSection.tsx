
import { useState } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { AudioEntry, TimelineGroup } from '@/lib/types';
import { EntryCard } from '@/components/entries/EntryCard';
import { Button } from '@/components/ui/button';

interface TimelineSectionProps {
  group: TimelineGroup;
  onPlayEntry?: (entry: AudioEntry) => void;
}

export const TimelineSection = ({ group, onPlayEntry }: TimelineSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { year, month, entries } = group;
  
  const monthName = format(new Date(year, month), 'MMMM');
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="mb-6">
      <div className="mb-3">
        <Button
          variant="ghost"
          onClick={toggleExpand}
          className="flex items-center gap-2 p-0 h-auto hover:bg-transparent"
        >
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          )}
          <h2 className="text-xl font-serif font-medium">
            {monthName} {year}
          </h2>
        </Button>
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {entries.map(entry => (
                <EntryCard 
                  key={entry.id} 
                  entry={entry} 
                  onPlay={onPlayEntry}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEchoVerse } from '@/contexts/EchoVerseContext';
import { AudioEntry } from '@/lib/types';
import { TimelineSection } from '@/components/timeline/TimelineSection';
import { EntryDialog } from '@/components/entries/EntryDialog';
import { Button } from '@/components/ui/button';
import { Mic, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Timeline = () => {
  const { timelineGroups, loading } = useEchoVerse();
  const [selectedEntry, setSelectedEntry] = useState<AudioEntry | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const handlePlayEntry = (entry: AudioEntry) => {
    setSelectedEntry(entry);
    setDialogOpen(true);
  };
  
  const closeDialog = () => {
    setDialogOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pb-20">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-serif font-bold">Your Timeline</h1>
        
        <Link to="/record">
          <Button className="gap-2">
            <Mic size={18} />
            <span>Record New</span>
          </Button>
        </Link>
      </div>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={40} className="animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading your timeline...</p>
        </div>
      ) : timelineGroups.length > 0 ? (
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {timelineGroups.map((group, index) => (
              <TimelineSection 
                key={`${group.year}-${group.month}`} 
                group={group} 
                onPlayEntry={handlePlayEntry}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      ) : (
        <div className="bg-muted/30 rounded-xl p-8 text-center my-10">
          <div className="mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Mic size={28} className="text-primary" />
          </div>
          <h2 className="text-xl font-medium mb-2">No messages yet</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Start by recording your first message to your future self.
            Set a date when you want to hear it again.
          </p>
          <Link to="/record">
            <Button>
              Record Your First Message
            </Button>
          </Link>
        </div>
      )}
      
      {/* Entry Dialog */}
      <EntryDialog 
        entry={selectedEntry} 
        isOpen={dialogOpen} 
        onClose={closeDialog} 
      />
    </div>
  );
};

export default Timeline;

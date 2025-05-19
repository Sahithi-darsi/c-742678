
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock } from 'lucide-react';
import { AudioPlayer } from '@/components/audio/AudioPlayer';
import { AudioEntry } from '@/lib/types';
import { format } from 'date-fns';
import { useEchoVerse } from '@/contexts/EchoVerseContext';
import { moodToEmoji } from '@/lib/utils';

interface EntryDialogProps {
  entry: AudioEntry | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EntryDialog = ({ entry, isOpen, onClose }: EntryDialogProps) => {
  const { saveReflection } = useEchoVerse();
  const [reflection, setReflection] = useState(entry?.reflection || '');
  const [isSaving, setIsSaving] = useState(false);
  
  if (!entry) return null;
  
  const createdAtDate = new Date(entry.createdAt);
  const unlockedAtDate = new Date(entry.unlockAt);
  
  const handleSaveReflection = async () => {
    if (!entry) return;
    
    setIsSaving(true);
    try {
      await saveReflection(entry.id, reflection);
    } catch (error) {
      console.error('Error saving reflection:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-serif">
            <span>{moodToEmoji[entry.mood]}</span>
            <span>{entry.title}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col space-y-4 py-4">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Calendar size={14} className="mr-1.5" />
              <span>Created: {format(createdAtDate, 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center">
              <Clock size={14} className="mr-1.5" />
              <span>Unlocked: {format(unlockedAtDate, 'MMM d, yyyy')}</span>
            </div>
          </div>
          
          <div className="py-2">
            <AudioPlayer src={entry.audioURL} />
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Your Reflection</h4>
            <p className="text-sm text-muted-foreground">
              How do you feel hearing this message from your past self?
            </p>
            <Textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Write your thoughts here..."
              className="min-h-[120px]"
            />
            <div className="flex justify-end">
              <Button onClick={handleSaveReflection} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Reflection'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

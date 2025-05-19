
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useEchoVerse } from '@/contexts/EchoVerseContext';
import { Calendar, Clock, ArrowLeft, Save } from 'lucide-react';
import { AudioPlayer } from '@/components/audio/AudioPlayer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { moodToEmoji } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export const EntryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getEntry, saveReflection } = useEchoVerse();
  const { toast } = useToast();
  
  const [entry, setEntry] = useState(id ? getEntry(id) : null);
  const [reflection, setReflection] = useState(entry?.reflection || '');
  const [isSaving, setIsSaving] = useState(false);
  
  // If entry doesn't exist, redirect to timeline
  useEffect(() => {
    if (id && !entry) {
      toast({
        title: "Entry not found",
        description: "The message you're looking for doesn't exist or is still locked.",
        variant: "destructive",
      });
      navigate('/');
    }
  }, [id, entry, navigate, toast]);
  
  if (!entry) {
    return null;
  }
  
  const handleBack = () => {
    navigate('/');
  };
  
  const handleSaveReflection = async () => {
    if (!id) return;
    
    setIsSaving(true);
    try {
      await saveReflection(id, reflection);
      toast({
        title: "Reflection saved",
        description: "Your thoughts have been added to this memory.",
      });
    } catch (error) {
      console.error('Error saving reflection:', error);
      toast({
        title: "Error saving reflection",
        description: "There was a problem saving your reflection. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const createdAtDate = new Date(entry.createdAt);
  const unlockedAtDate = new Date(entry.unlockAt);

  return (
    <div className="max-w-5xl mx-auto px-4 pb-20">
      <Button 
        variant="outline"
        className="mb-6 flex items-center gap-1"
        onClick={handleBack}
      >
        <ArrowLeft size={16} />
        <span>Back to Timeline</span>
      </Button>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="mb-6">
              <h1 className="text-3xl font-serif font-bold flex items-center gap-2">
                <span className="text-4xl">{moodToEmoji[entry.mood]}</span>
                <span>{entry.title}</span>
              </h1>
              
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground mt-2">
                <div className="flex items-center">
                  <Calendar size={16} className="mr-1.5" />
                  <span>Created: {format(createdAtDate, 'MMMM d, yyyy')}</span>
                </div>
                <div className="flex items-center">
                  <Clock size={16} className="mr-1.5" />
                  <span>Unlocked: {format(unlockedAtDate, 'MMMM d, yyyy')}</span>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <AudioPlayer src={entry.audioURL} />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xl font-medium">Your Reflection</h3>
              <p className="text-muted-foreground">
                How do you feel hearing this message from your past self?
              </p>
              
              <Textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="Write your thoughts here..."
                className="min-h-[200px]"
              />
              
              <Button 
                onClick={handleSaveReflection} 
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                <Save size={16} />
                {isSaving ? "Saving..." : "Save Reflection"}
              </Button>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-muted/30 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-3">About this memory</h3>
              <ul className="space-y-4">
                <li>
                  <div className="text-sm font-medium">Time capsule</div>
                  <div className="text-muted-foreground">
                    This memory was locked for {
                      Math.floor((unlockedAtDate.getTime() - createdAtDate.getTime()) / (1000 * 60 * 60 * 24))
                    } days
                  </div>
                </li>
                <li>
                  <div className="text-sm font-medium">Your mood</div>
                  <div className="text-muted-foreground flex items-center gap-1">
                    <span>{moodToEmoji[entry.mood]}</span>
                    <span className="capitalize">{entry.mood}</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EntryDetail;

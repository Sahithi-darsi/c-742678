
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, addDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Mood } from '@/lib/types';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useEchoVerse } from '@/contexts/EchoVerseContext';
import { useToast } from '@/hooks/use-toast';
import { moodToEmoji } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, Mic, MicOff, Play, Pause, StopCircle, Clock } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { AudioVisualizer } from '@/components/audio/AudioVisualizer';
import { AudioPlayer } from '@/components/audio/AudioPlayer';
import { formatDuration } from '@/lib/utils';

const recordFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  mood: z.enum(['happy', 'calm', 'reflective', 'anxious', 'excited', 'sad', 'grateful', 'inspired']),
  unlockAt: z.date({
    required_error: "Please select a date",
  }).min(new Date(), {
    message: "Date must be in the future",
  }),
});

type RecordFormValues = z.infer<typeof recordFormSchema>;

export const RecordForm = () => {
  const navigate = useNavigate();
  const { createEntry } = useEchoVerse();
  const { toast } = useToast();
  
  const [step, setStep] = useState<'record' | 'details' | 'preview'>('record');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    isRecording,
    isPaused,
    duration,
    audioBlob,
    audioUrl,
    visualizerData,
    startRecording,
    pauseRecording,
    stopRecording,
    discardRecording,
  } = useAudioRecorder({ maxDuration: 60 });
  
  const form = useForm<RecordFormValues>({
    resolver: zodResolver(recordFormSchema),
    defaultValues: {
      title: '',
      mood: 'reflective',
      unlockAt: addDays(new Date(), 30), // Default to 30 days in the future
    }
  });
  
  const handleStartRecording = () => {
    startRecording();
  };
  
  const handlePauseRecording = () => {
    pauseRecording();
  };
  
  const handleStopRecording = () => {
    stopRecording();
    if (audioUrl) {
      setStep('details');
    }
  };
  
  const handleCancel = () => {
    if (step === 'record') {
      discardRecording();
    } else {
      setStep('record');
      discardRecording();
    }
  };
  
  const handleDetailsSubmit = (values: RecordFormValues) => {
    setStep('preview');
  };
  
  const handleSave = async () => {
    if (!audioBlob || !audioUrl) {
      toast({
        title: "Recording error",
        description: "Please record an audio message before saving.",
        variant: "destructive",
      });
      return;
    }
    
    const values = form.getValues();
    
    setIsSubmitting(true);
    try {
      await createEntry({
        title: values.title,
        mood: values.mood,
        unlockAt: values.unlockAt.toISOString(),
        audioURL: audioUrl,
      });
      
      toast({
        title: "Message created!",
        description: `Your message will be waiting for you on ${format(values.unlockAt, 'MMM d, yyyy')}.`,
      });
      
      navigate('/');
    } catch (error) {
      console.error('Error saving entry:', error);
      toast({
        title: "Error saving message",
        description: "There was a problem saving your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleBack = () => {
    if (step === 'details') {
      setStep('record');
    } else if (step === 'preview') {
      setStep('details');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step 1: Recording */}
      {step === 'record' && (
        <div className="text-center mb-10">
          <h2 className="text-xl font-medium mb-4">Record Your Message</h2>
          <p className="text-muted-foreground mb-8">
            Record a short message (up to 60 seconds) for your future self.
          </p>
          
          <div className="mb-10 bg-muted/30 rounded-lg p-6 flex flex-col items-center">
            <div className="mb-6">
              <AudioVisualizer 
                data={visualizerData} 
                isActive={isRecording && !isPaused}
                className="h-24"
              />
            </div>
            
            <div className="mb-4">
              <div className="text-2xl font-mono font-medium">
                {formatDuration(duration)}
              </div>
            </div>
            
            <div className="flex gap-4">
              {!isRecording ? (
                <Button
                  size="lg"
                  className="rounded-full h-16 w-16 flex items-center justify-center"
                  onClick={handleStartRecording}
                >
                  <Mic size={24} />
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full h-16 w-16 flex items-center justify-center"
                    onClick={handlePauseRecording}
                  >
                    {isPaused ? <Play size={24} /> : <Pause size={24} />}
                  </Button>
                  
                  <Button
                    variant="destructive"
                    size="icon"
                    className="rounded-full h-16 w-16 flex items-center justify-center"
                    onClick={handleStopRecording}
                  >
                    <StopCircle size={24} />
                  </Button>
                </>
              )}
            </div>
          </div>
          
          {audioUrl && (
            <div className="mb-8">
              <AudioPlayer src={audioUrl} />
            </div>
          )}
          
          <div className="flex gap-4 justify-center">
            {audioUrl && (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  Record Again
                </Button>
                <Button onClick={() => setStep('details')}>
                  Continue
                </Button>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Step 2: Entry Details */}
      {step === 'details' && (
        <form onSubmit={form.handleSubmit(handleDetailsSubmit)} className="space-y-6">
          <h2 className="text-xl font-medium mb-4">Message Details</h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title"
                placeholder="Give your message a title"
                {...form.register("title")}
              />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mood">Current Mood</Label>
              <Select 
                onValueChange={(value) => form.setValue('mood', value as Mood)}
                defaultValue={form.getValues('mood')}
              >
                <SelectTrigger id="mood">
                  <SelectValue placeholder="Select your current mood" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(moodToEmoji).map(([mood, emoji]) => (
                    <SelectItem key={mood} value={mood}>
                      <div className="flex items-center gap-2">
                        <span>{emoji}</span>
                        <span className="capitalize">{mood}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unlockAt">When to Unlock</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="unlockAt"
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.getValues('unlockAt') ? (
                      format(form.getValues('unlockAt'), 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.getValues('unlockAt')}
                    onSelect={(date) => date && form.setValue('unlockAt', date)}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <p className="text-sm text-muted-foreground flex items-center mt-1">
                <Clock size={14} className="mr-1.5" />
                This message will be waiting for you on {format(form.getValues('unlockAt'), 'MMMM d, yyyy')}
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button variant="outline" type="button" onClick={handleBack}>
              Back
            </Button>
            <Button type="submit">
              Preview
            </Button>
          </div>
        </form>
      )}
      
      {/* Step 3: Preview & Submit */}
      {step === 'preview' && (
        <div className="space-y-6">
          <h2 className="text-xl font-medium mb-2">Review Your Message</h2>
          <p className="text-muted-foreground mb-6">
            Listen to your recording one more time before saving.
          </p>
          
          <div className="bg-white dark:bg-slate-900 border border-border rounded-lg p-6 mb-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <span>{moodToEmoji[form.getValues('mood')]}</span>
                <span>{form.getValues('title')}</span>
              </h3>
              <p className="text-sm text-muted-foreground mt-1 flex items-center">
                <CalendarIcon size={14} className="mr-1.5" />
                Unlocks on {format(form.getValues('unlockAt'), 'MMMM d, yyyy')}
              </p>
            </div>
            
            {audioUrl && (
              <AudioPlayer src={audioUrl} />
            )}
          </div>
          
          <div className="flex gap-4">
            <Button variant="outline" type="button" onClick={handleBack} disabled={isSubmitting}>
              Back
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting && <span className="animate-spin">⏳</span>}
              {isSubmitting ? 'Saving...' : 'Save Message'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};


import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { AudioVisualizer } from './AudioVisualizer';

interface AudioPlayerProps {
  src: string;
  waveformData?: number[];
  className?: string;
}

export const AudioPlayer = ({ src, waveformData, className }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [visualizerData, setVisualizerData] = useState<number[]>(
    waveformData || Array(20).fill(2)
  );

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const setAudioData = () => {
      setDuration(audio.duration);
      setCurrentTime(audio.currentTime);
    };
    
    const updateTimeElapsed = () => {
      setCurrentTime(audio.currentTime);
      
      // Simulate visualizer data based on playback position
      if (isPlaying) {
        const newData = [...visualizerData];
        for (let i = 0; i < newData.length; i++) {
          // Create a pseudo-random bar height based on time and position
          const noise = Math.sin(audio.currentTime * 3 + i) * 6;
          newData[i] = Math.max(2, Math.abs(10 + noise));
        }
        setVisualizerData(newData);
      }
    };
    
    // Event listeners
    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', updateTimeElapsed);
    audio.addEventListener('ended', () => setIsPlaying(false));
    
    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', updateTimeElapsed);
      audio.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, [isPlaying, visualizerData]);

  useEffect(() => {
    // Clean up interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Handle play/pause
  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } else {
      audio.play();
      setIsPlaying(true);
      
      // Update visualizer more frequently than timeupdate event
      intervalRef.current = window.setInterval(() => {
        const newData = [...visualizerData];
        for (let i = 0; i < newData.length; i++) {
          // Create a pseudo-random bar height
          const noise = Math.sin(Date.now() / 500 + i) * 6;
          newData[i] = Math.max(2, Math.abs(10 + noise));
        }
        setVisualizerData(newData);
      }, 100);
    }
  };

  // Handle seeking
  const seek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const seekTo = value[0];
    audio.currentTime = seekTo;
    setCurrentTime(seekTo);
  };

  // Handle volume change
  const changeVolume = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newVolume = value[0];
    audio.volume = newVolume;
    setVolume(newVolume);
    
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  // Handle mute toggle
  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isMuted) {
      audio.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  // Format time in MM:SS
  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    
    return `${minutes}:${seconds}`;
  };

  return (
    <div className={cn("p-4 rounded-lg bg-white dark:bg-slate-900 border border-border", className)}>
      <audio ref={audioRef} src={src} preload="metadata" />
      
      <div className="mb-4">
        <AudioVisualizer data={visualizerData} isActive={isPlaying} />
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="outline"
            className="h-10 w-10 rounded-full"
            onClick={togglePlayPause}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </Button>
          
          <div className="flex-1 flex items-center gap-2">
            <span className="text-sm tabular-nums">{formatTime(currentTime)}</span>
            
            <div className="flex-1">
              <Slider
                value={[currentTime]}
                min={0}
                max={duration || 100}
                step={0.01}
                onValueChange={seek}
              />
            </div>
            
            <span className="text-sm tabular-nums">{formatTime(duration)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={toggleMute}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </Button>
            
            <div className="w-20">
              <Slider
                value={[isMuted ? 0 : volume]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={changeVolume}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

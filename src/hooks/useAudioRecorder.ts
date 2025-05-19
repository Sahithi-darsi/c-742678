
import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface AudioRecorderOptions {
  maxDuration: number; // in seconds
}

interface AudioRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  visualizerData: number[];
}

export function useAudioRecorder({ maxDuration = 60 }: AudioRecorderOptions = { maxDuration: 60 }) {
  const { toast } = useToast();
  const [state, setState] = useState<AudioRecorderState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioBlob: null,
    audioUrl: null,
    visualizerData: Array(20).fill(2), // Default value for visualizer
  });
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopRecording();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (state.audioUrl) {
        URL.revokeObjectURL(state.audioUrl);
      }
    };
  }, []);

  const updateVisualizer = () => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    // Process the frequency data for visualization
    const visualizerData: number[] = [];
    const numBars = 20;
    const step = Math.floor(dataArray.length / numBars);
    
    for (let i = 0; i < numBars; i++) {
      let sum = 0;
      for (let j = 0; j < step; j++) {
        sum += dataArray[i * step + j] || 0;
      }
      // Scale the value (0-64) for visualization purposes
      visualizerData.push(Math.max(2, Math.floor(sum / step / 4)));
    }
    
    setState(prevState => ({
      ...prevState,
      visualizerData
    }));
    
    if (state.isRecording && !state.isPaused) {
      animationFrameRef.current = requestAnimationFrame(updateVisualizer);
    }
  };

  const startRecording = async () => {
    try {
      // Reset state
      setState({
        isRecording: false,
        isPaused: false,
        duration: 0,
        audioBlob: null,
        audioUrl: null, // Fix here - changed from URL.revokeObjectURL()
        visualizerData: Array(20).fill(2),
      });
      
      // Revoke existing URL if it exists
      if (state.audioUrl) {
        URL.revokeObjectURL(state.audioUrl);
      }
      
      audioChunksRef.current = [];
      
      // Request permissions and setup
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Set up audio analyser for visualizations
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      
      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setState(prevState => ({
          ...prevState,
          isRecording: false,
          isPaused: false,
          audioBlob,
          audioUrl
        }));
        
        // Stop all tracks on the stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };
      
      // Start recording
      mediaRecorder.start(100);
      
      // Start timer
      const startTime = Date.now();
      timerRef.current = window.setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        
        if (elapsed >= maxDuration) {
          stopRecording();
          toast({
            title: "Recording complete",
            description: `You've reached the maximum recording duration of ${maxDuration} seconds.`
          });
        } else {
          setState(prevState => ({
            ...prevState,
            duration: elapsed
          }));
        }
      }, 100);
      
      setState(prevState => ({
        ...prevState,
        isRecording: true
      }));
      
      // Start visualizer
      updateVisualizer();
      
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Permission denied",
        description: "Please allow microphone access to record audio messages.",
        variant: "destructive"
      });
    }
  };

  const pauseRecording = () => {
    if (!mediaRecorderRef.current || !state.isRecording) return;
    
    if (state.isPaused) {
      // Resume recording
      mediaRecorderRef.current.resume();
      
      // Resume visualizer
      updateVisualizer();
      
      setState(prevState => ({
        ...prevState,
        isPaused: false
      }));
    } else {
      // Pause recording
      mediaRecorderRef.current.pause();
      
      // Pause visualizer
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      setState(prevState => ({
        ...prevState,
        isPaused: true
      }));
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current || !state.isRecording) return;
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    try {
      mediaRecorderRef.current.stop();
    } catch (error) {
      console.error("Error stopping recording:", error);
    }
    
    // Stop all tracks on the stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const discardRecording = () => {
    stopRecording();
    
    if (state.audioUrl) {
      URL.revokeObjectURL(state.audioUrl);
    }
    
    setState({
      isRecording: false,
      isPaused: false,
      duration: 0,
      audioBlob: null,
      audioUrl: null,
      visualizerData: Array(20).fill(2),
    });
  };

  return {
    ...state,
    startRecording,
    pauseRecording,
    stopRecording,
    discardRecording,
  };
}

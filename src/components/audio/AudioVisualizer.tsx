
import React from 'react';
import { cn } from '@/lib/utils';

interface AudioVisualizerProps {
  data: number[];
  isActive?: boolean;
  className?: string;
}

export const AudioVisualizer = ({ 
  data, 
  isActive = true, 
  className 
}: AudioVisualizerProps) => {
  return (
    <div className={cn("audio-visualizer", className)}>
      {data.map((value, index) => (
        <div
          key={index}
          className={cn(
            "audio-bar transition-all duration-150",
            isActive ? "bg-primary" : "bg-gray-300 dark:bg-gray-700"
          )}
          style={{ 
            height: `${Math.max(2, value * 2)}px`,
            animationDelay: `${index * 0.05}s`,
          }}
        />
      ))}
    </div>
  );
};

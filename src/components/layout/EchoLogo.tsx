
import React from 'react';

interface EchoLogoProps {
  size?: number;
  className?: string;
}

export const EchoLogo = ({ size = 32, className }: EchoLogoProps) => {
  return (
    <div 
      className={`relative overflow-hidden flex items-center justify-center rounded-lg bg-gradient-to-r from-primary to-accent ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Sound wave visualization */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="wave-animation absolute bottom-0 w-full h-3/4 bg-white/20"></div>
      </div>
      
      {/* Echo circles */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="absolute w-1/2 h-1/2 rounded-full border-2 border-white/40 animate-ping"></div>
        <div className="absolute w-1/3 h-1/3 rounded-full border border-white/60"></div>
      </div>
    </div>
  );
};

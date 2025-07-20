import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { X, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HUDModeProps {
  isActive: boolean;
  onClose: () => void;
  destination?: string;
}

export function HUDMode({ isActive, onClose, destination = "Your Destination" }: HUDModeProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black text-green-400 font-mono overflow-hidden">
      {/* Close Button - positioned normally as it will be flipped */}
      <Button
        onClick={onClose}
        variant="ghost"
        size="sm"
        className="absolute top-4 right-4 text-green-400 hover:bg-green-400/20 z-10"
      >
        <X className="w-6 h-6" />
      </Button>

      {/* HUD Content - All content is mirrored horizontally for windshield reflection */}
      <div className="w-full h-full flex flex-col justify-center items-center p-8 transform scale-x-[-1]">
        
        {/* Time Display */}
        <div className="text-center mb-12">
          <div className="text-6xl font-bold mb-2 tracking-wider">
            {currentTime.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            })}
          </div>
          <div className="text-xl opacity-80">
            {currentTime.toLocaleDateString([], { 
              weekday: 'long',
              month: 'short',
              day: 'numeric'
            })}
          </div>
        </div>

        {/* Navigation Arrow */}
        <div className="mb-8 animate-pulse">
          <Navigation className="w-16 h-16 text-green-400" />
        </div>

        {/* Destination */}
        <div className="text-center mb-12">
          <div className="text-sm opacity-60 mb-2">DESTINATION</div>
          <div className="text-3xl font-bold">{destination}</div>
        </div>

        {/* Speed Display (Mock) */}
        <div className="text-center mb-8">
          <div className="text-sm opacity-60 mb-1">SPEED</div>
          <div className="text-4xl font-bold">0 <span className="text-lg">KM/H</span></div>
        </div>

        {/* Mini Avatar - Small corner indicator */}
        <div className="absolute bottom-8 left-8">
          <div className="w-8 h-6 bg-green-400/30 rounded-full relative">
            <div className="absolute -left-1 top-1 w-3 h-3 bg-green-400/30 rounded-full"></div>
            <div className="absolute -right-1 top-1 w-3 h-3 bg-green-400/30 rounded-full"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex space-x-0.5">
                <div className="w-0.5 h-0.5 bg-green-400 rounded-full"></div>
                <div className="w-0.5 h-0.5 bg-green-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="absolute top-8 left-8 text-sm opacity-60">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>MINI CONNECTED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
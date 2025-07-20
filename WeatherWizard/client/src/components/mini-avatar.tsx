import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface MiniAvatarProps {
  accessories?: string[];
  expression?: string;
  style?: string;
  className?: string;
}

export function MiniAvatar({ 
  accessories = [], 
  expression = 'happy', 
  style = 'fluffy',
  className 
}: MiniAvatarProps) {
  const [currentExpression, setCurrentExpression] = useState(expression);

  // Animated expressions
  useEffect(() => {
    const expressions = ['happy', 'sleepy', 'excited'];
    const interval = setInterval(() => {
      setCurrentExpression(prev => {
        const currentIndex = expressions.indexOf(prev);
        return expressions[(currentIndex + 1) % expressions.length];
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getEyeStyle = () => {
    switch (currentExpression) {
      case 'sleepy':
        return 'w-3 h-1 bg-gray-800 rounded-full';
      case 'excited':
        return 'w-2 h-3 bg-gray-800 rounded-full animate-bounce';
      default:
        return 'w-2 h-2 bg-gray-800 rounded-full';
    }
  };

  const getCloudStyle = () => {
    switch (style) {
      case 'sleek':
        return 'rounded-2xl';
      case 'bouncy':
        return 'rounded-full animate-bounce';
      default:
        return 'rounded-full';
    }
  };

  return (
    <div className={cn("relative", className)}>
      <div 
        className={cn(
          "w-12 h-9 sm:w-16 sm:h-12 bg-white/90 shadow-lg animate-float relative touch-none",
          getCloudStyle()
        )}
      >
        {/* Cloud extensions - responsive sizing */}
        <div className="absolute -left-1.5 top-1.5 w-4 h-4 sm:-left-2 sm:top-2 sm:w-6 sm:h-6 bg-white/90 rounded-full"></div>
        <div className="absolute -right-1.5 top-1.5 w-4 h-4 sm:-right-2 sm:top-2 sm:w-6 sm:h-6 bg-white/90 rounded-full"></div>
        
        {/* Mini's face */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex space-x-0.5 sm:space-x-1">
            <div 
              className={cn(getEyeStyle(), "animate-bounce-gentle")}
              style={{ animationDelay: '0.5s' }}
            ></div>
            <div 
              className={cn(getEyeStyle(), "animate-bounce-gentle")}
              style={{ animationDelay: '0.7s' }}
            ></div>
          </div>
        </div>
        
        {/* Accessories - mobile responsive */}
        <div className="absolute inset-0">
          {accessories.includes('glasses') && (
            <div className="absolute top-0.5 left-1/2 transform -translate-x-1/2 sm:top-1">
              {/* Proper glasses with two lenses and bridge */}
              <div className="flex items-center space-x-0.5">
                {/* Left lens */}
                <div className="w-2 h-1.5 sm:w-2.5 sm:h-2 border border-gray-800 rounded-full bg-blue-100/30"></div>
                {/* Bridge */}
                <div className="w-0.5 h-0.5 bg-gray-800 rounded-full"></div>
                {/* Right lens */}
                <div className="w-2 h-1.5 sm:w-2.5 sm:h-2 border border-gray-800 rounded-full bg-blue-100/30"></div>
              </div>
              {/* Temples (arms of glasses) */}
              <div className="absolute top-1/2 -left-0.5 w-1 h-0.5 bg-gray-800 rounded transform -translate-y-1/2"></div>
              <div className="absolute top-1/2 -right-0.5 w-1 h-0.5 bg-gray-800 rounded transform -translate-y-1/2"></div>
            </div>
          )}
          {accessories.includes('hat') && (
            <div className="absolute -top-1.5 left-1/2 transform -translate-x-1/2 w-4 h-3 sm:-top-2 sm:w-6 sm:h-4 bg-gray-800 rounded-t-full"></div>
          )}
        </div>
      </div>
    </div>
  );
}

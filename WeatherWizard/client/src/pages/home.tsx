import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { preferencesAPI } from '@/lib/api';
import { MiniAvatar } from '@/components/mini-avatar';
import { ChatInterface } from '@/components/chat-interface';
import { ThemeSelector } from '@/components/theme-selector';
import { MiniCustomizer } from '@/components/mini-customizer';
import { HUDMode } from '@/components/hud-mode';
import { useTimeTheme, themeStyles } from '@/hooks/use-time-theme';
import { Button } from '@/components/ui/button';
import { Car } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Home() {
  const { currentTheme } = useTimeTheme();
  const [isHUDMode, setIsHUDMode] = useState(false);
  
  const { data: preferences } = useQuery({
    queryKey: ['/api/preferences']
  });

  const theme = themeStyles[currentTheme];
  const miniCustomization = preferences?.miniCustomization || {
    accessories: [],
    expression: 'happy',
    style: 'fluffy'
  };

  return (
    <div className="min-h-screen transition-all duration-1000 overflow-x-hidden">
      {/* Dynamic Background */}
      <div className={cn(
        "fixed inset-0 transition-all duration-1000",
        theme.background
      )}>
        {/* Stars for night mode */}
        {currentTheme === 'night' && (
          <div className="absolute inset-0 opacity-100 transition-opacity duration-1000">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="star absolute w-0.5 h-0.5 sm:w-1 sm:h-1 bg-white rounded-full animate-pulse"
                style={{
                  top: `${Math.random() * 80 + 10}%`,
                  left: `${Math.random() * 90 + 5}%`,
                  animationDelay: `${Math.random() * 3}s`
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Main Container - Mobile optimized */}
      <div className="relative z-10 min-h-screen flex flex-col touch-manipulation">
        {/* Header with Mini Avatar - Mobile responsive */}
        <header className="flex items-center justify-between p-3 sm:p-4 lg:p-6 safe-area-inset-top">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <MiniAvatar
              accessories={miniCustomization.accessories}
              expression={miniCustomization.expression}
              style={miniCustomization.style}
            />
            <div>
              <h1 className={cn("text-lg sm:text-xl font-semibold", theme.textPrimary)}>
                {preferences?.name ? `Hi, ${preferences.name}!` : 'Mini'}
              </h1>
              <p className={cn("text-xs sm:text-sm", theme.textSecondary)}>
                Hey! What do you want to do today?
              </p>
            </div>
          </div>

          {/* Theme Controls - Mobile touch friendly */}
          <div className="flex space-x-1 sm:space-x-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsHUDMode(true)}
              className={cn("touch-manipulation min-h-[36px] min-w-[36px]", theme.textSecondary)}
              title="HUD Mode (Car Dashboard)"
            >
              <Car className="w-4 h-4" />
            </Button>
            <ThemeSelector />
            <MiniCustomizer />
          </div>
        </header>

        {/* Chat Container - Mobile optimized */}
        <main className="flex-1 max-w-4xl mx-auto w-full px-3 sm:px-4 pb-3 sm:pb-4 safe-area-inset-bottom">
          <ChatInterface />
        </main>
      </div>

      {/* HUD Mode Overlay */}
      <HUDMode 
        isActive={isHUDMode}
        onClose={() => setIsHUDMode(false)}
        destination={preferences?.favoriteLocation || "Your Destination"}
      />
    </div>
  );
}

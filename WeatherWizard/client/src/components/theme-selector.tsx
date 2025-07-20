import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Palette } from 'lucide-react';
import { useTimeTheme, themeStyles, type TimeTheme } from '@/hooks/use-time-theme';
import { cn } from '@/lib/utils';

interface ThemeSelectorProps {
  onThemeChange?: (theme: TimeTheme) => void;
}

export function ThemeSelector({ onThemeChange }: ThemeSelectorProps) {
  const { currentTheme, setManualTheme, manualTheme } = useTimeTheme();

  const handleThemeSelect = (theme: TimeTheme) => {
    setManualTheme(theme);
    onThemeChange?.(theme);
  };

  const resetToAuto = () => {
    setManualTheme(null);
  };

  const themeOptions = [
    { key: 'morning', label: 'Morning', gradient: 'from-yellow-200 via-blue-200 to-pink-200' },
    { key: 'afternoon', label: 'Afternoon', gradient: 'from-yellow-300 to-blue-400' },
    { key: 'evening', label: 'Evening', gradient: 'from-orange-400 via-pink-400 to-blue-400' },
    { key: 'night', label: 'Night', gradient: 'from-blue-900 to-purple-900' }
  ] as const;

  const seasonalThemes = [
    { key: 'spring', label: 'Spring', emoji: '🌸' },
    { key: 'summer', label: 'Summer', emoji: '☀️' },
    { key: 'autumn', label: 'Autumn', emoji: '🍂' },
    { key: 'winter', label: 'Winter', emoji: '❄️' }
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          size="sm"
          variant="ghost"
          className="p-2 bg-white/20 backdrop-blur-sm rounded-full shadow-lg hover:bg-white/30 transition-all"
        >
          <Palette className="w-4 h-4 text-gray-700" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Theme</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Auto Theme Option */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Current: {currentTheme}</span>
            <Button 
              size="sm" 
              variant={manualTheme ? "outline" : "default"}
              onClick={resetToAuto}
            >
              Auto
            </Button>
          </div>
          
          {/* Theme Options */}
          <div className="grid grid-cols-2 gap-3">
            {themeOptions.map((theme) => (
              <Button
                key={theme.key}
                onClick={() => handleThemeSelect(theme.key)}
                variant="ghost"
                className={cn(
                  "p-3 rounded-xl border-2 transition-all h-auto flex-col",
                  manualTheme === theme.key 
                    ? "border-blue-500" 
                    : "border-transparent hover:border-blue-300"
                )}
              >
                <div 
                  className={cn(
                    "w-full h-16 rounded-lg mb-2 bg-gradient-to-br",
                    theme.gradient
                  )}
                >
                  {theme.key === 'night' && (
                    <div className="relative w-full h-full">
                      <div className="absolute top-1 right-1 w-1 h-1 bg-white rounded-full"></div>
                      <div className="absolute bottom-2 left-2 w-1 h-1 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-800">{theme.label}</p>
              </Button>
            ))}
          </div>
          
          {/* Seasonal Themes */}
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-800 mb-2">Seasonal Themes</h4>
            <div className="flex flex-wrap gap-2">
              {seasonalThemes.map((theme) => (
                <Button
                  key={theme.key}
                  size="sm"
                  variant="outline"
                  className="text-sm"
                  onClick={() => {
                    // TODO: Implement seasonal theme logic
                    console.log('Seasonal theme:', theme.key);
                  }}
                >
                  {theme.emoji} {theme.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

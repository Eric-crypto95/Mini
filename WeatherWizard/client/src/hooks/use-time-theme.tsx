import { useState, useEffect } from 'react';

export type TimeTheme = 'morning' | 'afternoon' | 'evening' | 'night';

interface UseTimeThemeReturn {
  currentTheme: TimeTheme;
  setManualTheme: (theme: TimeTheme | null) => void;
  manualTheme: TimeTheme | null;
}

export function useTimeTheme(): UseTimeThemeReturn {
  const [manualTheme, setManualTheme] = useState<TimeTheme | null>(null);
  const [currentTheme, setCurrentTheme] = useState<TimeTheme>('morning');

  const getTimeBasedTheme = (): TimeTheme => {
    const hour = new Date().getHours();
    
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 21) return 'evening';
    return 'night';
  };

  useEffect(() => {
    const updateTheme = () => {
      const theme = manualTheme || getTimeBasedTheme();
      setCurrentTheme(theme);
    };

    updateTheme();
    
    // Update every minute
    const interval = setInterval(updateTheme, 60000);
    
    return () => clearInterval(interval);
  }, [manualTheme]);

  return {
    currentTheme,
    setManualTheme,
    manualTheme
  };
}

export const themeStyles = {
  morning: {
    background: 'bg-gradient-to-br from-yellow-200 via-blue-200 to-pink-200',
    textPrimary: 'text-gray-800',
    textSecondary: 'text-gray-600'
  },
  afternoon: {
    background: 'bg-gradient-to-br from-yellow-300 to-blue-400',
    textPrimary: 'text-gray-800',
    textSecondary: 'text-gray-700'
  },
  evening: {
    background: 'bg-gradient-to-br from-orange-400 via-pink-400 to-blue-400',
    textPrimary: 'text-white',
    textSecondary: 'text-gray-100'
  },
  night: {
    background: 'bg-gradient-to-br from-blue-900 to-purple-900',
    textPrimary: 'text-white',
    textSecondary: 'text-gray-200'
  }
};

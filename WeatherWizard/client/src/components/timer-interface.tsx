import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timerAPI } from '@/lib/api';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Play, Pause, Square, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimerInterfaceProps {
  onTimerComplete?: () => void;
}

export function TimerInterface({ onTimerComplete }: TimerInterfaceProps) {
  const [localTime, setLocalTime] = useState<Record<number, number>>({});
  const queryClient = useQueryClient();

  const { data: timers = [] } = useQuery({
    queryKey: ['/api/timers'],
    refetchInterval: 1000
  });

  const createTimerMutation = useMutation({
    mutationFn: timerAPI.createTimer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/timers'] });
    }
  });

  const updateTimerMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: any }) => 
      timerAPI.updateTimer(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/timers'] });
    }
  });

  const deleteTimerMutation = useMutation({
    mutationFn: timerAPI.deleteTimer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/timers'] });
    }
  });

  // Update local timers every second
  useEffect(() => {
    const interval = setInterval(() => {
      timers.forEach(timer => {
        if (timer.isActive && timer.remaining > 0) {
          setLocalTime(prev => ({
            ...prev,
            [timer.id]: Math.max(0, (prev[timer.id] ?? timer.remaining) - 1)
          }));

          // Check if timer completed
          if ((localTime[timer.id] ?? timer.remaining) <= 1) {
            updateTimerMutation.mutate({
              id: timer.id,
              updates: { isActive: false, remaining: 0 }
            });
            onTimerComplete?.();
          }
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timers, localTime, updateTimerMutation, onTimerComplete]);

  const createTimer = (type: string, duration: number) => {
    createTimerMutation.mutate({
      type,
      duration,
      remaining: duration,
      isActive: true
    });
  };

  const toggleTimer = (timer: any) => {
    updateTimerMutation.mutate({
      id: timer.id,
      updates: { isActive: !timer.isActive }
    });
  };

  const stopTimer = (timerId: number) => {
    deleteTimerMutation.mutate(timerId);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimerColor = (type: string) => {
    switch (type) {
      case 'pomodoro':
        return 'from-red-400 to-red-600';
      case 'focus':
        return 'from-green-400 to-green-600';
      case 'break':
        return 'from-blue-400 to-blue-600';
      default:
        return 'from-purple-400 to-purple-600';
    }
  };

  const getProgressPercentage = (timer: any) => {
    const remaining = localTime[timer.id] ?? timer.remaining;
    return ((timer.duration - remaining) / timer.duration) * 100;
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Quick Timer Buttons - Mobile optimized */}
      <Card className="p-3 sm:p-4">
        <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Quick Timers</h3>
        <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-2">
          <Button 
            onClick={() => createTimer('pomodoro', 1500)} // 25 minutes
            variant="outline" 
            size="sm"
            className="touch-manipulation min-h-[44px] text-xs sm:text-sm"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Pomodoro (25m)
          </Button>
          <Button 
            onClick={() => createTimer('break', 300)} // 5 minutes
            variant="outline" 
            size="sm"
            className="touch-manipulation min-h-[44px] text-xs sm:text-sm"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Break (5m)
          </Button>
          <Button 
            onClick={() => createTimer('focus', 3600)} // 1 hour
            variant="outline" 
            size="sm"
            className="touch-manipulation min-h-[44px] text-xs sm:text-sm"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Focus (1h)
          </Button>
        </div>
      </Card>

      {/* Active Timers */}
      {timers.map((timer) => {
        const remaining = localTime[timer.id] ?? timer.remaining;
        const progress = getProgressPercentage(timer);
        
        return (
          <Card 
            key={timer.id}
            className={cn(
              "p-3 sm:p-4 text-white relative overflow-hidden touch-manipulation",
              `bg-gradient-to-br ${getTimerColor(timer.type)}`
            )}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h4 className="font-semibold capitalize text-sm sm:text-base">{timer.type} Timer</h4>
                <div className="flex space-x-1 sm:space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20 min-w-[32px] min-h-[32px] p-1 sm:p-2"
                    onClick={() => toggleTimer(timer)}
                  >
                    {timer.isActive ? 
                      <Pause className="w-3 h-3 sm:w-4 sm:h-4" /> : 
                      <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                    }
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20 min-w-[32px] min-h-[32px] p-1 sm:p-2"
                    onClick={() => stopTimer(timer.id)}
                  >
                    <Square className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-center mb-3 sm:mb-4">
                <div className="relative w-16 h-16 sm:w-24 sm:h-24">
                  <svg className="w-16 h-16 sm:w-24 sm:h-24 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="white"
                      strokeOpacity="0.3"
                      strokeWidth="6"
                      fill="none"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="white"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray="283"
                      strokeDashoffset={283 - (283 * progress) / 100}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm sm:text-xl font-bold">{formatTime(remaining)}</span>
                  </div>
                </div>
              </div>

              <p className="text-center text-white/80 text-xs sm:text-sm">
                {timer.isActive ? `${timer.type} Active` : 'Paused'}
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

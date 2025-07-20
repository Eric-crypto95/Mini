import { useQuery } from '@tanstack/react-query';
import { weatherAPI, type WeatherData } from '@/lib/api';
import { Card } from './ui/card';
import { Loader2 } from 'lucide-react';

interface WeatherCardProps {
  location: string;
}

export function WeatherCard({ location }: WeatherCardProps) {
  const { data: weather, isLoading, error } = useQuery({
    queryKey: ['/api/weather', location],
    queryFn: () => weatherAPI.getWeather(location),
    retry: 1
  });

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Card>
    );
  }

  if (error || !weather) {
    return (
      <Card className="p-4">
        <p className="text-red-500">Failed to load weather data for {location}</p>
      </Card>
    );
  }

  const getWeatherGradient = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear':
        return 'from-yellow-400 to-orange-500';
      case 'rain':
        return 'from-blue-500 to-blue-700';
      case 'snow':
        return 'from-blue-200 to-blue-400';
      case 'clouds':
        return 'from-gray-400 to-gray-600';
      default:
        return 'from-blue-400 to-blue-600';
    }
  };

  const getWeatherAnimation = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear':
        return (
          <div className="absolute top-4 right-4 w-12 h-12 bg-yellow-300 rounded-full animate-sun-rays shadow-lg"></div>
        );
      case 'rain':
        return (
          <div className="absolute inset-0">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i}
                className="absolute w-0.5 h-4 bg-blue-300 rounded-full animate-rain"
                style={{
                  left: `${20 + i * 15}%`,
                  animationDelay: `${i * 0.3}s`,
                  top: '10%'
                }}
              ></div>
            ))}
          </div>
        );
      case 'clouds':
        return (
          <div className="absolute inset-0">
            <div className="absolute top-6 right-2 w-8 h-6 bg-white/30 rounded-full animate-cloud-drift"></div>
            <div className="absolute top-8 right-8 w-6 h-4 bg-white/20 rounded-full animate-cloud-drift" style={{ animationDelay: '2s' }}></div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className={`p-3 sm:p-4 bg-gradient-to-br ${getWeatherGradient(weather.condition)} text-white relative overflow-hidden touch-manipulation`}>
      {getWeatherAnimation(weather.condition)}
      
      <div className="relative z-10">
        <h3 className="font-semibold text-base sm:text-lg mb-2">{weather.location}, {weather.country}</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl sm:text-3xl font-bold">{weather.temperature}°C</p>
            <p className="text-blue-100 capitalize text-sm sm:text-base">{weather.description}</p>
          </div>
          <div className="text-right text-xs sm:text-sm">
            <p>Humidity: {weather.humidity}%</p>
            <p>Wind: {weather.windSpeed} km/h</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

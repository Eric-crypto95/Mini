import { apiRequest } from './queryClient';

export interface WeatherData {
  location: string;
  country: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  condition: string;
}

export interface TranslationRequest {
  text: string;
  targetLanguages: string[];
}

export interface Translation {
  language: string;
  code: string;
  flag: string;
  text: string;
  pronunciation: string;
}

export interface TranslationResponse {
  translations: Translation[];
}

export interface ChatRequest {
  message: string;
  context?: {
    type: string;
    [key: string]: any;
  };
}

export interface ChatResponse {
  response: string;
}

export const weatherAPI = {
  getWeather: async (location: string): Promise<WeatherData> => {
    const response = await apiRequest('GET', `/api/weather/${encodeURIComponent(location)}`);
    return response.json();
  }
};

export const translationAPI = {
  translate: async (request: TranslationRequest): Promise<TranslationResponse> => {
    const response = await apiRequest('POST', '/api/translate', request);
    return response.json();
  },
  
  speak: async (text: string, language: string): Promise<void> => {
    await apiRequest('POST', '/api/speak', { text, language });
  }
};

export const chatAPI = {
  sendMessage: async (request: ChatRequest): Promise<ChatResponse> => {
    const response = await apiRequest('POST', '/api/chat', request);
    return response.json();
  }
};

export const preferencesAPI = {
  getPreferences: async () => {
    const response = await apiRequest('GET', '/api/preferences');
    return response.json();
  },
  
  updatePreferences: async (preferences: any) => {
    const response = await apiRequest('POST', '/api/preferences', preferences);
    return response.json();
  }
};

export const timerAPI = {
  getTimers: async () => {
    const response = await apiRequest('GET', '/api/timers');
    return response.json();
  },
  
  createTimer: async (timer: any) => {
    const response = await apiRequest('POST', '/api/timers', timer);
    return response.json();
  },
  
  updateTimer: async (id: number, updates: any) => {
    const response = await apiRequest('PATCH', `/api/timers/${id}`, updates);
    return response.json();
  },
  
  deleteTimer: async (id: number) => {
    const response = await apiRequest('DELETE', `/api/timers/${id}`);
    return response.json();
  }
};

export const chatHistoryAPI = {
  getHistory: async (limit?: number) => {
    const response = await apiRequest('GET', `/api/chat-history${limit ? `?limit=${limit}` : ''}`);
    return response.json();
  }
};

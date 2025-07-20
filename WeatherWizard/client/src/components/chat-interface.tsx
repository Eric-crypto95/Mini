import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatAPI, weatherAPI } from '@/lib/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Send, Loader2 } from 'lucide-react';
import { MiniAvatar } from './mini-avatar';
import { WeatherCard } from './weather-card';
import { TimerInterface } from './timer-interface';
import { TranslationPanel } from './translation-panel';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  message: string;
  response?: string;
  isUser: boolean;
  type?: 'chat' | 'weather' | 'timer' | 'translation';
  metadata?: any;
}

export function ChatInterface() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      message: "Hi there! I'm Mini, your personal assistant. Ask me about weather, set timers, translate text, or just chat! Try \"What's the weather in Nairobi?\" or \"make Mini wear glasses\"",
      isUser: false,
      type: 'chat'
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const chatMutation = useMutation({
    mutationFn: chatAPI.sendMessage,
    onSuccess: (data, variables) => {
      const responseMessage: ChatMessage = {
        id: Date.now().toString() + '-response',
        message: data.response,
        isUser: false,
        type: variables.context?.type || 'chat'
      };
      
      setMessages(prev => [...prev, responseMessage]);
    },
    onError: (error) => {
      toast({
        title: "Chat Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive"
      });
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: input.trim(),
      isUser: true
    };

    setMessages(prev => [...prev, userMessage]);

    // Detect message type and handle accordingly
    const message = input.trim().toLowerCase();
    let context: any = { type: 'chat' };

    if (message.includes('weather')) {
      context = { type: 'weather' };
      handleWeatherQuery(input.trim(), userMessage.id);
    } else if (message.includes('timer') || message.includes('pomodoro')) {
      context = { type: 'timer' };
      handleTimerCommand(input.trim(), userMessage.id);
    } else if (message.includes('translate')) {
      context = { type: 'translation' };
      handleTranslationQuery(input.trim(), userMessage.id);
    } else if (message.includes('glasses') || message.includes('customize') || message.includes('mini')) {
      context = { type: 'customization' };
      handleCustomizationCommand(input.trim(), userMessage.id);
    }

    chatMutation.mutate({
      message: input.trim(),
      context
    });

    setInput('');
  };

  const handleWeatherQuery = (message: string, messageId: string) => {
    // Extract location from message
    const weatherMatch = message.match(/weather.*?(?:in|for)\s+([a-zA-Z\s]+)/i);
    const location = weatherMatch?.[1]?.trim() || 'London';
    
    // Add weather card to messages
    const weatherMessage: ChatMessage = {
      id: messageId + '-weather',
      message: `Here's the current weather in ${location}:`,
      isUser: false,
      type: 'weather',
      metadata: { location }
    };
    
    setMessages(prev => [...prev, weatherMessage]);
  };

  const handleTimerCommand = (message: string, messageId: string) => {
    // Extract timer duration
    const timerMatch = message.match(/(\d+)\s*(?:minute|min|hour|hr)/i);
    const duration = timerMatch?.[1] ? parseInt(timerMatch[1]) : 25;
    const unit = message.includes('hour') || message.includes('hr') ? 'hour' : 'minute';
    
    const timerMessage: ChatMessage = {
      id: messageId + '-timer',
      message: `Starting your ${duration} ${unit} timer!`,
      isUser: false,
      type: 'timer',
      metadata: { duration, unit }
    };
    
    setMessages(prev => [...prev, timerMessage]);
  };

  const handleTranslationQuery = (message: string, messageId: string) => {
    // Extract text to translate
    const translateMatch = message.match(/translate\s+['"]?([^'"]+)['"]?/i);
    const textToTranslate = translateMatch?.[1] || 'hello';
    
    const translationMessage: ChatMessage = {
      id: messageId + '-translation',
      message: `Here's the translation for "${textToTranslate}":`,
      isUser: false,
      type: 'translation',
      metadata: { text: textToTranslate }
    };
    
    setMessages(prev => [...prev, translationMessage]);
  };

  const handleCustomizationCommand = (message: string, messageId: string) => {
    if (message.includes('glasses')) {
      queryClient.invalidateQueries({ queryKey: ['/api/preferences'] });
      toast({
        title: "Mini Updated!",
        description: "Mini is now wearing glasses! 👓"
      });
    }
  };

  const handleQuickAction = (action: string) => {
    const prompts = {
      weather: "What's the weather like today?",
      timer: "Set a 25 minute focus timer",
      translate: "Translate 'hello' to French and Spanish",
      customize: "make Mini wear glasses"
    };
    
    setInput(prompts[action as keyof typeof prompts] || '');
  };

  const renderMessage = (message: ChatMessage) => {
    if (message.isUser) {
      return (
        <div className="flex items-start space-x-2 sm:space-x-3 flex-row-reverse space-x-reverse">
          <div className="bg-blue-500 text-white rounded-2xl rounded-tr-sm p-3 sm:p-4 shadow-lg max-w-[85%] sm:max-w-md">
            <p className="text-sm sm:text-base">{message.message}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-start space-x-2 sm:space-x-3">
        <MiniAvatar className="flex-shrink-0 mt-1 transform scale-40 sm:scale-50" />
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl rounded-tl-sm p-3 sm:p-4 shadow-lg max-w-[85%] sm:max-w-md">
          <p className="text-gray-800 mb-2 sm:mb-3 text-sm sm:text-base">{message.message}</p>
          
          {/* Render special content based on message type */}
          {message.type === 'weather' && message.metadata?.location && (
            <WeatherCard location={message.metadata.location} />
          )}
          
          {message.type === 'timer' && (
            <div className="mt-2 sm:mt-3">
              <TimerInterface onTimerComplete={() => {
                toast({
                  title: "Timer Complete!",
                  description: "Time's up! Want to take a 5-minute break?"
                });
              }} />
            </div>
          )}
          
          {message.type === 'translation' && message.metadata?.text && (
            <div className="mt-2 sm:mt-3">
              <TranslationPanel initialText={message.metadata.text} />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Chat History - Mobile optimized */}
      <div className="space-y-3 sm:space-y-4 max-h-[calc(100vh-200px)] sm:max-h-[60vh] overflow-y-auto scroll-smooth">
        {messages.map((message) => (
          <div key={message.id}>
            {renderMessage(message)}
          </div>
        ))}
        {chatMutation.isPending && (
          <div className="flex items-start space-x-2 sm:space-x-3">
            <MiniAvatar className="flex-shrink-0 mt-1 transform scale-40 sm:scale-50" />
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl rounded-tl-sm p-3 sm:p-4 shadow-lg">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                <p className="text-gray-600 text-sm sm:text-base">Mini is thinking...</p>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Mobile friendly */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border border-white/20 p-3 sm:p-4 sticky bottom-0 z-20">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="flex-1">
            <Input
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="border-none bg-transparent text-base sm:text-lg placeholder-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || chatMutation.isPending}
            className="p-2.5 sm:p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl touch-manipulation min-w-[44px] min-h-[44px]"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Quick Actions - Mobile responsive grid */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5 sm:gap-2 mt-2.5 sm:mt-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuickAction('weather')}
            className="bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-200 text-xs sm:text-sm px-2 py-1.5 touch-manipulation"
          >
            Weather
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuickAction('timer')}
            className="bg-green-100 hover:bg-green-200 text-green-800 border-green-200 text-xs sm:text-sm px-2 py-1.5 touch-manipulation"
          >
            Timer
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuickAction('translate')}
            className="bg-purple-100 hover:bg-purple-200 text-purple-800 border-purple-200 text-xs sm:text-sm px-2 py-1.5 touch-manipulation"
          >
            Translate
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuickAction('customize')}
            className="bg-pink-100 hover:bg-pink-200 text-pink-800 border-pink-200 text-xs sm:text-sm px-2 py-1.5 touch-manipulation"
          >
            Customize Mini
          </Button>
        </div>
      </Card>
    </div>
  );
}

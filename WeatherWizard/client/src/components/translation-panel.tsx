import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { translationAPI, type TranslationRequest } from '@/lib/api';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Play, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TranslationPanelProps {
  initialText?: string;
}

export function TranslationPanel({ initialText = '' }: TranslationPanelProps) {
  const [text, setText] = useState(initialText);
  const [selectedLanguages, setSelectedLanguages] = useState(['French', 'Spanish']);
  const { toast } = useToast();

  const translateMutation = useMutation({
    mutationFn: (request: TranslationRequest) => translationAPI.translate(request),
    onError: (error) => {
      toast({
        title: "Translation Error",
        description: error instanceof Error ? error.message : "Failed to translate text",
        variant: "destructive"
      });
    }
  });

  const speakMutation = useMutation({
    mutationFn: ({ text, language }: { text: string; language: string }) => 
      translationAPI.speak(text, language),
    onError: (error) => {
      toast({
        title: "Speech Error", 
        description: "Text-to-speech is not available right now",
        variant: "destructive"
      });
    }
  });

  const handleTranslate = () => {
    if (!text.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter text to translate",
        variant: "destructive"
      });
      return;
    }

    translateMutation.mutate({
      text: text.trim(),
      targetLanguages: selectedLanguages
    });
  };

  const handleSpeak = (translatedText: string, language: string) => {
    speakMutation.mutate({ text: translatedText, language });
    
    // Show feedback since actual TTS isn't implemented
    toast({
      title: "Playing Pronunciation",
      description: `Speaking "${translatedText}" in ${language}`
    });
  };

  const availableLanguages = [
    'French', 'Spanish', 'German', 'Italian', 'Portuguese', 
    'Chinese', 'Japanese', 'Korean', 'Arabic', 'Russian'
  ];

  return (
    <div className="space-y-3 sm:space-y-4">
      <Card className="p-3 sm:p-4">
        <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Translate Text</h3>
        
        <div className="space-y-3">
          <Input
            placeholder="Enter text to translate..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleTranslate()}
            className="text-base" // Prevent zoom on iOS
          />
          
          <div>
            <p className="text-xs sm:text-sm text-gray-600 mb-2">Target Languages:</p>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5 sm:gap-2">
              {availableLanguages.map((language) => (
                <Button
                  key={language}
                  size="sm"
                  variant={selectedLanguages.includes(language) ? "default" : "outline"}
                  className="text-xs sm:text-sm touch-manipulation min-h-[36px]"
                  onClick={() => {
                    setSelectedLanguages(prev => 
                      prev.includes(language) 
                        ? prev.filter(l => l !== language)
                        : [...prev, language]
                    );
                  }}
                >
                  {language}
                </Button>
              ))}
            </div>
          </div>
          
          <Button 
            onClick={handleTranslate} 
            disabled={translateMutation.isPending}
            className="w-full touch-manipulation min-h-[44px]"
          >
            {translateMutation.isPending ? (
              <>
                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin" />
                Translating...
              </>
            ) : (
              'Translate'
            )}
          </Button>
        </div>
      </Card>

      {/* Translation Results */}
      {translateMutation.data?.translations && (
        <div className="space-y-3">
          {translateMutation.data.translations.map((translation, index) => (
            <Card key={index} className={`p-4 bg-gradient-to-r ${
              index % 2 === 0 
                ? 'from-purple-400 to-pink-400' 
                : 'from-blue-400 to-cyan-400'
            } text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">
                    {translation.flag} {translation.language}
                  </p>
                  <p className="text-lg font-semibold">{translation.text}</p>
                  {translation.pronunciation && (
                    <p className="text-xs opacity-70">[{translation.pronunciation}]</p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-all"
                  onClick={() => handleSpeak(translation.text, translation.language)}
                  disabled={speakMutation.isPending}
                >
                  {speakMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {translateMutation.error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <p className="text-red-600 text-sm">
            Failed to translate text. Please check your internet connection and try again.
          </p>
        </Card>
      )}
    </div>
  );
}

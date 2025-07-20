import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { preferencesAPI } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Settings } from 'lucide-react';
import { MiniAvatar } from './mini-avatar';
import { useToast } from '@/hooks/use-toast';

interface MiniCustomizerProps {
  onCustomizationChange?: (customization: any) => void;
}

export function MiniCustomizer({ onCustomizationChange }: MiniCustomizerProps) {
  const [localCustomization, setLocalCustomization] = useState({
    accessories: [] as string[],
    expression: 'happy',
    style: 'fluffy'
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: preferences } = useQuery({
    queryKey: ['/api/preferences']
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: preferencesAPI.updatePreferences,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/preferences'] });
      toast({
        title: "Mini Updated!",
        description: "Your customization has been saved."
      });
      onCustomizationChange?.(data.miniCustomization);
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to save customization.",
        variant: "destructive"
      });
    }
  });

  const handleAccessoryToggle = (accessory: string) => {
    setLocalCustomization(prev => ({
      ...prev,
      accessories: prev.accessories.includes(accessory)
        ? prev.accessories.filter(a => a !== accessory)
        : [...prev.accessories, accessory]
    }));
  };

  const handleExpressionChange = (expression: string) => {
    setLocalCustomization(prev => ({
      ...prev,
      expression
    }));
  };

  const handleStyleChange = (style: string) => {
    setLocalCustomization(prev => ({
      ...prev,
      style
    }));
  };

  const saveCustomization = () => {
    updatePreferencesMutation.mutate({
      ...preferences,
      miniCustomization: localCustomization
    });
  };

  const resetToDefault = () => {
    const defaultCustomization = {
      accessories: [],
      expression: 'happy',
      style: 'fluffy'
    };
    setLocalCustomization(defaultCustomization);
    updatePreferencesMutation.mutate({
      ...preferences,
      miniCustomization: defaultCustomization
    });
  };

  const accessoryOptions = [
    { key: 'glasses', label: 'Glasses', emoji: '👓' },
    { key: 'hat', label: 'Hat', emoji: '🎩' }
  ];

  const expressionOptions = [
    { key: 'happy', label: 'Happy', emoji: '😊' },
    { key: 'sleepy', label: 'Sleepy', emoji: '😴' },
    { key: 'excited', label: 'Excited', emoji: '🤩' }
  ];

  const styleOptions = [
    { key: 'fluffy', label: 'Fluffy' },
    { key: 'sleek', label: 'Sleek' },
    { key: 'bouncy', label: 'Bouncy' }
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          size="sm"
          variant="ghost"
          className="p-2 bg-white/20 backdrop-blur-sm rounded-full shadow-lg hover:bg-white/30 transition-all"
        >
          <Settings className="w-4 h-4 text-gray-700" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Customize Mini</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Mini Preview */}
          <div className="flex justify-center">
            <MiniAvatar
              accessories={localCustomization.accessories}
              expression={localCustomization.expression}
              style={localCustomization.style}
              className="transform scale-125"
            />
          </div>
          
          {/* Accessories */}
          <div>
            <h4 className="text-sm font-medium text-gray-800 mb-2">Accessories</h4>
            <div className="flex flex-wrap gap-2">
              {accessoryOptions.map((accessory) => (
                <Button
                  key={accessory.key}
                  size="sm"
                  variant={localCustomization.accessories.includes(accessory.key) ? "default" : "outline"}
                  onClick={() => handleAccessoryToggle(accessory.key)}
                >
                  {accessory.emoji} {accessory.label}
                </Button>
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setLocalCustomization(prev => ({ ...prev, accessories: [] }))}
              >
                Remove All
              </Button>
            </div>
          </div>
          
          {/* Expressions */}
          <div>
            <h4 className="text-sm font-medium text-gray-800 mb-2">Expression</h4>
            <div className="grid grid-cols-3 gap-2">
              {expressionOptions.map((expression) => (
                <Button
                  key={expression.key}
                  size="sm"
                  variant={localCustomization.expression === expression.key ? "default" : "outline"}
                  onClick={() => handleExpressionChange(expression.key)}
                >
                  {expression.emoji} {expression.label}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Cloud Style */}
          <div>
            <h4 className="text-sm font-medium text-gray-800 mb-2">Cloud Style</h4>
            <div className="flex flex-wrap gap-2">
              {styleOptions.map((style) => (
                <Button
                  key={style.key}
                  size="sm"
                  variant={localCustomization.style === style.key ? "default" : "outline"}
                  onClick={() => handleStyleChange(style.key)}
                >
                  {style.label}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex space-x-2 pt-4 border-t border-gray-200">
            <Button 
              onClick={saveCustomization} 
              disabled={updatePreferencesMutation.isPending}
              className="flex-1"
            >
              Save Changes
            </Button>
            <Button 
              variant="outline" 
              onClick={resetToDefault}
              disabled={updatePreferencesMutation.isPending}
            >
              Reset
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

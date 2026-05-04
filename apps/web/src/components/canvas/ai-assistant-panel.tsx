'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, X, Sparkles } from 'lucide-react';
import { AISuggestion } from '@/lib/ai-suggestions';
import { cn } from '@/lib/utils';

interface AIAssistantPanelProps {
  suggestions: AISuggestion[];
  onClose: () => void;
  onApplySuggestion?: (suggestion: AISuggestion) => void;
}

export default function AIAssistantPanel({
  suggestions,
  onClose,
  onApplySuggestion,
}: AIAssistantPanelProps) {
  if (suggestions.length === 0) {
    return null;
  }

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'node':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400';
      case 'connection':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400';
      case 'improvement':
        return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400';
    }
  };

  return (
    <Card className="fixed bottom-6 right-6 w-96 shadow-xl border-2 border-primary/20 z-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-lg">AI Assistant</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Helpful suggestions to improve your canvas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            <div className="flex-shrink-0 mt-1">
              <Lightbulb className="h-4 w-4 text-amber-500" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-medium text-sm">{suggestion.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {suggestion.description}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className={cn('text-xs', getSuggestionColor(suggestion.type))}
                >
                  {suggestion.type}
                </Badge>
              </div>
              {onApplySuggestion && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => onApplySuggestion(suggestion)}
                >
                  Apply
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}


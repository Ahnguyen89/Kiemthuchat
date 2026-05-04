'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, Wand2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

interface AITemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTemplateGenerated: (template: { nodes: any[]; edges: any[] }) => void;
}

export default function AITemplateDialog({
  open,
  onOpenChange,
  onTemplateGenerated,
}: AITemplateDialogProps) {
  const { toast } = useToast();
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const handleGenerate = async (customDescription?: string) => {
    const desc = customDescription || description;
    if (!desc.trim()) {
      toast({
        title: 'Description required',
        description: 'Please describe the canvas you want to create',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await apiClient.generateTemplate(desc.trim());
      if (response.success && response.data) {
        onTemplateGenerated(response.data);
        toast({
          title: 'Template Generated!',
          description: 'Your AI-generated canvas is ready',
        });
        onOpenChange(false);
        setDescription('');
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Failed to generate template:', error);
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate template. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGetSuggestions = async () => {
    if (!description.trim()) return;

    setLoadingSuggestions(true);
    try {
      const response = await apiClient.generateTemplateSuggestions(description.trim());
      if (response.success && response.data) {
        setSuggestions(response.data.suggestions);
      }
    } catch (error) {
      console.error('Failed to get suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const quickTemplates = [
    { label: '📋 Project Planning Board', description: 'A project planning board with phases, tasks, and milestones' },
    { label: '💡 Brainstorming Canvas', description: 'A creative brainstorming space with sticky notes and idea organization' },
    { label: '📚 Learning Notes', description: 'A structured learning canvas with notes, key points, and summaries' },
    { label: '🎯 Sprint Planning', description: 'An agile sprint planning board with user stories and tasks' },
    { label: '📊 Business Strategy', description: 'A business strategy canvas with goals, actions, and metrics' },
    { label: '💻 Code Documentation', description: 'A technical documentation board with code examples and explanations' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg">
              <Wand2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <DialogTitle>AI Canvas Generator</DialogTitle>
              <DialogDescription>
                Describe the canvas you want, and AI will create it for you
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Quick Templates */}
          {!description && (
            <div className="space-y-3">
              <p className="text-sm font-medium">Quick start:</p>
              <div className="grid grid-cols-2 gap-2">
                {quickTemplates.map((template) => (
                  <Button
                    key={template.label}
                    variant="outline"
                    className="justify-start h-auto py-3 px-4 text-left"
                    onClick={() => setDescription(template.description)}
                  >
                    <span className="text-sm">{template.label}</span>
                  </Button>
                ))}
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or describe your own
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Description Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">What canvas do you want to create?</label>
            <Textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setSuggestions([]);
              }}
              placeholder="Example: A product roadmap with quarterly goals, features, and dependencies..."
              className="min-h-[100px] resize-none"
              disabled={isGenerating}
            />
          </div>

          {/* AI Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <p className="text-sm font-medium">AI Suggestions:</p>
              </div>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <Card
                    key={index}
                    className="p-3 cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handleGenerate(suggestion)}
                  >
                    <p className="text-sm">{suggestion}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {description.trim() && suggestions.length === 0 && (
              <Button
                variant="outline"
                onClick={handleGetSuggestions}
                disabled={isGenerating || loadingSuggestions}
                className="flex-1"
              >
                {loadingSuggestions ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Getting suggestions...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Get AI Suggestions
                  </>
                )}
              </Button>
            )}
            <Button
              onClick={() => handleGenerate()}
              disabled={!description.trim() || isGenerating}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Canvas
                </>
              )}
            </Button>
          </div>

          {/* Info Card */}
          <Card className="p-4 bg-muted/50">
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <Sparkles className="h-5 w-5 text-purple-500" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">How it works</p>
                <p className="text-xs text-muted-foreground">
                  Our AI understands all canvas elements (sticky notes, tasks, code blocks, shapes, etc.) 
                  and creates a beautifully organized board based on your description. The more specific 
                  you are, the better the result!
                </p>
              </div>
            </div>
          </Card>

          {/* Examples */}
          {!description && (
            <div className="space-y-2 pt-2">
              <p className="text-xs font-medium text-muted-foreground">Example prompts:</p>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  • &quot;A software development workflow with planning, coding, testing, and deployment phases&quot;
                </p>
                <p className="text-xs text-muted-foreground">
                  • &quot;A study guide for machine learning with key concepts, code examples, and practice problems&quot;
                </p>
                <p className="text-xs text-muted-foreground">
                  • &quot;A wedding planning board with budget, guest list, venue, and timeline tasks&quot;
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}


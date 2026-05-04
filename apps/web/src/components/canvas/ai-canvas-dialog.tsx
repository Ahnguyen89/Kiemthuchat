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
import { Sparkles, Send, Loader2, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AICanvasDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSummarize: () => Promise<string>;
  onAskQuestion: (question: string) => Promise<string>;
  canvasName?: string;
}

export default function AICanvasDialog({
  open,
  onOpenChange,
  onSummarize,
  onAskQuestion,
  canvasName,
}: AICanvasDialogProps) {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSummarize = async () => {
    setIsLoading(true);
    try {
      const summary = await onSummarize();
      setMessages([
        ...messages,
        {
          role: 'user',
          content: 'Please summarize this canvas',
        },
        {
          role: 'assistant',
          content: summary,
        },
      ]);
    } catch (error) {
      console.error('Failed to summarize:', error);
      setMessages([
        ...messages,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error while summarizing the canvas.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim() || isLoading) return;

    const userMessage = question.trim();
    setQuestion('');
    setMessages([...messages, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const answer = await onAskQuestion(userMessage);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: answer,
        },
      ]);
    } catch (error) {
      console.error('Failed to ask question:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error while processing your question.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskQuestion();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg">
              <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <DialogTitle>AI Canvas Assistant</DialogTitle>
              <DialogDescription>
                Ask questions or get a summary of your canvas: {canvasName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Quick Actions */}
          {messages.length === 0 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Quick actions:</p>
              <div className="grid gap-2">
                <Button
                  variant="outline"
                  onClick={handleSummarize}
                  disabled={isLoading}
                  className="justify-start"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Summarize Canvas
                </Button>
              </div>

              <div className="pt-2">
                <p className="text-sm text-muted-foreground mb-2">
                  Or ask a question:
                </p>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start text-left h-auto py-2 px-3"
                    onClick={() => {
                      setQuestion('What are the main topics covered in this canvas?');
                    }}
                  >
                    What are the main topics covered in this canvas?
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start text-left h-auto py-2 px-3"
                    onClick={() => {
                      setQuestion('What tasks need to be completed?');
                    }}
                  >
                    What tasks need to be completed?
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start text-left h-auto py-2 px-3"
                    onClick={() => {
                      setQuestion('Can you explain the code blocks in this canvas?');
                    }}
                  >
                    Can you explain the code blocks in this canvas?
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.length > 0 && (
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex gap-3',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0">
                      <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg">
                        <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                  )}
                  <Card
                    className={cn(
                      'p-3 max-w-[80%]',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </Card>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="flex-shrink-0">
                    <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg">
                      <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <Card className="p-3 bg-muted">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2 pt-2 border-t">
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about the canvas..."
              className="flex-1 min-h-[60px] max-h-[120px] resize-none"
              disabled={isLoading}
            />
            <Button
              onClick={handleAskQuestion}
              disabled={!question.trim() || isLoading}
              size="icon"
              className="h-[60px] w-[60px]"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


"use client"

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Zap, Bot, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Overview</h1>
            <p className="text-muted-foreground">Welcome to your AI workspace, {user?.name}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Chat Flow Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <Link href="/dashboard/chat?new=true">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">AI Chat Flow</CardTitle>
                    <CardDescription>Interactive streaming chat interface</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Experience real-time AI conversations with visual flow connections and smooth
                    animations.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Zap className="h-3 w-3" />
                        <span>Real-time</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Bot className="h-3 w-3" />
                        <span>Multi-model</span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>

          {/* Settings Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <Link href="/dashboard/settings">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg group-hover:bg-muted/80 transition-colors">
                    <Bot className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">API Settings</CardTitle>
                    <CardDescription>Configure your AI model credentials</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Add API keys for OpenAI, Anthropic, and Google to start using AI models.
                  </p>
                  <div className="flex items-center justify-end">
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>

          {/* Canvas Workspace Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <Link href="/dashboard/canvas">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-900/30 transition-colors">
                    <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Canvas Workspace</CardTitle>
                    <CardDescription>Visual thinking and collaboration</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Create beautiful canvases with sticky notes, shapes, tasks, and more.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MessageSquare className="h-3 w-3" />
                        <span>Templates</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Bot className="h-3 w-3" />
                        <span>AI-Powered</span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}

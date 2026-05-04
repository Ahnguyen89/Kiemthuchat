"use client"

import React, { use, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import CanvasBoard from '@/components/canvas/canvas-board';
import { CanvasCollaborationProvider, useCanvasCollaboration } from '@/contexts/canvas-collaboration-context';
import { Loader2, AlertCircle, LogIn, Eye, Edit, Users as UsersIcon } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Flow } from '@canvas-llm/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/components/ui/use-toast';

function SharedCanvasContent({ shareToken }: { shareToken: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [flow, setFlow] = useState<Flow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ownerName, setOwnerName] = useState<string>('');
  const { socket } = useCanvasCollaboration();

  const loadSharedCanvas = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getSharedFlow(shareToken);
      const flowData = response.data as any;
      
      // Ensure unique nodes and edges to prevent duplicate keys
      const uniqueNodes = Array.isArray(flowData.nodes) 
        ? flowData.nodes.filter((node: any, index: number, self: any[]) =>
            index === self.findIndex((n: any) => n.id === node.id)
          )
        : [];
      
      const uniqueEdges = Array.isArray(flowData.edges)
        ? flowData.edges.filter((edge: any, index: number, self: any[]) =>
            index === self.findIndex((e: any) => e.id === edge.id)
          )
        : [];
      
      setFlow({
        ...flowData,
        nodes: uniqueNodes,
        edges: uniqueEdges,
      });
      setOwnerName(flowData.user?.name || 'Unknown');
    } catch (err: any) {
      setError(err.message || 'Failed to load shared canvas');
    } finally {
      setIsLoading(false);
    }
  }, [shareToken]);

  useEffect(() => {
    loadSharedCanvas();
  }, [loadSharedCanvas]);

  // Listen for save events from other collaborators
  useEffect(() => {
    if (!socket) return;

    const handleCanvasSaved = ({ userId, userName, versionNumber }: any) => {
      // Don't show notification for own saves
      if (userId !== user?.id) {
        // Reload the canvas to get updated data
        loadSharedCanvas();
        
        // Show toast notification
        toast({
          title: 'Canvas Updated',
          description: `${userName} saved version ${versionNumber}`,
        });
      }
    };

    socket.on('canvas:saved', handleCanvasSaved);

    return () => {
      socket.off('canvas:saved', handleCanvasSaved);
    };
  }, [socket, user?.id, toast, loadSharedCanvas]);

  // Show loading while loading canvas
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading shared canvas...</p>
        </div>
      </div>
    );
  }

  if (error || !flow) {
    return (
      <div className="flex items-center justify-center h-screen bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <CardTitle>Canvas Not Found</CardTitle>
                <CardDescription>
                  This shared canvas doesn&apos;t exist or is no longer available
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The link may have expired or been revoked by the owner.
            </p>
            <div className="flex gap-2">
              <Button asChild className="flex-1">
                <Link href="/dashboard/canvas">
                  Go to Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background">
      {/* Header Banner for Shared Canvas */}
      <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-b px-6 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                {flow.sharePermission === 'VIEW' ? (
                  <Eye className="h-5 w-5 text-primary-foreground" />
                ) : (
                  <UsersIcon className="h-5 w-5 text-primary-foreground" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">
                  {flow.sharePermission === 'VIEW' ? 'Viewing' : 'Collaborating on'} shared canvas by{' '}
                  <span className="font-semibold">{ownerName}</span>
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  {flow.sharePermission === 'VIEW' ? (
                    <>
                      <Eye className="h-3 w-3" />
                      <span>View-only mode - You can see but not edit</span>
                    </>
                  ) : (
                    <>
                      <Edit className="h-3 w-3" />
                      <span>Edit mode - You can collaborate and make changes</span>
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <p className="text-xs text-muted-foreground">
              Signed in as <span className="font-medium">{user?.name}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="h-[calc(100vh-73px)] p-4">
        {flow && (
          <CanvasBoard
            key={`canvas-${shareToken}`}
            currentFlow={flow}
            initialNodes={flow.nodes || []}
            initialEdges={flow.edges || []}
          onSave={async (nodes, edges) => {
            // Save changes via share token
            try {
              await apiClient.updateSharedFlow(shareToken, {
                nodes: nodes as any,
                edges: edges as any,
                isManualSave: true,
              });
              // Reload to get updated version
              loadSharedCanvas();
            } catch (error) {
              console.error('Failed to save shared canvas:', error);
              throw error;
            }
          }}
            readOnly={flow.sharePermission === 'VIEW'}
            isSharedCanvas={true}
          />
        )}
      </div>
    </div>
  );
}

export default function SharedCanvasPage({ params }: { params: Promise<{ shareToken: string }> }) {
  const resolvedParams = use(params);
  const { user, isLoading: isAuthLoading } = useAuth();

  // Show loading while checking auth
  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Require login to access shared canvas
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <UsersIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Sign In Required</CardTitle>
                <CardDescription>
                  You need to sign in to collaborate on this canvas
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Create a free account or sign in to view and collaborate on this shared canvas.
            </p>
            <div className="flex gap-2">
              <Button asChild className="flex-1">
                <Link href="/login">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/register">Create Account</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <CanvasCollaborationProvider>
      <SharedCanvasContent shareToken={resolvedParams.shareToken} />
    </CanvasCollaborationProvider>
  );
}


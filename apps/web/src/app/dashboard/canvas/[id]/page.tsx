"use client"

import React, { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCanvas } from '@/hooks/use-canvas';
import CanvasBoard from '@/components/canvas/canvas-board';
import { CanvasCollaborationProvider, useCanvasCollaboration } from '@/contexts/canvas-collaboration-context';
import { Loader2, Globe, History, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

function CanvasPageContent({ flowId }: { flowId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { useFlow, saveCanvas, useFlowVersions } = useCanvas();
  const { data: flow, isLoading, error, refetch } = useFlow(flowId);
  const { data: versions, refetch: refetchVersions } = useFlowVersions(flowId);
  const { socket } = useCanvasCollaboration();

  // Listen for save events from collaborators
  useEffect(() => {
    if (!socket) return;

    const handleCanvasSaved = ({ userId, userName, versionNumber }: any) => {
      // Refetch flow and versions to show updated data
      refetch();
      refetchVersions();
      
      // Show toast notification
      toast({
        title: 'Canvas Updated',
        description: `${userName} saved version ${versionNumber}`,
      });
    };

    socket.on('canvas:saved', handleCanvasSaved);

    return () => {
      socket.off('canvas:saved', handleCanvasSaved);
    };
  }, [socket, refetch, refetchVersions, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !flow) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Canvas Not Found</h2>
          <p className="text-muted-foreground">The canvas you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  const latestVersion = versions?.[0];

  return (
    <div className="h-full flex flex-col">
      {/* Top Bar */}
      <div className="border-b p-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Public Badge */}
          {flow.isPublic && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              Publicly Shared
            </Badge>
          )}
          {/* Version Indicator */}
          {latestVersion && (
            <Badge variant="outline" className="flex items-center gap-1">
              Version {latestVersion.versionNumber}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/dashboard/canvas/${flow.id}/versions`)}
          >
            <History className="h-4 w-4 mr-2" />
            Version History
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/dashboard/canvas/${flow.id}/audit-log`)}
          >
            <FileText className="h-4 w-4 mr-2" />
            Audit Log
          </Button>
        </div>
      </div>
      
      {/* Canvas */}
      <div className="flex-1 p-4 overflow-hidden">
        <CanvasBoard
          currentFlow={flow}
          initialNodes={flow.nodes}
          initialEdges={flow.edges}
          onSave={async (nodes, edges) => {
            await saveCanvas(flow.id, nodes, edges, true);
            // Refetch to get updated share status
            refetch();
            refetchVersions();
          }}
        />
      </div>
    </div>
  );
}

export default function CanvasPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  
  return (
    <CanvasCollaborationProvider>
      <CanvasPageContent flowId={resolvedParams.id} />
    </CanvasCollaborationProvider>
  );
}


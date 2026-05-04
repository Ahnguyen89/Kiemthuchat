"use client"

import React, { useState } from 'react';
import { Clock, User, RotateCcw, GitCompare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';

interface Version {
  id: string;
  versionNumber: number;
  nodes: any[];
  edges: any[];
  createdAt: Date;
  description?: string;
  creator: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

interface VersionHistoryProps {
  flowId: string;
  versions: Version[];
  isLoading?: boolean;
  onRevert: (versionId: string) => Promise<void>;
  onCompare: (versionId: string) => void;
  currentVersionNumber?: number;
}

export default function VersionHistory({
  flowId,
  versions,
  isLoading,
  onRevert,
  onCompare,
  currentVersionNumber,
}: VersionHistoryProps) {
  const [revertingVersionId, setRevertingVersionId] = useState<string | null>(null);
  const [confirmRevertVersion, setConfirmRevertVersion] = useState<Version | null>(null);

  const handleRevert = async (version: Version) => {
    setRevertingVersionId(version.id);
    try {
      await onRevert(version.id);
      setConfirmRevertVersion(null);
    } catch (error) {
      console.error('Failed to revert:', error);
    } finally {
      setRevertingVersionId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!versions || versions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Versions Yet</CardTitle>
          <CardDescription>
            Start making changes and saving your canvas to create version history.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <ScrollArea className="h-full">
        <div className="space-y-4 p-4">
          {versions.map((version) => {
            const isCurrentVersion = currentVersionNumber === version.versionNumber;
            
            return (
              <Card key={version.id} className={isCurrentVersion ? 'border-primary' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={version.creator.avatar} alt={version.creator.name} />
                        <AvatarFallback>
                          {version.creator.name
                            .split(' ')
                            .map(n => n[0])
                            .join('')
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">Version {version.versionNumber}</CardTitle>
                          {isCurrentVersion && (
                            <Badge variant="default">Current</Badge>
                          )}
                        </div>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <User className="h-3 w-3" />
                          {version.creator.name}
                          <Clock className="h-3 w-3 ml-2" />
                          {format(new Date(version.createdAt), 'MMM dd, yyyy HH:mm')}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onCompare(version.id)}
                      >
                        <GitCompare className="h-4 w-4 mr-2" />
                        Compare
                      </Button>
                      {!isCurrentVersion && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setConfirmRevertVersion(version)}
                          disabled={revertingVersionId === version.id}
                        >
                          {revertingVersionId === version.id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <RotateCcw className="h-4 w-4 mr-2" />
                          )}
                          Revert
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    {version.description || 'No description'}
                  </div>
                  <div className="flex gap-4 mt-3 text-sm">
                    <div>
                      <span className="font-medium">{version.nodes.length}</span> nodes
                    </div>
                    <div>
                      <span className="font-medium">{version.edges.length}</span> edges
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>

      <AlertDialog open={!!confirmRevertVersion} onOpenChange={(open) => !open && setConfirmRevertVersion(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revert to Version {confirmRevertVersion?.versionNumber}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore your canvas to the state it was in at version {confirmRevertVersion?.versionNumber}.
              Your current canvas will be saved as a new version, so you can always undo this action.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmRevertVersion && handleRevert(confirmRevertVersion)}
            >
              Revert
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

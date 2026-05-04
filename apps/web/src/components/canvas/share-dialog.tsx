'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Check, Link as LinkIcon, Globe, Lock, Eye, Edit, Users } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { apiClient } from '@/lib/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flowId: string;
  flowName: string;
  isPublic: boolean;
  shareToken?: string;
  sharePermission?: 'VIEW' | 'EDIT';
  onShareUpdate: () => void;
}

export default function ShareDialog({
  open,
  onOpenChange,
  flowId,
  flowName,
  isPublic: initialIsPublic,
  shareToken: initialShareToken,
  sharePermission: initialSharePermission,
  onShareUpdate,
}: ShareDialogProps) {
  const { toast } = useToast();
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [shareToken, setShareToken] = useState(initialShareToken);
  const [permission, setPermission] = useState<'VIEW' | 'EDIT'>(initialSharePermission || 'EDIT');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const shareUrl = shareToken
    ? `${window.location.origin}/canvas/shared/${shareToken}`
    : '';

  const handleGenerateLink = async () => {
    setIsGenerating(true);
    try {
      const response = await apiClient.generateShareLink(flowId, permission);
      const updatedFlow = response.data;
      setIsPublic(true);
      setShareToken(updatedFlow?.shareToken || '');
      setPermission(updatedFlow?.sharePermission || 'EDIT');
      onShareUpdate();
      toast({
        title: 'Share link generated',
        description: `Anyone with the link can now ${permission === 'VIEW' ? 'view' : 'edit'} this canvas`,
      });
    } catch (error) {
      toast({
        title: 'Failed to generate link',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRevokeLink = async () => {
    try {
      await apiClient.revokeShareLink(flowId);
      setIsPublic(false);
      setShareToken(undefined);
      onShareUpdate();
      toast({
        title: 'Share link revoked',
        description: 'This canvas is now private',
      });
    } catch (error) {
      toast({
        title: 'Failed to revoke link',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: 'Link copied!',
        description: 'Share this link with others to collaborate',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Failed to copy',
        description: 'Please copy the link manually',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share &quot;{flowName}&quot;</DialogTitle>
          <DialogDescription>
            Share this canvas with others for collaboration
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Status */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            {isPublic ? (
              <>
                <Globe className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Public Link Active</p>
                  <p className="text-xs text-muted-foreground">
                    Anyone with the link can {permission === 'VIEW' ? 'view' : 'view and edit'} this canvas
                  </p>
                </div>
              </>
            ) : (
              <>
                <Lock className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Private Canvas</p>
                  <p className="text-xs text-muted-foreground">
                    Only you can access this canvas
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Permission Selector (Only show when not yet public) */}
          {!isPublic && (
            <div className="space-y-2">
              <Label htmlFor="permission">Access Permission</Label>
              <Select value={permission} onValueChange={(value: 'VIEW' | 'EDIT') => setPermission(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VIEW">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      <div>
                        <p className="font-medium">View Only</p>
                        <p className="text-xs text-muted-foreground">Can view but not edit</p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="EDIT">
                    <div className="flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      <div>
                        <p className="font-medium">Can Edit</p>
                        <p className="text-xs text-muted-foreground">Can view and collaborate</p>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Share Link */}
          {isPublic && shareUrl && (
            <div className="space-y-2">
              <Label htmlFor="share-link">Share Link</Label>
              <div className="flex gap-2">
                <Input
                  id="share-link"
                  value={shareUrl}
                  readOnly
                  className="flex-1"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleCopyLink}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {permission === 'VIEW' ? (
                  <>
                    <Eye className="h-3 w-3" />
                    <span>View-only access</span>
                  </>
                ) : (
                  <>
                    <Edit className="h-3 w-3" />
                    <span>Can edit and collaborate</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {isPublic ? (
            <Button
              variant="destructive"
              onClick={handleRevokeLink}
              className="flex items-center gap-2"
            >
              <Lock className="h-4 w-4" />
              Revoke Link
            </Button>
          ) : (
            <Button
              onClick={handleGenerateLink}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              <LinkIcon className="h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Generate Share Link'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


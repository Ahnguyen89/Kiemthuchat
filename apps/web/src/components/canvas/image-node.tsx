'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageNodeData } from '@canvas-llm/shared';

export default function ImageNode({ id, data, selected }: NodeProps<ImageNodeData>) {
  const [caption, setCaption] = useState(data.caption || '');
  const [url, setUrl] = useState(data.url || '');
  const [isEditingUrl, setIsEditingUrl] = useState(!data.url);
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Update local state when data changes externally (from collaboration)
  useEffect(() => {
    if (!isEditingUrl && data.url !== url) {
      setUrl(data.url || '');
      setImageError(false);
    }
  }, [data.url, isEditingUrl, url]);

  useEffect(() => {
    if (!isEditingCaption && data.caption !== caption) {
      setCaption(data.caption || '');
    }
  }, [data.caption, isEditingCaption, caption]);

  const handleUrlBlur = useCallback(() => {
    data.url = url;
    setIsEditingUrl(false);
    setImageError(false);
  }, [url, data]);

  const handleCaptionBlur = useCallback(() => {
    data.caption = caption;
    setIsEditingCaption(false);
  }, [caption, data]);

  return (
    <Card
      className={cn(
        'min-w-[200px] max-w-[400px] overflow-hidden transition-all duration-200',
        selected && 'ring-2 ring-primary ring-offset-2'
      )}
    >
      <CardContent className="p-2">
        {isEditingUrl ? (
          <div className="space-y-2 p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <LinkIcon className="h-4 w-4" />
              <span>Enter image URL</span>
            </div>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={handleUrlBlur}
              placeholder="https://example.com/image.jpg"
              autoFocus
            />
            <Button onClick={handleUrlBlur} size="sm" className="w-full">
              Load Image
            </Button>
          </div>
        ) : imageError || !url ? (
          <div
            onClick={() => setIsEditingUrl(true)}
            className="flex flex-col items-center justify-center h-48 bg-muted/30 border-2 border-dashed border-muted-foreground/20 rounded cursor-pointer hover:border-muted-foreground/40 transition-colors"
          >
            <ImageIcon className="h-12 w-12 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">
              {imageError ? 'Failed to load image. Click to retry.' : 'Click to add image URL'}
            </p>
          </div>
        ) : (
          <div className="relative group">
            <img
              src={url}
              alt={data.alt || 'Image'}
              className="w-full h-auto rounded"
              onError={() => setImageError(true)}
              style={{
                maxWidth: data.width || '400px',
                maxHeight: data.height || '400px',
                objectFit: 'contain',
              }}
            />
            <Button
              onClick={() => setIsEditingUrl(true)}
              variant="secondary"
              size="sm"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 text-xs"
            >
              Change Image
            </Button>
          </div>
        )}

        {/* Caption */}
        {url && !isEditingUrl && (
          <div className="mt-2">
            {isEditingCaption ? (
              <Input
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                onBlur={handleCaptionBlur}
                placeholder="Add caption..."
                className="text-sm"
                autoFocus
              />
            ) : (
              <p
                onClick={() => setIsEditingCaption(true)}
                className="text-sm text-muted-foreground text-center cursor-text hover:bg-muted/30 rounded px-2 py-1"
              >
                {caption || 'Add caption...'}
              </p>
            )}
          </div>
        )}
      </CardContent>

      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-primary border-2 border-background"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-primary border-2 border-background"
      />
    </Card>
  );
}


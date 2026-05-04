'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { HeadingNodeData } from '@canvas-llm/shared';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function HeadingNode({ id, data, selected }: NodeProps<HeadingNodeData>) {
  const [text, setText] = useState(data.text || '');
  const [isEditing, setIsEditing] = useState(!data.text);

  // Update local state when data changes externally (from collaboration)
  useEffect(() => {
    if (!isEditing && data.text !== text) {
      setText(data.text || '');
    }
  }, [data.text, isEditing, text]);

  const handleBlur = useCallback(() => {
    // Emit custom event to update node data properly
    window.dispatchEvent(
      new CustomEvent('node-data-change', {
        detail: { nodeId: id, updates: { text } },
      })
    );
    setIsEditing(false);
  }, [text, id]);

  const handleLevelChange = useCallback((value: string) => {
    const newLevel = parseInt(value) as 1 | 2 | 3 | 4 | 5 | 6;
    // Emit custom event to update node data properly
    window.dispatchEvent(
      new CustomEvent('node-data-change', {
        detail: { nodeId: id, updates: { level: newLevel } },
      })
    );
  }, [id]);

  const HeadingTag = `h${data.level}` as keyof JSX.IntrinsicElements;
  const fontSize = {
    1: 'text-4xl',
    2: 'text-3xl',
    3: 'text-2xl',
    4: 'text-xl',
    5: 'text-lg',
    6: 'text-base',
  }[data.level];

  return (
    <div
      className={cn(
        'relative group bg-background p-4 rounded-lg border-2 border-transparent transition-all shadow-sm',
        selected && 'border-primary shadow-md'
      )}
    >
      {/* Level Selector */}
      <div className="absolute -top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <Select value={String(data.level)} onValueChange={handleLevelChange}>
          <SelectTrigger className="h-6 w-16 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5, 6].map((level) => (
              <SelectItem key={level} value={String(level)}>
                H{level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isEditing ? (
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          placeholder="Enter heading..."
          className={cn('border-none bg-transparent font-bold focus-visible:ring-0 focus-visible:ring-offset-0', fontSize)}
          autoFocus
        />
      ) : (
        <HeadingTag
          onClick={() => setIsEditing(true)}
          className={cn('font-bold cursor-text min-w-[200px]', fontSize)}
        >
          {text || 'Click to edit...'}
        </HeadingTag>
      )}

      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 !bg-primary border-2 border-white"
        style={{ opacity: selected ? 1 : 0 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 !bg-primary border-2 border-white"
        style={{ opacity: selected ? 1 : 0 }}
      />
    </div>
  );
}


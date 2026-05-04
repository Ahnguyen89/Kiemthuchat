'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { StickyNoteData, STICKY_NOTE_COLORS } from '@canvas-llm/shared';
import { Button } from '@/components/ui/button';
import { Palette } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function StickyNoteNode({ id, data, selected }: NodeProps<StickyNoteData>) {
  const [text, setText] = useState(data.text || '');
  const [isEditing, setIsEditing] = useState(!data.text);
  const bgColor = STICKY_NOTE_COLORS[data.color as keyof typeof STICKY_NOTE_COLORS] || STICKY_NOTE_COLORS.yellow;

  // Update local state when data changes externally (from collaboration)
  useEffect(() => {
    if (!isEditing && data.text !== text) {
      setText(data.text || '');
    }
  }, [data.text, isEditing, text]);

  const handleBlur = useCallback(() => {
    data.text = text;
    setIsEditing(false);
  }, [text, data]);

  const handleColorChange = useCallback((color: string) => {
    data.color = color;
    // Force re-render by updating the data reference
    Object.assign(data, { ...data });
  }, [data]);

  return (
    <div
      className={cn(
        'relative min-w-[200px] min-h-[200px] max-w-[280px] p-4 rounded-lg shadow-lg transition-all duration-200',
        'font-handwriting',
        selected && 'ring-2 ring-primary ring-offset-2'
      )}
      style={{ 
        backgroundColor: bgColor,
        transform: 'rotate(-1deg)',
        boxShadow: selected 
          ? '0 10px 30px rgba(0,0,0,0.2)' 
          : '0 4px 10px rgba(0,0,0,0.1)',
      }}
    >
      {/* Color Picker */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="h-6 w-6 hover:bg-black/10">
              <Palette className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {Object.entries(STICKY_NOTE_COLORS).map(([colorName, colorValue]) => (
              <DropdownMenuItem
                key={colorName}
                onClick={() => handleColorChange(colorName)}
                className="flex items-center gap-2"
              >
                <div
                  className="w-4 h-4 rounded border border-gray-300"
                  style={{ backgroundColor: colorValue }}
                />
                <span className="capitalize">{colorName}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isEditing ? (
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          placeholder="Type your note..."
          className="w-full h-full min-h-[160px] resize-none border-none bg-transparent text-base leading-relaxed placeholder:text-gray-500/60 focus-visible:ring-0 focus-visible:ring-offset-0"
          autoFocus
          style={{ fontSize: data.fontSize === 'large' ? '18px' : data.fontSize === 'small' ? '14px' : '16px' }}
        />
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className="w-full min-h-[160px] whitespace-pre-wrap break-words text-base leading-relaxed cursor-text"
          style={{ fontSize: data.fontSize === 'large' ? '18px' : data.fontSize === 'small' ? '14px' : '16px' }}
        >
          {text || 'Click to edit...'}
        </div>
      )}

      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 !bg-gray-600 border-2 border-white"
        style={{ opacity: selected ? 1 : 0 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 !bg-gray-600 border-2 border-white"
        style={{ opacity: selected ? 1 : 0 }}
      />
      <Handle
        type="target"
        position={Position.Left}
        className="w-2 h-2 !bg-gray-600 border-2 border-white"
        style={{ opacity: selected ? 1 : 0 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-2 h-2 !bg-gray-600 border-2 border-white"
        style={{ opacity: selected ? 1 : 0 }}
      />
    </div>
  );
}


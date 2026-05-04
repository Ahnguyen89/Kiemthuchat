'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  StickyNote,
  Square,
  Circle,
  Triangle,
  FileText,
  Image as ImageIcon,
  Code,
  Heading1,
  CheckSquare,
  Plus,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

interface CanvasToolbarProps {
  onAddNode: (type: string) => void;
  onAIClick?: () => void;
}

const TOOLS = [
  { type: 'notionPage', icon: BookOpen, label: 'Notion Page', group: 'content' },
  { type: 'textNode', icon: FileText, label: 'Text Block', group: 'content' },
  { type: 'stickyNote', icon: StickyNote, label: 'Sticky Note', group: 'content' },
  { type: 'heading', icon: Heading1, label: 'Heading', group: 'content' },
  { type: 'taskList', icon: CheckSquare, label: 'Task List', group: 'content' },
  { type: 'codeBlock', icon: Code, label: 'Code Block', group: 'content' },
  { type: 'image', icon: ImageIcon, label: 'Image', group: 'media' },
  { type: 'shape-rectangle', icon: Square, label: 'Rectangle', group: 'shapes' },
  { type: 'shape-circle', icon: Circle, label: 'Circle', group: 'shapes' },
  { type: 'shape-triangle', icon: Triangle, label: 'Triangle', group: 'shapes' },
];

const GROUPS = [
  { id: 'content', label: 'Content' },
  { id: 'shapes', label: 'Shapes' },
  { id: 'media', label: 'Media' },
];

export default function CanvasToolbar({ onAddNode, onAIClick }: CanvasToolbarProps) {
  return (
    <Card className="p-2 bg-background/95 backdrop-blur-sm border shadow-lg">
      <TooltipProvider>
        <div className="flex items-center gap-1">
          {/* AI Assistant Button */}
          {onAIClick && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onAIClick}
                    className="h-9 w-9 hover:bg-primary/10 bg-gradient-to-br from-purple-500/10 to-blue-500/10"
                  >
                    <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>AI Assistant - Ask about canvas</p>
                </TooltipContent>
              </Tooltip>
              <Separator orientation="vertical" className="h-8 mx-1" />
            </>
          )}

          {GROUPS.map((group, groupIndex) => (
            <React.Fragment key={group.id}>
              {groupIndex > 0 && <Separator orientation="vertical" className="h-8 mx-1" />}
              <div className="flex items-center gap-1">
                {TOOLS.filter((tool) => tool.group === group.id).map((tool) => (
                  <Tooltip key={tool.type}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onAddNode(tool.type)}
                        className="h-9 w-9 hover:bg-primary/10"
                      >
                        <tool.icon className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{tool.label}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </React.Fragment>
          ))}
        </div>
      </TooltipProvider>
    </Card>
  );
}


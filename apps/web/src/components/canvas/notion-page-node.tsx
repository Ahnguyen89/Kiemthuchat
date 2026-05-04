'use client';

import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  NotionPageNodeData,
  NotionBlock,
  NotionBlockType,
} from '@canvas-llm/shared';
import {
  Plus,
  GripVertical,
  Trash2,
  Code,
  ListOrdered,
  List,
  CheckSquare,
  Quote,
  Minus,
  Type,
  Heading1,
  Heading2,
  Heading3,
  Smile,
  AlertCircle,
  ChevronRight,
  Table as TableIcon,
  Image as ImageIcon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface BlockMenuProps {
  onSelect: (type: NotionBlockType) => void;
  trigger?: React.ReactNode;
}

const BlockMenu = ({ onSelect, trigger }: BlockMenuProps) => {
  const blockTypes: { type: NotionBlockType; label: string; icon: React.ReactNode; description: string }[] = [
    { type: 'paragraph', label: 'Paragraph', icon: <Type className="h-4 w-4" />, description: 'Plain text' },
    { type: 'heading1', label: 'Heading 1', icon: <Heading1 className="h-4 w-4" />, description: 'Large heading' },
    { type: 'heading2', label: 'Heading 2', icon: <Heading2 className="h-4 w-4" />, description: 'Medium heading' },
    { type: 'heading3', label: 'Heading 3', icon: <Heading3 className="h-4 w-4" />, description: 'Small heading' },
    { type: 'bulletList', label: 'Bullet List', icon: <List className="h-4 w-4" />, description: 'Create a bulleted list' },
    { type: 'numberedList', label: 'Numbered List', icon: <ListOrdered className="h-4 w-4" />, description: 'Create a numbered list' },
    { type: 'todo', label: 'Todo', icon: <CheckSquare className="h-4 w-4" />, description: 'Track tasks with a checkbox' },
    { type: 'code', label: 'Code', icon: <Code className="h-4 w-4" />, description: 'Capture code snippet' },
    { type: 'quote', label: 'Quote', icon: <Quote className="h-4 w-4" />, description: 'Add a quote' },
    { type: 'callout', label: 'Callout', icon: <AlertCircle className="h-4 w-4" />, description: 'Highlight important info' },
    { type: 'toggle', label: 'Toggle', icon: <ChevronRight className="h-4 w-4" />, description: 'Collapsible content' },
    { type: 'divider', label: 'Divider', icon: <Minus className="h-4 w-4" />, description: 'Visual divider' },
    { type: 'image', label: 'Image', icon: <ImageIcon className="h-4 w-4" />, description: 'Upload or embed an image' },
    { type: 'table', label: 'Table', icon: <TableIcon className="h-4 w-4" />, description: 'Simple table (coming soon)' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 max-h-[400px] overflow-y-auto">
        <div className="px-2 py-1.5 text-sm font-semibold sticky top-0 bg-background z-10">Add Block</div>
        <DropdownMenuSeparator />
        {blockTypes.map((block) => (
          <DropdownMenuItem
            key={block.type}
            onClick={() => onSelect(block.type)}
            className="flex items-start gap-3 p-2 cursor-pointer"
          >
            <div className="mt-0.5">{block.icon}</div>
            <div className="flex-1">
              <div className="font-medium text-sm">{block.label}</div>
              <div className="text-xs text-muted-foreground">{block.description}</div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface BlockComponentProps {
  block: NotionBlock;
  index: number;
  isLast: boolean;
  onUpdate: (id: string, updates: Partial<NotionBlock>) => void;
  onDelete: (id: string) => void;
  onAddBelow: (index: number, type: NotionBlockType) => void;
  onKeyDown: (e: KeyboardEvent, blockId: string, index: number) => void;
  allBlocks: NotionBlock[];
  onConvertBlock: (id: string, newType: NotionBlockType) => void;
  isNodeSelected: boolean;
}

const BlockComponent: React.FC<BlockComponentProps> = ({
  block,
  index,
  isLast,
  onUpdate,
  onDelete,
  onAddBelow,
  onKeyDown,
  allBlocks,
  onConvertBlock,
  isNodeSelected,
}: BlockComponentProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Calculate numbered list index (only count previous numbered list items)
  const getNumberedListIndex = () => {
    let count = 1;
    for (let i = 0; i < index; i++) {
      if (allBlocks[i].type === 'numberedList') {
        count++;
      }
    }
    return count;
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [block.content]);

  const renderBlock = () => {
    switch (block.type) {
      case 'heading1':
        return (
          <Textarea
            ref={textareaRef}
            value={block.content}
            onChange={(e) => onUpdate(block.id, { content: e.target.value })}
            onKeyDown={(e) => onKeyDown(e, block.id, index)}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            placeholder="Heading 1"
            className="text-3xl font-bold border-0 shadow-none p-0 resize-none focus-visible:ring-0 min-h-[40px]"
            rows={1}
          />
        );
      
      case 'heading2':
        return (
          <Textarea
            ref={textareaRef}
            value={block.content}
            onChange={(e) => onUpdate(block.id, { content: e.target.value })}
            onKeyDown={(e) => onKeyDown(e, block.id, index)}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            placeholder="Heading 2"
            className="text-2xl font-bold border-0 shadow-none p-0 resize-none focus-visible:ring-0 min-h-[36px]"
            rows={1}
          />
        );
      
      case 'heading3':
        return (
          <Textarea
            ref={textareaRef}
            value={block.content}
            onChange={(e) => onUpdate(block.id, { content: e.target.value })}
            onKeyDown={(e) => onKeyDown(e, block.id, index)}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            placeholder="Heading 3"
            className="text-xl font-bold border-0 shadow-none p-0 resize-none focus-visible:ring-0 min-h-[32px]"
            rows={1}
          />
        );
      
      case 'bulletList':
        return (
          <div className="flex items-start gap-2">
            <span className="mt-1 leading-7">•</span>
            <Textarea
              ref={textareaRef}
              value={block.content}
              onChange={(e) => onUpdate(block.id, { content: e.target.value })}
              onKeyDown={(e) => onKeyDown(e, block.id, index)}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              placeholder="List item"
              className="flex-1 border-0 shadow-none p-0 resize-none focus-visible:ring-0 min-h-[28px]"
              rows={1}
            />
          </div>
        );
      
      case 'numberedList':
        return (
          <div className="flex items-start gap-2">
            <span className="mt-1 leading-7 min-w-[20px]">{getNumberedListIndex()}.</span>
            <Textarea
              ref={textareaRef}
              value={block.content}
              onChange={(e) => onUpdate(block.id, { content: e.target.value })}
              onKeyDown={(e) => onKeyDown(e, block.id, index)}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              placeholder="List item"
              className="flex-1 border-0 shadow-none p-0 resize-none focus-visible:ring-0 min-h-[28px]"
              rows={1}
            />
          </div>
        );
      
      case 'todo':
        return (
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={block.checked || false}
              onChange={(e) => onUpdate(block.id, { checked: e.target.checked })}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              className="mt-2 h-4 w-4 rounded border-gray-300"
            />
            <Textarea
              ref={textareaRef}
              value={block.content}
              onChange={(e) => onUpdate(block.id, { content: e.target.value })}
              onKeyDown={(e) => onKeyDown(e, block.id, index)}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              placeholder="To-do"
              className={cn(
                'flex-1 border-0 shadow-none p-0 resize-none focus-visible:ring-0 min-h-[28px]',
                block.checked && 'line-through text-muted-foreground'
              )}
              rows={1}
            />
          </div>
        );
      
      case 'code':
        return (
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={block.content}
              onChange={(e) => onUpdate(block.id, { content: e.target.value })}
              onKeyDown={(e) => onKeyDown(e, block.id, index)}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              placeholder="Code"
              className="font-mono text-sm bg-muted border rounded p-3 resize-none focus-visible:ring-1 min-h-[80px]"
              rows={3}
            />
          </div>
        );
      
      case 'quote':
        return (
          <div className="border-l-4 border-primary pl-4">
            <Textarea
              ref={textareaRef}
              value={block.content}
              onChange={(e) => onUpdate(block.id, { content: e.target.value })}
              onKeyDown={(e) => onKeyDown(e, block.id, index)}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              placeholder="Quote"
              className="italic border-0 shadow-none p-0 resize-none focus-visible:ring-0 min-h-[28px]"
              rows={1}
            />
          </div>
        );
      
      case 'divider':
        return <hr className="my-2 border-t border-border" />;
      
      case 'callout':
        return (
          <div className={cn(
            "flex items-start gap-3 p-3 rounded border-l-4",
            block.color === 'blue' && "bg-blue-50 dark:bg-blue-950/20 border-blue-500",
            block.color === 'yellow' && "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-500",
            block.color === 'red' && "bg-red-50 dark:bg-red-950/20 border-red-500",
            !block.color && "bg-blue-50 dark:bg-blue-950/20 border-blue-500"
          )}>
            <span className="text-xl mt-1">{block.emoji || '💡'}</span>
            <Textarea
              ref={textareaRef}
              value={block.content}
              onChange={(e) => onUpdate(block.id, { content: e.target.value })}
              onKeyDown={(e) => onKeyDown(e, block.id, index)}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              placeholder="Callout text"
              className="flex-1 border-0 shadow-none bg-transparent p-0 resize-none focus-visible:ring-0 min-h-[28px]"
              rows={1}
            />
          </div>
        );
      
      case 'toggle':
        return (
          <div>
            <div className="flex items-start gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 mt-1"
                onClick={() => onUpdate(block.id, { isOpen: !block.isOpen })}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <ChevronRight className={cn("h-4 w-4 transition-transform", block.isOpen && "rotate-90")} />
              </Button>
              <Textarea
                ref={textareaRef}
                value={block.content}
                onChange={(e) => onUpdate(block.id, { content: e.target.value })}
                onKeyDown={(e) => onKeyDown(e, block.id, index)}
                onMouseDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                placeholder="Toggle heading"
                className="flex-1 border-0 shadow-none p-0 resize-none focus-visible:ring-0 min-h-[28px] font-medium"
                rows={1}
              />
            </div>
            {block.isOpen && (
              <div className="ml-8 mt-2 text-muted-foreground text-sm">
                <p>Toggle content (coming soon)</p>
              </div>
            )}
          </div>
        );
      
      case 'image':
        const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (!file) return;

          // Check file size (max 2MB)
          if (file.size > 2 * 1024 * 1024) {
            alert('Image size must be less than 2MB');
            return;
          }

          // Compress and convert to base64
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
              // Create canvas for compression
              const canvas = document.createElement('canvas');
              let width = img.width;
              let height = img.height;
              
              // Resize if too large (max 1200px width/height)
              const maxDimension = 1200;
              if (width > maxDimension || height > maxDimension) {
                if (width > height) {
                  height = (height / width) * maxDimension;
                  width = maxDimension;
                } else {
                  width = (width / height) * maxDimension;
                  height = maxDimension;
                }
              }
              
              canvas.width = width;
              canvas.height = height;
              
              const ctx = canvas.getContext('2d');
              if (!ctx) return;
              
              // Draw and compress (0.7 quality for JPEG)
              ctx.drawImage(img, 0, 0, width, height);
              
              // Convert to base64 with compression
              const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
              
              // Check compressed size (base64 is ~33% larger than binary)
              const sizeInBytes = (compressedBase64.length * 3) / 4;
              const sizeInKB = Math.round(sizeInBytes / 1024);
              
              if (sizeInBytes > 1024 * 1024) { // More than 1MB after compression
                alert(`Compressed image is still too large (${sizeInKB}KB). Please use a smaller image.`);
                return;
              }
              
              onUpdate(block.id, { imageBase64: compressedBase64, imageUrl: '' });
            };
            img.src = event.target?.result as string;
          };
          reader.readAsDataURL(file);
        };

        const imageSource = block.imageBase64 || block.imageUrl;
        const hasImage = Boolean(imageSource);

        return (
          <div className="space-y-2">
            {!hasImage ? (
              // Upload controls - only shown when no image
              <div className="flex gap-2">
                <Input
                  value={block.imageUrl || ''}
                  onChange={(e) => onUpdate(block.id, { imageUrl: e.target.value, imageBase64: '' })}
                  onMouseDown={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                  placeholder="Paste image URL or upload file"
                  className="text-sm flex-1"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  Upload
                </Button>
              </div>
            ) : (
              // Image display with controls
              <div className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={imageSource} 
                  alt={block.content || 'Image'} 
                  className="max-w-full rounded border"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EBroken%3C/text%3E%3C/svg%3E';
                  }}
                />
                {/* Image controls on hover */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="h-8 shadow-lg"
                  >
                    Change
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => onUpdate(block.id, { imageBase64: '', imageUrl: '' })}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="h-8 shadow-lg"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      
      case 'table':
        const tableData = block.tableData || [['', '', ''], ['', '', ''], ['', '', '']];
        
        const updateTableCell = (rowIndex: number, colIndex: number, value: string) => {
          const newTableData = tableData.map((row, rIdx) =>
            rIdx === rowIndex
              ? row.map((cell, cIdx) => (cIdx === colIndex ? value : cell))
              : row
          );
          onUpdate(block.id, { tableData: newTableData });
        };

        const addRow = () => {
          const cols = tableData[0]?.length || 3;
          const newRow = Array(cols).fill('');
          onUpdate(block.id, { tableData: [...tableData, newRow] });
        };

        const addColumn = () => {
          const newTableData = tableData.map((row) => [...row, '']);
          onUpdate(block.id, { tableData: newTableData });
        };

        const deleteRow = (rowIndex: number) => {
          if (tableData.length <= 1) return;
          const newTableData = tableData.filter((_, idx) => idx !== rowIndex);
          onUpdate(block.id, { tableData: newTableData });
        };

        const deleteColumn = (colIndex: number) => {
          if ((tableData[0]?.length || 0) <= 1) return;
          const newTableData = tableData.map((row) => row.filter((_, idx) => idx !== colIndex));
          onUpdate(block.id, { tableData: newTableData });
        };

        return (
          <div className="space-y-2">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border">
                <thead>
                  <tr>
                    {tableData[0]?.map((_, colIndex) => (
                      <th key={colIndex} className="border border-border bg-muted p-0 min-w-[120px] relative group">
                        <Input
                          value={tableData[0][colIndex]}
                          onChange={(e) => updateTableCell(0, colIndex, e.target.value)}
                          onMouseDown={(e) => e.stopPropagation()}
                          onPointerDown={(e) => e.stopPropagation()}
                          placeholder={`Column ${colIndex + 1}`}
                          className="border-0 bg-transparent font-semibold h-10 text-center"
                        />
                        {tableData[0].length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteColumn(colIndex)}
                            onMouseDown={(e) => e.stopPropagation()}
                            className="absolute -top-2 -right-2 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 bg-destructive text-destructive-foreground"
                          >
                            ×
                          </Button>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.slice(1).map((row, rowIndex) => (
                    <tr key={rowIndex + 1} className="group relative">
                      {row.map((cell, colIndex) => (
                        <td key={colIndex} className="border border-border p-0">
                          <Input
                            value={cell}
                            onChange={(e) => updateTableCell(rowIndex + 1, colIndex, e.target.value)}
                            onMouseDown={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                            placeholder="..."
                            className="border-0 h-10"
                          />
                        </td>
                      ))}
                      {tableData.length > 2 && (
                        <td className="absolute -left-6 top-1/2 -translate-y-1/2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteRow(rowIndex + 1)}
                            onMouseDown={(e) => e.stopPropagation()}
                            className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 bg-destructive text-destructive-foreground"
                          >
                            ×
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={addRow}
                onMouseDown={(e) => e.stopPropagation()}
              >
                + Add Row
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={addColumn}
                onMouseDown={(e) => e.stopPropagation()}
              >
                + Add Column
              </Button>
            </div>
          </div>
        );
      
      case 'paragraph':
      default:
        return (
          <Textarea
            ref={textareaRef}
            value={block.content}
            onChange={(e) => onUpdate(block.id, { content: e.target.value })}
            onKeyDown={(e) => onKeyDown(e, block.id, index)}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            placeholder="Type something..."
            className="border-0 shadow-none p-0 resize-none focus-visible:ring-0 min-h-[28px]"
            rows={1}
          />
        );
    }
  };

  return (
    <div className="relative gap-2">
      {/* Block Controls - Only show when node is selected */}
      {isNodeSelected && (
        <div className="absolute -left-12 top-0 flex items-center gap-1 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 cursor-move"
            draggable
          >
            <GripVertical className="h-3 w-3" />
          </Button>
          <BlockMenu onSelect={(type) => onAddBelow(index, type)} />
        </div>
      )}

      {/* Block Content */}
      <div className="py-1 px-4">
        {renderBlock()}
      </div>

      {/* Delete Button - Only show when node is selected */}
      {isNodeSelected && block.type !== 'divider' && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(block.id)}
          className="absolute -right-8 top-0 h-6 w-6 p-0 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};

export default function NotionPageNode({ data, selected }: NodeProps<NotionPageNodeData>) {
  const [localData, setLocalData] = useState<NotionPageNodeData>(data);

  // Sync with external data changes
  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const generateId = () => `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const updateBlock = (id: string, updates: Partial<NotionBlock>) => {
    const newBlocks = localData.blocks.map((block) =>
      block.id === id ? { ...block, ...updates } : block
    );
    setLocalData({ ...localData, blocks: newBlocks });
    
    // Emit change event
    window.dispatchEvent(
      new CustomEvent('notion-page-update', {
        detail: { nodeId: data.id, blocks: newBlocks },
      })
    );
  };

  const deleteBlock = (id: string) => {
    const newBlocks = localData.blocks.filter((block) => block.id !== id);
    setLocalData({ ...localData, blocks: newBlocks });
    
    window.dispatchEvent(
      new CustomEvent('notion-page-update', {
        detail: { nodeId: data.id, blocks: newBlocks },
      })
    );
  };

  const addBlock = (index: number, type: NotionBlockType) => {
    const newBlock: NotionBlock = {
      id: generateId(),
      type,
      content: '',
      checked: type === 'todo' ? false : undefined,
      language: type === 'code' ? 'javascript' : undefined,
      emoji: type === 'callout' ? '💡' : undefined,
      color: type === 'callout' ? 'blue' : undefined,
      isOpen: type === 'toggle' ? false : undefined,
      imageUrl: type === 'image' ? '' : undefined,
      imageBase64: type === 'image' ? '' : undefined,
      tableData: type === 'table' ? [['', '', ''], ['', '', ''], ['', '', '']] : undefined,
    };
    
    const newBlocks = [...localData.blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    setLocalData({ ...localData, blocks: newBlocks });
    
    window.dispatchEvent(
      new CustomEvent('notion-page-update', {
        detail: { nodeId: data.id, blocks: newBlocks },
      })
    );
  };

  const convertBlock = (id: string, newType: NotionBlockType) => {
    const newBlocks = localData.blocks.map((block) => {
      if (block.id === id) {
        return {
          ...block,
          type: newType,
          content: '', // Clear content on type change
          checked: newType === 'todo' ? false : undefined,
          language: newType === 'code' ? 'javascript' : undefined,
          emoji: newType === 'callout' ? '💡' : undefined,
          color: newType === 'callout' ? 'blue' : undefined,
          isOpen: newType === 'toggle' ? false : undefined,
          imageUrl: newType === 'image' ? '' : undefined,
          imageBase64: newType === 'image' ? '' : undefined,
          tableData: newType === 'table' ? [['', '', ''], ['', '', ''], ['', '', '']] : undefined,
        };
      }
      return block;
    });
    setLocalData({ ...localData, blocks: newBlocks });
    
    window.dispatchEvent(
      new CustomEvent('notion-page-update', {
        detail: { nodeId: data.id, blocks: newBlocks },
      })
    );
  };

  const handleKeyDown = (e: KeyboardEvent, blockId: string, index: number) => {
    // Enter key - add new paragraph below
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addBlock(index, 'paragraph');
    }
    
    // Backspace on empty block - delete it
    if (e.key === 'Backspace') {
      const block = localData.blocks[index];
      if (!block.content && localData.blocks.length > 1) {
        e.preventDefault();
        deleteBlock(blockId);
      }
    }
  };

  const updateTitle = (title: string) => {
    setLocalData({ ...localData, title });
    window.dispatchEvent(
      new CustomEvent('notion-page-update', {
        detail: { nodeId: data.id, title },
      })
    );
  };

  const updateIcon = (icon: string) => {
    setLocalData({ ...localData, icon });
    window.dispatchEvent(
      new CustomEvent('notion-page-update', {
        detail: { nodeId: data.id, icon },
      })
    );
  };

  return (
    <Card
      className={cn(
        'min-w-[600px] max-w-[900px] shadow-lg transition-all',
        selected && 'ring-2 ring-primary'
      )}
      style={{ width: localData.width || 600 }}
    >
      <Handle type="target" position={Position.Left} className="!bg-primary" />
      
      {/* Cover Color */}
      {localData.coverColor && (
        <div
          className="h-32 rounded-t-lg"
          style={{ backgroundColor: localData.coverColor }}
        />
      )}
      
      {/* Page Content */}
      <div 
        className="p-8 pl-16 relative gap-2"
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="flex items-center gap-3 mb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-12 w-12 p-0 text-3xl hover:bg-muted"
                onMouseDown={(e) => e.stopPropagation()}
              >
                {localData.icon || '📄'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <div className="grid grid-cols-6 gap-1 p-2">
                {['📄', '📝', '📋', '📊', '💡', '🎯', '🚀', '⭐', '💻', '🎨', '📚', '🔥'].map((emoji) => (
                  <Button
                    key={emoji}
                    variant="ghost"
                    size="sm"
                    onClick={() => updateIcon(emoji)}
                    className="h-8 w-8 p-0 text-xl"
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Title */}
        <Input
          value={localData.title}
          onChange={(e) => updateTitle(e.target.value)}
          placeholder="Untitled"
          className="text-4xl font-bold border-0 shadow-none px-0 mb-4 focus-visible:ring-0"
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        />

        {/* Blocks */}
        <div className="space-y-2">
          {localData.blocks.map((block, index) => (
            <BlockComponent
              key={block.id}
              block={block}
              index={index}
              isLast={index === localData.blocks.length - 1}
              onUpdate={updateBlock}
              onDelete={deleteBlock}
              onAddBelow={addBlock}
              onKeyDown={handleKeyDown}
              allBlocks={localData.blocks}
              onConvertBlock={convertBlock}
              isNodeSelected={selected}
            />
          ))}
        </div>

        {/* Add Block Button */}
        {/* {localData.blocks.length === 0 && (
          <BlockMenu onSelect={(type) => addBlock(-1, type)} />
        )} */}
      </div>

      <Handle type="source" position={Position.Right} className="!bg-primary" />
    </Card>
  );
}


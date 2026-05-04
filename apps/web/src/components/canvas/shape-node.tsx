'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { cn } from '@/lib/utils';
import { ShapeNodeData, SHAPE_COLORS } from '@canvas-llm/shared';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Palette } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ShapeRenderer = ({ 
  shape, 
  width, 
  height, 
  fill, 
  stroke, 
  strokeWidth = 2,
  text 
}: {
  shape: string;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth?: number;
  text?: string;
}) => {
  const renderShape = () => {
    switch (shape) {
      case 'rectangle':
        return (
          <rect
            x={strokeWidth}
            y={strokeWidth}
            width={width - strokeWidth * 2}
            height={height - strokeWidth * 2}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            rx="8"
          />
        );
      case 'circle':
        return (
          <circle
            cx={width / 2}
            cy={height / 2}
            r={(Math.min(width, height) / 2) - strokeWidth}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        );
      case 'triangle':
        return (
          <polygon
            points={`${width / 2},${strokeWidth} ${width - strokeWidth},${height - strokeWidth} ${strokeWidth},${height - strokeWidth}`}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        );
      case 'diamond':
        return (
          <polygon
            points={`${width / 2},${strokeWidth} ${width - strokeWidth},${height / 2} ${width / 2},${height - strokeWidth} ${strokeWidth},${height / 2}`}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        );
      case 'hexagon':
        const hexPoints = Array.from({ length: 6 }, (_, i) => {
          const angle = (Math.PI / 3) * i - Math.PI / 2;
          const x = width / 2 + ((Math.min(width, height) / 2) - strokeWidth * 2) * Math.cos(angle);
          const y = height / 2 + ((Math.min(width, height) / 2) - strokeWidth * 2) * Math.sin(angle);
          return `${x},${y}`;
        }).join(' ');
        return (
          <polygon
            points={hexPoints}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        );
      default:
        return null;
    }
  };

  return (
    <svg width={width} height={height}>
      {renderShape()}
      {text && (
        <text
          x={width / 2}
          y={height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-sm font-medium"
          fill={stroke}
        >
          {text}
        </text>
      )}
    </svg>
  );
};

export default function ShapeNode({ id, data, selected }: NodeProps<ShapeNodeData>) {
  const [text, setText] = useState(data.text || '');
  const [isEditingText, setIsEditingText] = useState(false);

  // Update local state when data changes externally (from collaboration)
  useEffect(() => {
    if (!isEditingText && data.text !== text) {
      setText(data.text || '');
    }
  }, [data.text, isEditingText, text]);

  const handleTextChange = useCallback((value: string) => {
    setText(value);
    data.text = value;
  }, [data]);

  const handleColorChange = useCallback((color: string) => {
    data.fill = color + '40'; // Add transparency
    data.stroke = color;
    Object.assign(data, { ...data });
  }, [data]);

  return (
    <div
      className={cn(
        'relative group',
        selected && 'ring-2 ring-primary ring-offset-2 rounded-lg'
      )}
      style={{
        width: data.width,
        height: data.height,
      }}
    >
      {/* Color Picker */}
      <div className="absolute -top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="secondary" className="h-6 w-6">
              <Palette className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {Object.entries(SHAPE_COLORS).map(([colorName, colorValue]) => (
              <DropdownMenuItem
                key={colorName}
                onClick={() => handleColorChange(colorValue)}
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

      <ShapeRenderer
        shape={data.shape}
        width={data.width}
        height={data.height}
        fill={data.fill}
        stroke={data.stroke}
        strokeWidth={data.strokeWidth}
        text={text}
      />

      {/* Text Input Overlay */}
      {isEditingText && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Input
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            onBlur={() => setIsEditingText(false)}
            className="w-2/3 text-center bg-white/90"
            autoFocus
          />
        </div>
      )}

      {/* Double-click to edit text */}
      <div
        className="absolute inset-0"
        onDoubleClick={() => setIsEditingText(true)}
      />

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
      <Handle
        type="target"
        position={Position.Left}
        className="w-2 h-2 !bg-primary border-2 border-white"
        style={{ opacity: selected ? 1 : 0 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-2 h-2 !bg-primary border-2 border-white"
        style={{ opacity: selected ? 1 : 0 }}
      />
    </div>
  );
}


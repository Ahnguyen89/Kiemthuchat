'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { CodeBlockData } from '@canvas-llm/shared';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'java',
  'cpp',
  'csharp',
  'go',
  'rust',
  'php',
  'ruby',
  'swift',
  'kotlin',
  'html',
  'css',
  'sql',
  'bash',
  'json',
  'yaml',
  'markdown',
];

export default function CodeBlockNode({ id, data, selected }: NodeProps<CodeBlockData>) {
  const [code, setCode] = useState(data.code || '');
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(!data.code);

  // Update local state when data changes externally (from collaboration)
  useEffect(() => {
    if (!isEditing && data.code !== code) {
      setCode(data.code || '');
    }
  }, [data.code, isEditing, code]);

  const handleBlur = useCallback(() => {
    data.code = code;
    setIsEditing(false);
  }, [code, data]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const handleLanguageChange = useCallback((value: string) => {
    data.language = value;
    Object.assign(data, { ...data });
  }, [data]);

  return (
    <Card
      className={cn(
        'min-w-[400px] max-w-[600px] font-mono transition-all duration-200',
        selected && 'ring-2 ring-primary ring-offset-2'
      )}
    >
      <CardHeader className="pb-2 px-4 py-2 bg-muted/50 flex flex-row items-center justify-between">
        <Select value={data.language} onValueChange={handleLanguageChange}>
          <SelectTrigger className="h-7 w-32 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((lang) => (
              <SelectItem key={lang} value={lang}>
                {lang}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleCopy}
          className="h-6 w-6"
        >
          {copied ? (
            <Check className="h-3 w-3 text-green-600" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {isEditing ? (
          <Textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onBlur={handleBlur}
            placeholder={`Enter ${data.language} code...`}
            className="min-h-[200px] resize-none border-none rounded-none font-mono text-sm leading-relaxed focus-visible:ring-0 focus-visible:ring-offset-0 p-4"
            autoFocus
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
            }}
          />
        ) : (
          <pre
            onClick={() => setIsEditing(true)}
            className="min-h-[200px] p-4 overflow-x-auto text-sm leading-relaxed cursor-text"
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
            }}
          >
            <code>{code || 'Click to edit...'}</code>
          </pre>
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


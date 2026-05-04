"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCanvas } from '@/hooks/use-canvas';
import { CANVAS_TEMPLATES } from '@/lib/templates';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  FileText, 
  MoreVertical, 
  Trash2, 
  Copy, 
  Edit, 
  Loader2,
  Sparkles 
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FlowPreview } from '@/components/canvas/flow-preview';
import AITemplateDialog from '@/components/canvas/ai-template-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { apiClient } from '@/lib/api';

export default function CanvasListPage() {
  const router = useRouter();
  const { 
    flows, 
    isLoadingFlows, 
    createCanvas, 
    isCreatingFlow,
    deleteFlow,
    duplicateFlow,
    renameFlow 
  } = useCanvas();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCanvasName, setNewCanvasName] = useState('');
  const [newCanvasDescription, setNewCanvasDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('blank');
  const [showAITemplateDialog, setShowAITemplateDialog] = useState(false);
  const [aiGeneratedTemplate, setAiGeneratedTemplate] = useState<{ nodes: any[]; edges: any[] } | null>(null);

  const handleCreateCanvas = async () => {
    if (!newCanvasName.trim()) return;

    const template = CANVAS_TEMPLATES.find((t) => t.id === selectedTemplate);
    const newFlow = await createCanvas(newCanvasName, newCanvasDescription);
    
    // Use AI-generated template if available, otherwise use selected template
    const templateToUse = aiGeneratedTemplate || template;
    
    if (newFlow && templateToUse && (templateToUse.nodes?.length > 0 || aiGeneratedTemplate)) {
      // If template has nodes, add them to the flow
      await apiClient.updateFlow(newFlow.id, {
        nodes: templateToUse.nodes,
        edges: templateToUse.edges,
      });
    }

    setIsCreateDialogOpen(false);
    setNewCanvasName('');
    setNewCanvasDescription('');
    setSelectedTemplate('blank');
    setAiGeneratedTemplate(null);
    
    if (newFlow) {
      router.push(`/dashboard/canvas/${newFlow.id}`);
    }
  };

  const handleAITemplateGenerated = (template: { nodes: any[]; edges: any[] }) => {
    setAiGeneratedTemplate(template);
    setSelectedTemplate('ai-generated');
    setIsCreateDialogOpen(true);
  };

  const handleDeleteFlow = async (flowId: string) => {
    if (confirm('Are you sure you want to delete this canvas?')) {
      await deleteFlow(flowId);
    }
  };

  const handleDuplicateFlow = async (flow: any) => {
    const newFlow = await duplicateFlow(flow);
    if (newFlow) {
      router.push(`/dashboard/canvas/${newFlow.id}`);
    }
  };

  if (isLoadingFlows) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Canvas Workspace</h1>
            <p className="text-muted-foreground">Create, edit, and organize your canvases</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 hover:from-purple-500/20 hover:to-blue-500/20 border-purple-200 dark:border-purple-800"
              onClick={() => setShowAITemplateDialog(true)}
            >
              <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              AI Generate
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
              setIsCreateDialogOpen(open);
              if (!open) {
                setAiGeneratedTemplate(null);
              }
            }}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New Canvas
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Canvas</DialogTitle>
                <DialogDescription>
                  Choose a template or start with a blank canvas
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Canvas Name</Label>
                  <Input
                    id="name"
                    placeholder="My Canvas"
                    value={newCanvasName}
                    onChange={(e) => setNewCanvasName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Input
                    id="description"
                    placeholder="What's this canvas about?"
                    value={newCanvasDescription}
                    onChange={(e) => setNewCanvasDescription(e.target.value)}
                  />
                </div>

                {/* Templates */}
                <div className="space-y-2">
                  <Label>Choose Template</Label>
                  <div className="grid grid-cols-3 gap-3 max-h-[300px] overflow-y-auto">
                    {/* AI Generated Template */}
                    {aiGeneratedTemplate && (
                      <Card
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedTemplate === 'ai-generated'
                            ? 'ring-2 ring-purple-500'
                            : ''
                        } border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-500/10 to-blue-500/10`}
                        onClick={() => setSelectedTemplate('ai-generated')}
                      >
                        <CardHeader className="p-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            AI Generated
                          </CardTitle>
                          <CardDescription className="text-xs">
                            Your custom AI-generated canvas ({aiGeneratedTemplate.nodes.length} nodes)
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    )}
                    
                    {/* Regular Templates */}
                    {CANVAS_TEMPLATES.map((template) => (
                      <Card
                        key={template.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedTemplate === template.id
                            ? 'ring-2 ring-primary'
                            : ''
                        }`}
                        onClick={() => setSelectedTemplate(template.id)}
                      >
                        <CardHeader className="p-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            {template.id === 'blank' ? (
                              <FileText className="h-4 w-4" />
                            ) : (
                              <Sparkles className="h-4 w-4 text-primary" />
                            )}
                            {template.name}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {template.description}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleCreateCanvas}
                  disabled={isCreatingFlow || !newCanvasName.trim()}
                >
                  {isCreatingFlow ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Canvas'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </div>
        </div>
      </div>

      {/* AI Template Dialog */}
      <AITemplateDialog
        open={showAITemplateDialog}
        onOpenChange={setShowAITemplateDialog}
        onTemplateGenerated={handleAITemplateGenerated}
      />

      {/* Canvas List */}
      <div className="flex-1 p-6 overflow-y-auto">
        {!flows || flows.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <FileText className="h-16 w-16 text-muted-foreground/40 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No canvases yet</h2>
            <p className="text-muted-foreground mb-6">
              Create your first canvas to get started
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Canvas
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {flows.map((flow) => (
              <Card
                key={flow.id}
                className="hover:shadow-lg transition-shadow cursor-pointer group"
              >
                <div onClick={() => router.push(`/dashboard/canvas/${flow.id}`)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-1">
                          {flow.name}
                        </CardTitle>
                        {flow.description && (
                          <CardDescription className="line-clamp-2 mt-1">
                            {flow.description}
                          </CardDescription>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateFlow(flow);
                          }}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFlow(flow.id);
                            }}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <FlowPreview flow={flow} className="mb-3" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{flow.nodes?.length || 0} nodes</span>
                      <span>{format(new Date(flow.updatedAt), 'MMM d, yyyy')}</span>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


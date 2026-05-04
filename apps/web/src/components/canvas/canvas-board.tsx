"use client"

import React, { useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  Connection,
  Edge,
  Node,
  ReactFlowInstance,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Save, FileText, Users, Share2, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ShareDialog from './share-dialog';

import TextNode from './text-node';
import StickyNoteNode from './sticky-note-node';
import ShapeNode from './shape-node';
import HeadingNode from './heading-node';
import TaskListNode from './task-list-node';
import CodeBlockNode from './code-block-node';
import ImageNode from './image-node';
import NotionPageNode from './notion-page-node';
import CanvasToolbar from './canvas-toolbar';
import AIAssistantPanel from './ai-assistant-panel';
import AICanvasDialog from './ai-canvas-dialog';
import CanvasCursors from './canvas-cursors';
import CanvasUsersList from './canvas-users-list';
import { 
  Flow, 
  TextNodeData, 
  StickyNoteData, 
  ShapeNodeData,
  HeadingNodeData,
  TaskListNodeData,
  CodeBlockData,
  ImageNodeData,
  NotionPageNodeData,
  NotionBlock,
  STICKY_NOTE_COLORS,
  SHAPE_COLORS
} from '@canvas-llm/shared';
import { useToast } from '../ui/use-toast';
import { apiClient } from '@/lib/api';
import { getCanvasSuggestions } from '@/lib/ai-suggestions';
import { useCanvasCollaboration } from '@/contexts/canvas-collaboration-context';
import { useAuth } from '@/hooks/use-auth';

const nodeTypes: NodeTypes = {
  textNode: TextNode,
  stickyNote: StickyNoteNode,
  shape: ShapeNode,
  heading: HeadingNode,
  taskList: TaskListNode,
  codeBlock: CodeBlockNode,
  image: ImageNode,
  notionPage: NotionPageNode,
};

interface CanvasBoardProps {
  currentFlow?: Flow;
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onSave?: (nodes: Node[], edges: Edge[]) => Promise<void>;
  className?: string;
  readOnly?: boolean;
  isSharedCanvas?: boolean;
}

// Generate a collision-resistant id for nodes and data
const generateUniqueId = (prefix: string) => {
  try {
    // Prefer crypto.randomUUID when available in modern browsers
    const uuid = (window as any)?.crypto?.randomUUID?.();
    if (uuid) return `${prefix}_${uuid}`;
  } catch (_) {
    // window may be undefined during SSR hydration; fall through to fallback
  }
  // Fallback: timestamp + random segment
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now()}_${rand}`;
};

export default function CanvasBoard({
  currentFlow,
  initialNodes = [],
  initialEdges = [],
  onSave,
  className,
  readOnly = false,
  isSharedCanvas = false,
}: CanvasBoardProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const nodesRef = useRef<Node[]>(nodes);
  const edgesRef = useRef<Edge[]>(edges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [showAIDialog, setShowAIDialog] = useState(false);
  
  // Share dialog
  const [showShareDialog, setShowShareDialog] = useState(false);
  
  // Flag to prevent emitting changes when receiving remote updates
  const isRemoteUpdate = useRef(false);
  const emitTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Collaboration
  const { 
    users, 
    isConnected: isCollaborationConnected,
    joinCanvas,
    leaveCanvas,
    emitCursorMove,
    emitNodesChanged,
    socket
  } = useCanvasCollaboration();

  // Auto-join canvas collaboration (always enabled now)
  useEffect(() => {
    if (!currentFlow?.id || !user?.id) return;
    
    joinCanvas(currentFlow.id);
    
    // Cleanup on unmount
    return () => {
      leaveCanvas();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFlow?.id, user?.id]);

  // Listen for remote canvas updates - FIXED to prevent infinite loop and duplicates
  useEffect(() => {
    if (!socket) return;

    const handleRemoteSync = ({ nodes: remoteNodes, edges: remoteEdges, userId }: any) => {
      if (userId !== user?.id) {
        // Set flag to prevent emitting changes back
        isRemoteUpdate.current = true;
        
        // Ensure unique node IDs to prevent duplicates
        const uniqueNodes = Array.isArray(remoteNodes) ? remoteNodes.filter((node, index, self) =>
          index === self.findIndex((n) => n.id === node.id)
        ) : [];
        
        const uniqueEdges = Array.isArray(remoteEdges) ? remoteEdges.filter((edge, index, self) =>
          index === self.findIndex((e) => e.id === edge.id)
        ) : [];
        
        setNodes(uniqueNodes);
        setEdges(uniqueEdges);
        
        // Reset flag after state updates are done
        setTimeout(() => {
          isRemoteUpdate.current = false;
        }, 300);
      }
    };

    socket.on('canvas:sync', handleRemoteSync);

    return () => {
      socket.off('canvas:sync', handleRemoteSync);
    };
    // Only depend on socket and user.id, not setNodes/setEdges which change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, user?.id]);

  // Update nodes and edges when initialNodes/initialEdges change
  // Only update if the IDs actually changed, not on every render
  useEffect(() => {
    // Ensure unique IDs in initial nodes/edges
    const uniqueInitialNodes = Array.isArray(initialNodes) ? initialNodes.filter((node, index, self) =>
      index === self.findIndex((n) => n.id === node.id)
    ) : [];
    
    const uniqueInitialEdges = Array.isArray(initialEdges) ? initialEdges.filter((edge, index, self) =>
      index === self.findIndex((e) => e.id === edge.id)
    ) : [];
    
    if (uniqueInitialNodes.length > 0 && nodesRef.current.length === 0) {
      setNodes(uniqueInitialNodes);
    }
    if (uniqueInitialEdges.length > 0 && edgesRef.current.length === 0) {
      setEdges(uniqueInitialEdges);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFlow?.id]);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  // Update AI suggestions when nodes or edges change - DEBOUNCED
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (nodes.length > 0) {
        const suggestions = getCanvasSuggestions(nodes, edges);
        setAiSuggestions(suggestions);
        if (suggestions.length > 0 && !showAIAssistant) {
          // Auto-show AI assistant if there are suggestions
          setTimeout(() => setShowAIAssistant(true), 2000);
        }
      }
    }, 500); // Debounce AI suggestions

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes.length, edges.length]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowInstance) return;

      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node<TextNodeData> = {
        id: generateUniqueId('text'),
        type: 'textNode',
        position,
        data: {
          id: generateUniqueId('data'),
          text: '',
          isEditing: true,
          role: 'user',
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  // Handle NotionPage updates
  useEffect(() => {
    function handleNotionPageUpdate(e: Event) {
      const detail = (e as CustomEvent).detail as {
        nodeId: string;
        blocks?: NotionBlock[];
        title?: string;
        icon?: string;
      };
      if (!detail) return;

      setNodes((nds) =>
        nds.map((node) => {
          if (node.data.id === detail.nodeId && node.type === 'notionPage') {
            return {
              ...node,
              data: {
                ...(node.data as NotionPageNodeData),
                ...(detail.blocks && { blocks: detail.blocks }),
                ...(detail.title !== undefined && { title: detail.title }),
                ...(detail.icon !== undefined && { icon: detail.icon }),
              },
            };
          }
          return node;
        })
      );
    }

    window.addEventListener('notion-page-update', handleNotionPageUpdate as EventListener);
    return () => window.removeEventListener('notion-page-update', handleNotionPageUpdate as EventListener);
  }, [setNodes]);

  // Handle generic node data updates (for heading, etc.)
  useEffect(() => {
    function handleNodeDataChange(e: Event) {
      const detail = (e as CustomEvent).detail as {
        nodeId: string;
        updates: Record<string, any>;
      };
      if (!detail) return;

      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === detail.nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                ...detail.updates,
              },
            };
          }
          return node;
        })
      );
    }

    window.addEventListener('node-data-change', handleNodeDataChange as EventListener);
    return () => window.removeEventListener('node-data-change', handleNodeDataChange as EventListener);
  }, [setNodes]);

  // Handle Ask LLM event from TextNode
  useEffect(() => {
    async function handleAskLlm(e: Event) {
      const detail = (e as CustomEvent).detail as {
        nodeId: string;
        text: string;
        model?: string;
        provider?: string;
      };
      if (!detail) return;

      const { nodeId, text, model, provider } = detail;
      const sourceNode = nodes.find((n) => n.id === nodeId) as Node<TextNodeData> | undefined;
      if (!sourceNode) return;

      // Create assistant node near the source
      const assistantNodeId = generateUniqueId('text');
      const assistantDataId = generateUniqueId('data');
      const assistantNode: Node<TextNodeData> = {
        id: assistantNodeId,
        type: 'textNode',
        position: {
          x: (sourceNode.position?.x ?? 0) + 320,
          y: sourceNode.position?.y ?? 0,
        },
        data: {
          id: assistantDataId,
          text: '',
          isEditing: false,
          role: 'assistant',
          provider,
          model,
        },
      };

      setNodes((prev) => {
        const exists = prev.some((n) => n.id === assistantNodeId);
        if (exists) return prev;
        return prev.concat(assistantNode);
      });
      const newEdge: Edge = {
        id: `${nodeId}->${assistantNodeId}`,
        source: nodeId,
        target: assistantNodeId,
      };
      setEdges((prev) => {
        const exists = prev.some((e) => e.id === newEdge.id);
        if (exists) return prev;
        return prev.concat(newEdge);
      });
      if (!provider) return;

      // Stream from API
      let succeeded = false;
      try {
        setIsGenerating(assistantNodeId);
        let accumulated = '';
        // Build simple chat history from nodes above the source node by Y position
        const prior = nodesRef.current
          .filter((n) => (n.position?.y ?? 0) <= (sourceNode.position?.y ?? 0))
          .sort((a, b) => (a.position?.y ?? 0) - (b.position?.y ?? 0)) as Node<TextNodeData>[];
        const history = prior
          .filter((n) => (n.data as TextNodeData)?.text)
          .map((n) => ({
            role: (n.data as TextNodeData).role || 'user',
            content: (n.data as TextNodeData).text,
          }));

        await apiClient.streamText(
          provider,
          text,
          model,
          (token) => {
            accumulated += token;
            setNodes((prev) =>
              prev.map((n) =>
                n.id === assistantNodeId
                  ? { ...n, data: { ...(n.data as TextNodeData), text: accumulated } }
                  : n
              )
            );
          },
          history
        );
        succeeded = true;
      } catch (err) {
        toast({ title: 'LLM error', description: 'Failed to request LLM' });
      } finally {
        setIsGenerating(null);
        if (succeeded) {
          // Add a new user node below the assistant to continue the conversation
          const assistantNode = nodesRef.current.find((n) => n.id === assistantNodeId);
          const newUserNodeId = generateUniqueId('text');
          const newUserDataId = generateUniqueId('data');
          const newUserNode: Node<TextNodeData> = {
            id: newUserNodeId,
            type: 'textNode',
            position: {
              x: assistantNode?.position?.x ?? 0,
              y: (assistantNode?.position?.y ?? 0) + 200,
            },
            data: { id: newUserDataId, text: '', isEditing: true, role: 'user' },
          };
          setNodes((prev) => {
            const exists = prev.some((n) => n.id === newUserNodeId);
            if (exists) return prev;
            return prev.concat(newUserNode);
          });
          setEdges((prev) => {
            const newEdgeId = `${assistantNodeId}->${newUserNodeId}`;
            const exists = prev.some((e) => e.id === newEdgeId);
            if (exists) return prev;
            return prev.concat({
              id: newEdgeId,
              source: assistantNodeId,
              target: newUserNodeId,
            });
          });
        }
      }
    }

    window.addEventListener('canvas:ask-llm', handleAskLlm as EventListener);
    return () => window.removeEventListener('canvas:ask-llm', handleAskLlm as EventListener);
  }, [nodes, setNodes, setEdges, toast, onSave]);

  const addNode = useCallback((type: string) => {
    const basePosition = {
      x: Math.random() * 400 + 100,
      y: Math.random() * 400 + 100,
    };

    let newNode: Node;
    
    // Ensure truly unique IDs
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const uniqueId = `${type}_${timestamp}_${random}`;

    switch (type) {
      case 'textNode':
        newNode = {
          id: uniqueId,
          type: 'textNode',
          position: basePosition,
          data: {
            id: `data_${uniqueId}`,
            text: '',
            isEditing: true,
            role: 'user',
          } as TextNodeData,
        };
        break;

      case 'stickyNote':
        newNode = {
          id: uniqueId,
          type: 'stickyNote',
          position: basePosition,
          data: {
            id: `data_${uniqueId}`,
            text: '',
            color: 'yellow',
            fontSize: 'medium',
          } as StickyNoteData,
        };
        break;

      case 'heading':
        newNode = {
          id: uniqueId,
          type: 'heading',
          position: basePosition,
          data: {
            id: `data_${uniqueId}`,
            text: '',
            level: 1,
          } as HeadingNodeData,
        };
        break;

      case 'taskList':
        newNode = {
          id: uniqueId,
          type: 'taskList',
          position: basePosition,
          data: {
            id: `data_${uniqueId}`,
            title: 'Task List',
            tasks: [],
          } as TaskListNodeData,
        };
        break;

      case 'codeBlock':
        newNode = {
          id: uniqueId,
          type: 'codeBlock',
          position: basePosition,
          data: {
            id: `data_${uniqueId}`,
            code: '',
            language: 'javascript',
            theme: 'light',
            showLineNumbers: true,
          } as CodeBlockData,
        };
        break;

      case 'image':
        newNode = {
          id: uniqueId,
          type: 'image',
          position: basePosition,
          data: {
            id: `data_${uniqueId}`,
            url: '',
            alt: 'Image',
          } as ImageNodeData,
        };
        break;

      case 'shape-rectangle':
      case 'shape-circle':
      case 'shape-triangle':
        const shapeType = type.split('-')[1] as 'rectangle' | 'circle' | 'triangle';
        newNode = {
          id: uniqueId,
          type: 'shape',
          position: basePosition,
          data: {
            id: `data_${uniqueId}`,
            shape: shapeType,
            text: '',
            fill: SHAPE_COLORS.blue + '40',
            stroke: SHAPE_COLORS.blue,
            strokeWidth: 2,
            width: 150,
            height: 150,
          } as ShapeNodeData,
        };
        break;

      case 'notionPage':
        newNode = {
          id: uniqueId,
          type: 'notionPage',
          position: basePosition,
          data: {
            id: `data_${uniqueId}`,
            title: 'Untitled',
            icon: '📄',
            blocks: [
              {
                id: `block_${uniqueId}_1`,
                type: 'paragraph',
                content: '',
              }
            ],
            width: 600,
          } as NotionPageNodeData,
        };
        break;

      default:
        return;
    }

    // Check if node with this ID already exists before adding
    setNodes((nds) => {
      const exists = nds.some((n) => n.id === newNode.id);
      if (exists) {
        console.warn('Node with this ID already exists, skipping');
        return nds;
      }
      return nds.concat(newNode);
    });
  }, [setNodes]);

  const handleSave = useCallback(async () => {
    if (!onSave) {
      toast({
        title: 'Save function not provided',
        description: 'Save function not provided',
      });
      return;
    }

    setIsSaving(true);
    try {
      await onSave(nodes, edges);
      toast({
        title: 'Canvas Saved',
        description: 'Your canvas has been saved successfully.',
      });
    } catch (error) {
      console.error('Failed to save canvas:', error);
      toast({
        title: 'Failed to save canvas',
        description: 'Failed to save canvas',
      });
    } finally {
      setIsSaving(false);
    }
  }, [onSave, toast, nodes, edges]);

  const handleAISummarize = useCallback(async () => {
    if (!currentFlow?.id) {
      throw new Error('No canvas selected');
    }
    const response = await apiClient.summarizeCanvas(currentFlow.id);
    if (response.success && response.data) {
      return response.data.summary;
    }
    throw new Error('Failed to summarize canvas');
  }, [currentFlow]);

  const handleAIQuestion = useCallback(async (question: string) => {
    if (!currentFlow?.id) {
      throw new Error('No canvas selected');
    }
    const response = await apiClient.askCanvasQuestion(currentFlow.id, question);
    if (response.success && response.data) {
      return response.data.answer;
    }
    throw new Error('Failed to get answer');
  }, [currentFlow]);

  return (
    <div className={`w-full h-full flex flex-col ${className}`}>
      {/* Header */}
      <Card className="mb-2 flex flex-row items-start justify-between p-3 gap-2">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-lg font-semibold">{currentFlow?.name}</h2>
            {currentFlow?.description && (
              <p className="text-sm text-muted-foreground">{currentFlow.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Online Users Indicator - Only show when there are other users */}
          {isCollaborationConnected && user && users.filter(u => u.userId !== user.id).length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <Users className="h-3 w-3 text-green-700 dark:text-green-400" />
              <span className="text-xs font-medium text-green-700 dark:text-green-400">
                {users.filter(u => u.userId !== user.id).length} online
              </span>
            </div>
          )}

          {!readOnly && (
            <>
              <Button
                onClick={() => setShowShareDialog(true)}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                size="sm"
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </>
          )}

          {readOnly && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              View Only
            </Badge>
          )}
        </div>
      </Card>

      {/* Canvas */}
      <div className="flex-1 border rounded-lg overflow-hidden bg-background relative">
        {/* Read-Only Overlay Hint */}
        {readOnly && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
            <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 shadow-lg">
              <Eye className="h-4 w-4" />
              <span>View-Only Mode - No editing allowed</span>
            </Badge>
          </div>
        )}
        
        <ReactFlowProvider>
          <div 
            className="w-full h-full" 
            ref={reactFlowWrapper}
            onMouseMove={(e) => {
              // Track cursor position for collaboration (auto-enabled)
              if (isCollaborationConnected && reactFlowWrapper.current) {
                const rect = reactFlowWrapper.current.getBoundingClientRect();
                emitCursorMove(e.clientX - rect.left, e.clientY - rect.top);
              }
            }}
          >
            <ReactFlow
              nodes={nodes.filter((node, index, self) => 
                index === self.findIndex((n) => n.id === node.id)
              )}
              edges={edges.filter((edge, index, self) =>
                index === self.findIndex((e) => e.id === edge.id)
              )}
              onNodesChange={(changes) => {
                // Don't allow changes in read-only mode
                if (readOnly) return;
                
                onNodesChange(changes);
                // Auto-broadcast changes (collaboration always enabled)
                if (isCollaborationConnected && !isRemoteUpdate.current) {
                  // Clear existing timeout
                  if (emitTimeoutRef.current) {
                    clearTimeout(emitTimeoutRef.current);
                  }
                  // Debounce to avoid too many updates
                  emitTimeoutRef.current = setTimeout(() => {
                    emitNodesChanged(nodesRef.current, edgesRef.current);
                  }, 200);
                }
              }}
              onEdgesChange={(changes) => {
                // Don't allow changes in read-only mode
                if (readOnly) return;
                
                onEdgesChange(changes);
                // Auto-broadcast changes (collaboration always enabled)
                if (isCollaborationConnected && !isRemoteUpdate.current) {
                  // Clear existing timeout
                  if (emitTimeoutRef.current) {
                    clearTimeout(emitTimeoutRef.current);
                  }
                  // Debounce to avoid too many updates
                  emitTimeoutRef.current = setTimeout(() => {
                    emitNodesChanged(nodesRef.current, edgesRef.current);
                  }, 200);
                }
              }}
              onConnect={readOnly ? undefined : onConnect}
              onInit={setReactFlowInstance}
              onDrop={readOnly ? undefined : onDrop}
              onDragOver={readOnly ? undefined : onDragOver}
              nodeTypes={nodeTypes}
              fitView
              attributionPosition="bottom-left"
              nodesDraggable={!readOnly}
              nodesConnectable={!readOnly}
              elementsSelectable={true}
            >
              <Controls />
              <MiniMap
                nodeStrokeColor="#374151"
                nodeColor="#f3f4f6"
                nodeBorderRadius={8}
                className="bg-background border"
              />
              <Background
                variant={BackgroundVariant.Dots}
                gap={20}
                size={1}
                className="opacity-50"
              />
            </ReactFlow>
          </div>
        </ReactFlowProvider>
      </div>
      {/* Toolbar - Only show if not read-only */}
      {!readOnly && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 shadow-xl border-2 border-primary/20 z-50">
          <CanvasToolbar onAddNode={addNode} onAIClick={() => setShowAIDialog(true)} />
        </div>
      )}

      {/* Online Users List - Always show if connected */}
      {isCollaborationConnected && user && (
        <CanvasUsersList users={users} currentUserId={user.id} />
      )}

      {/* Collaboration Cursors - Always show if connected */}
      {isCollaborationConnected && <CanvasCursors users={users} />}

      {/* Share Dialog */}
      {currentFlow && (
        <ShareDialog
          open={showShareDialog}
          onOpenChange={setShowShareDialog}
          flowId={currentFlow.id}
          flowName={currentFlow.name}
          isPublic={currentFlow.isPublic || false}
          shareToken={currentFlow.shareToken || undefined}
          sharePermission={currentFlow.sharePermission}
          onShareUpdate={() => {
            // Refresh flow data after share settings change
            if (onSave) {
              onSave(nodes, edges);
            }
          }}
        />
      )}

      {/* AI Assistant Panel */}
      {showAIAssistant && aiSuggestions.length > 0 && (
        <AIAssistantPanel
          suggestions={aiSuggestions}
          onClose={() => setShowAIAssistant(false)}
        />
      )}

      {/* AI Canvas Q&A Dialog */}
      <AICanvasDialog
        open={showAIDialog}
        onOpenChange={setShowAIDialog}
        onSummarize={handleAISummarize}
        onAskQuestion={handleAIQuestion}
        canvasName={currentFlow?.name}
      />
    </div>
  );
}

// Wrapper component to handle ReactFlow provider
export function CanvasBoardWrapper(props: CanvasBoardProps) {
  return (
    <ReactFlowProvider>
      <CanvasBoard {...props} />
    </ReactFlowProvider>
  );
}

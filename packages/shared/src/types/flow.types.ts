import { Node, Edge } from 'reactflow';

// Base node data
export interface BaseNodeData {
  id: string;
}

// Text Node
export interface TextNodeData extends BaseNodeData {
  text: string;
  isEditing?: boolean;
  // role indicates who authored the message in a conversation canvas
  // when omitted, nodes behave as generic text nodes for backward compatibility
  role?: 'user' | 'assistant';
  // model and provider information for assistant nodes
  model?: string;
  provider?: string;
}

export interface TextNode extends Node {
  type: 'textNode';
  data: TextNodeData;
}

// Sticky Note Node (AFFiNE-style)
export interface StickyNoteData extends BaseNodeData {
  text: string;
  color: string; // yellow, pink, blue, green, purple
  fontSize?: 'small' | 'medium' | 'large';
}

export interface StickyNoteNode extends Node {
  type: 'stickyNote';
  data: StickyNoteData;
}

// Shape Node
export interface ShapeNodeData extends BaseNodeData {
  shape: 'rectangle' | 'circle' | 'triangle' | 'diamond' | 'pentagon' | 'hexagon';
  text?: string;
  fill: string;
  stroke: string;
  strokeWidth?: number;
  width: number;
  height: number;
}

export interface ShapeNode extends Node {
  type: 'shape';
  data: ShapeNodeData;
}

// Image Node
export interface ImageNodeData extends BaseNodeData {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  caption?: string;
}

export interface ImageNode extends Node {
  type: 'image';
  data: ImageNodeData;
}

// Code Block Node
export interface CodeBlockData extends BaseNodeData {
  code: string;
  language: string;
  theme?: 'light' | 'dark';
  showLineNumbers?: boolean;
}

export interface CodeBlockNode extends Node {
  type: 'codeBlock';
  data: CodeBlockData;
}

// Heading Node
export interface HeadingNodeData extends BaseNodeData {
  text: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface HeadingNode extends Node {
  type: 'heading';
  data: HeadingNodeData;
}

// Task List Node
export interface TaskItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface TaskListNodeData extends BaseNodeData {
  title?: string;
  tasks: TaskItem[];
}

export interface TaskListNode extends Node {
  type: 'taskList';
  data: TaskListNodeData;
}

// Notion Page Node - A versatile document-like node
export type NotionBlockType = 
  | 'paragraph' 
  | 'heading1' 
  | 'heading2' 
  | 'heading3' 
  | 'bulletList' 
  | 'numberedList' 
  | 'todo' 
  | 'code' 
  | 'quote' 
  | 'divider'
  | 'callout'
  | 'toggle'
  | 'table'
  | 'image';

export interface NotionBlock {
  id: string;
  type: NotionBlockType;
  content: string;
  checked?: boolean; // For todo blocks
  language?: string; // For code blocks
  emoji?: string; // For callout blocks
  color?: string; // For callout blocks
  isOpen?: boolean; // For toggle blocks
  imageUrl?: string; // For image blocks
  imageBase64?: string; // For base64 encoded images
  tableData?: string[][]; // For table blocks - 2D array of cell values
}

export interface NotionPageNodeData extends BaseNodeData {
  title: string;
  icon?: string; // Emoji icon
  blocks: NotionBlock[];
  width?: number; // Custom width
  coverColor?: string;
}

export interface NotionPageNode extends Node {
  type: 'notionPage';
  data: NotionPageNodeData;
}

// Union type for all node types
export type FlowNode = 
  | TextNode 
  | StickyNoteNode 
  | ShapeNode 
  | ImageNode 
  | CodeBlockNode
  | HeadingNode
  | TaskListNode
  | NotionPageNode;

// Flow interface
export interface Flow {
  id: string;
  userId: string;
  name: string;
  description?: string;
  nodes: FlowNode[];
  edges: Edge[];
  createdAt: Date;
  updatedAt: Date;
  thumbnail?: string;
  tags?: string[];
  template?: boolean;
  isPublic?: boolean;
  shareToken?: string | null;
  sharePermission?: 'VIEW' | 'EDIT';
}

export interface CreateFlowRequest {
  name: string;
  description?: string;
  template?: boolean;
  tags?: string[];
}

export interface UpdateFlowRequest {
  id: string;
  name?: string;
  description?: string;
  nodes?: FlowNode[];
  edges?: Edge[];
  tags?: string[];
}

export interface FlowExecutionResult {
  nodeId: string;
  success: boolean;
  response?: string;
  error?: string;
  tokenUsage?: {
    input: number;
    output: number;
    total: number;
  };
}

// Template interface
export interface CanvasTemplate {
  id: string;
  name: string;
  description: string;
  category: 'planning' | 'brainstorming' | 'design' | 'documentation' | 'education';
  thumbnail?: string;
  nodes: FlowNode[];
  edges: Edge[];
  tags: string[];
}

// Color presets for sticky notes and shapes
export const STICKY_NOTE_COLORS = {
  yellow: '#FEF3C7',
  pink: '#FCE7F3',
  blue: '#DBEAFE',
  green: '#D1FAE5',
  purple: '#E9D5FF',
  orange: '#FED7AA',
  gray: '#E5E7EB',
} as const;

export const SHAPE_COLORS = {
  blue: '#3B82F6',
  green: '#10B981',
  red: '#EF4444',
  yellow: '#F59E0B',
  purple: '#8B5CF6',
  pink: '#EC4899',
  gray: '#6B7280',
} as const;

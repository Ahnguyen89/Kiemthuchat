import { CanvasTemplate, STICKY_NOTE_COLORS, SHAPE_COLORS } from '@canvas-llm/shared';

/**
 * Canvas Templates
 * 
 * NOTE: These are fallback templates for basic use cases.
 * For best results, use the AI Template Generator which can create
 * custom templates based on natural language descriptions.
 * 
 * AI Generator advantages:
 * - Creates contextually relevant content
 * - Perfect positioning and layout
 * - Supports all node types dynamically
 * - Generates realistic, useful content
 * 
 * See: AITemplateDialog component
 */
export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  {
    id: 'blank',
    name: 'Blank Canvas',
    description: 'Start with a clean slate',
    category: 'planning',
    tags: ['blank', 'empty'],
    nodes: [],
    edges: [],
  },
  {
    id: 'brainstorm',
    name: 'Brainstorming',
    description: 'Organize your ideas with sticky notes',
    category: 'brainstorming',
    tags: ['sticky-notes', 'ideas', 'mind-map'],
    nodes: [
      {
        id: 'heading-1',
        type: 'heading',
        position: { x: 400, y: 50 },
        data: {
          id: 'data-1',
          text: 'Brainstorming Session',
          level: 1,
        },
      },
      {
        id: 'sticky-1',
        type: 'stickyNote',
        position: { x: 150, y: 200 },
        data: {
          id: 'data-2',
          text: 'Idea 1',
          color: 'yellow',
          fontSize: 'medium',
        },
      },
      {
        id: 'sticky-2',
        type: 'stickyNote',
        position: { x: 400, y: 200 },
        data: {
          id: 'data-3',
          text: 'Idea 2',
          color: 'pink',
          fontSize: 'medium',
        },
      },
      {
        id: 'sticky-3',
        type: 'stickyNote',
        position: { x: 650, y: 200 },
        data: {
          id: 'data-4',
          text: 'Idea 3',
          color: 'blue',
          fontSize: 'medium',
        },
      },
    ],
    edges: [],
  },
  {
    id: 'project-plan',
    name: 'Project Planning',
    description: 'Plan your project with tasks and milestones',
    category: 'planning',
    tags: ['tasks', 'project', 'planning'],
    nodes: [
      {
        id: 'heading-1',
        type: 'heading',
        position: { x: 350, y: 50 },
        data: {
          id: 'data-1',
          text: 'Project Plan',
          level: 1,
        },
      },
      {
        id: 'task-1',
        type: 'taskList',
        position: { x: 100, y: 200 },
        data: {
          id: 'data-2',
          title: 'Phase 1: Research',
          tasks: [
            { id: 't1', text: 'Market analysis', completed: false },
            { id: 't2', text: 'Competitor research', completed: false },
          ],
        },
      },
      {
        id: 'task-2',
        type: 'taskList',
        position: { x: 450, y: 200 },
        data: {
          id: 'data-3',
          title: 'Phase 2: Development',
          tasks: [
            { id: 't3', text: 'Design mockups', completed: false },
            { id: 't4', text: 'Build MVP', completed: false },
          ],
        },
      },
      {
        id: 'task-3',
        type: 'taskList',
        position: { x: 800, y: 200 },
        data: {
          id: 'data-4',
          title: 'Phase 3: Launch',
          tasks: [
            { id: 't5', text: 'Testing', completed: false },
            { id: 't6', text: 'Marketing campaign', completed: false },
          ],
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: 'task-1', target: 'task-2' },
      { id: 'e2-3', source: 'task-2', target: 'task-3' },
    ],
  },
  {
    id: 'flowchart',
    name: 'Flowchart',
    description: 'Create process flows with shapes',
    category: 'design',
    tags: ['flowchart', 'process', 'diagram'],
    nodes: [
      {
        id: 'heading-1',
        type: 'heading',
        position: { x: 350, y: 50 },
        data: {
          id: 'data-1',
          text: 'Process Flow',
          level: 2,
        },
      },
      {
        id: 'shape-1',
        type: 'shape',
        position: { x: 350, y: 150 },
        data: {
          id: 'data-2',
          shape: 'circle',
          text: 'Start',
          fill: SHAPE_COLORS.green + '40',
          stroke: SHAPE_COLORS.green,
          strokeWidth: 2,
          width: 120,
          height: 120,
        },
      },
      {
        id: 'shape-2',
        type: 'shape',
        position: { x: 350, y: 320 },
        data: {
          id: 'data-3',
          shape: 'rectangle',
          text: 'Process',
          fill: SHAPE_COLORS.blue + '40',
          stroke: SHAPE_COLORS.blue,
          strokeWidth: 2,
          width: 150,
          height: 100,
        },
      },
      {
        id: 'shape-3',
        type: 'shape',
        position: { x: 350, y: 480 },
        data: {
          id: 'data-4',
          shape: 'diamond',
          text: 'Decision',
          fill: SHAPE_COLORS.yellow + '40',
          stroke: SHAPE_COLORS.yellow,
          strokeWidth: 2,
          width: 150,
          height: 150,
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: 'shape-1', target: 'shape-2' },
      { id: 'e2-3', source: 'shape-2', target: 'shape-3' },
    ],
  },
  {
    id: 'documentation',
    name: 'Documentation',
    description: 'Document your code and ideas',
    category: 'documentation',
    tags: ['docs', 'code', 'notes'],
    nodes: [
      {
        id: 'heading-1',
        type: 'heading',
        position: { x: 300, y: 50 },
        data: {
          id: 'data-1',
          text: 'API Documentation',
          level: 1,
        },
      },
      {
        id: 'heading-2',
        type: 'heading',
        position: { x: 100, y: 150 },
        data: {
          id: 'data-2',
          text: 'Authentication',
          level: 3,
        },
      },
      {
        id: 'text-1',
        type: 'textNode',
        position: { x: 100, y: 220 },
        data: {
          id: 'data-3',
          text: 'All API requests require authentication using JWT tokens.',
          role: 'user',
        },
      },
      {
        id: 'code-1',
        type: 'codeBlock',
        position: { x: 100, y: 350 },
        data: {
          id: 'data-4',
          code: 'const token = await getAuthToken();\nfetch("/api/users", {\n  headers: {\n    "Authorization": `Bearer ${token}`\n  }\n});',
          language: 'javascript',
        },
      },
    ],
    edges: [],
  },
  {
    id: 'cornell-notes',
    name: 'Cornell Notes',
    description: 'Take structured notes for learning',
    category: 'education',
    tags: ['notes', 'learning', 'study'],
    nodes: [
      {
        id: 'heading-1',
        type: 'heading',
        position: { x: 350, y: 50 },
        data: {
          id: 'data-1',
          text: 'Lecture Notes',
          level: 1,
        },
      },
      {
        id: 'sticky-1',
        type: 'stickyNote',
        position: { x: 100, y: 150 },
        data: {
          id: 'data-2',
          text: 'Key Points:\n- Point 1\n- Point 2\n- Point 3',
          color: 'yellow',
          fontSize: 'small',
        },
      },
      {
        id: 'text-1',
        type: 'textNode',
        position: { x: 400, y: 150 },
        data: {
          id: 'data-3',
          text: 'Detailed notes go here...\n\nExplanations, examples, and elaborations.',
          role: 'user',
        },
      },
      {
        id: 'sticky-2',
        type: 'stickyNote',
        position: { x: 250, y: 450 },
        data: {
          id: 'data-4',
          text: 'Summary:\nMain takeaways from this lecture...',
          color: 'blue',
          fontSize: 'medium',
        },
      },
    ],
    edges: [],
  },
];

export function getTemplateById(id: string): CanvasTemplate | undefined {
  return CANVAS_TEMPLATES.find((template) => template.id === id);
}

export function getTemplatesByCategory(category: string): CanvasTemplate[] {
  return CANVAS_TEMPLATES.filter((template) => template.category === category);
}


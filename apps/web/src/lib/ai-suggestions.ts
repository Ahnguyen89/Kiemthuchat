import { Node } from 'reactflow';
import { FlowNode } from '@canvas-llm/shared';

export interface AISuggestion {
  id: string;
  type: 'node' | 'connection' | 'improvement';
  title: string;
  description: string;
  action: () => void;
}

/**
 * Analyze the canvas and provide AI-powered suggestions
 */
export function getCanvasSuggestions(
  nodes: Node[],
  edges: any[]
): AISuggestion[] {
  const suggestions: AISuggestion[] = [];

  // Check if canvas is empty
  if (nodes.length === 0) {
    suggestions.push({
      id: 'empty-canvas',
      type: 'node',
      title: 'Start with a template',
      description: 'Your canvas is empty. Try adding a heading or sticky note to get started.',
      action: () => {},
    });
    return suggestions;
  }

  // Check for nodes without connections
  const connectedNodeIds = new Set([
    ...edges.map((e) => e.source),
    ...edges.map((e) => e.target),
  ]);
  const disconnectedNodes = nodes.filter((node) => !connectedNodeIds.has(node.id));

  if (disconnectedNodes.length > 3) {
    suggestions.push({
      id: 'disconnected-nodes',
      type: 'connection',
      title: 'Connect your ideas',
      description: `You have ${disconnectedNodes.length} disconnected nodes. Consider linking related concepts.`,
      action: () => {},
    });
  }

  // Check if canvas has a heading
  const hasHeading = nodes.some((node) => node.type === 'heading');
  if (!hasHeading && nodes.length > 3) {
    suggestions.push({
      id: 'add-heading',
      type: 'node',
      title: 'Add a title',
      description: 'Your canvas could benefit from a heading to organize your thoughts.',
      action: () => {},
    });
  }

  // Check for task lists that might need attention
  const taskListNodes = nodes.filter((node) => node.type === 'taskList');
  if (taskListNodes.length > 0) {
    taskListNodes.forEach((node: any) => {
      const tasks = node.data?.tasks || [];
      const completedTasks = tasks.filter((t: any) => t.completed).length;
      const totalTasks = tasks.length;

      if (totalTasks > 0 && completedTasks === totalTasks) {
        suggestions.push({
          id: `completed-tasklist-${node.id}`,
          type: 'improvement',
          title: 'Task list completed!',
          description: `All tasks in "${node.data?.title || 'Task List'}" are done. Great job!`,
          action: () => {},
        });
      }
    });
  }

  // Check for code blocks without language
  const codeBlocks = nodes.filter((node) => node.type === 'codeBlock');
  codeBlocks.forEach((node: any) => {
    if (!node.data?.language || node.data?.code === '') {
      suggestions.push({
        id: `empty-code-${node.id}`,
        type: 'improvement',
        title: 'Complete code block',
        description: 'You have an empty code block. Add some code or remove it.',
        action: () => {},
      });
    }
  });

  // Suggest organizing nodes in a better layout
  if (nodes.length > 10) {
    const xPositions = nodes.map((n) => n.position.x);
    const xRange = Math.max(...xPositions) - Math.min(...xPositions);
    
    if (xRange < 500) {
      suggestions.push({
        id: 'spread-nodes',
        type: 'improvement',
        title: 'Spread out your canvas',
        description: 'Your nodes are clustered together. Consider spreading them out for better visibility.',
        action: () => {},
      });
    }
  }

  // Suggest adding images if only text
  const hasImages = nodes.some((node) => node.type === 'image');
  const hasText = nodes.some((node) => 
    node.type === 'textNode' || node.type === 'stickyNote'
  );

  if (!hasImages && hasText && nodes.length > 5) {
    suggestions.push({
      id: 'add-visual',
      type: 'node',
      title: 'Add visual elements',
      description: 'Consider adding images or shapes to make your canvas more visual and engaging.',
      action: () => {},
    });
  }

  return suggestions.slice(0, 5); // Return top 5 suggestions
}

/**
 * Generate AI-powered content suggestions based on context
 */
export function getContentSuggestions(
  nodeType: string,
  context?: string
): string[] {
  switch (nodeType) {
    case 'heading':
      return [
        'Project Overview',
        'Meeting Notes',
        'Research Summary',
        'Action Items',
        'Ideas & Concepts',
      ];
    
    case 'stickyNote':
      return [
        'Key insight or observation',
        'Question to explore',
        'Important reminder',
        'Quick thought',
        'Follow-up action',
      ];
    
    case 'taskList':
      return [
        'Phase 1: Planning',
        'Weekly Goals',
        'Sprint Tasks',
        'Today\'s Priorities',
        'Action Items',
      ];
    
    case 'textNode':
      return [
        'Detailed explanation',
        'Background information',
        'Key findings',
        'Analysis and insights',
        'Next steps',
      ];
    
    case 'codeBlock':
      return [
        'API endpoint example',
        'Function implementation',
        'Configuration snippet',
        'Data structure',
        'Algorithm logic',
      ];
    
    default:
      return [];
  }
}

/**
 * Suggest templates based on canvas content
 */
export function suggestTemplates(nodes: Node[]): string[] {
  if (nodes.length === 0) return ['brainstorm', 'project-plan', 'documentation'];

  const nodeTypes = nodes.map((n) => n.type);
  const hasCode = nodeTypes.includes('codeBlock');
  const hasTasks = nodeTypes.includes('taskList');
  const hasStickies = nodeTypes.includes('stickyNote');
  const hasShapes = nodeTypes.includes('shape');

  const suggestions = [];

  if (hasCode) {
    suggestions.push('documentation');
  }
  
  if (hasTasks) {
    suggestions.push('project-plan');
  }
  
  if (hasStickies) {
    suggestions.push('brainstorm', 'cornell-notes');
  }
  
  if (hasShapes) {
    suggestions.push('flowchart');
  }

  return suggestions.slice(0, 3);
}


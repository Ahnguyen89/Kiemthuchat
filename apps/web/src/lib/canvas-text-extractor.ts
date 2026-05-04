import { Node, Edge } from 'reactflow';

/**
 * Extract all text content from canvas nodes for AI analysis
 */
export function extractCanvasText(nodes: Node[], edges: Edge[]): string {
  const sections: string[] = [];

  // Add canvas structure overview
  sections.push(`Canvas Structure:`);
  sections.push(`- Total nodes: ${nodes.length}`);
  sections.push(`- Total connections: ${edges.length}`);
  sections.push('');

  // Extract text from each node based on type
  nodes.forEach((node, index) => {
    const nodeText = extractNodeText(node);
    if (nodeText) {
      sections.push(`Node ${index + 1} (${node.type || 'unknown'}):`);
      sections.push(nodeText);
      sections.push('');
    }
  });

  // Add connections information
  if (edges.length > 0) {
    sections.push('Connections:');
    edges.forEach((edge) => {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);
      if (sourceNode && targetNode) {
        sections.push(
          `- ${getNodeLabel(sourceNode)} -> ${getNodeLabel(targetNode)}`
        );
      }
    });
    sections.push('');
  }

  return sections.join('\n');
}

/**
 * Extract text from a single node based on its type
 */
function extractNodeText(node: Node): string {
  const { type, data } = node;

  switch (type) {
    case 'textNode':
      return `Text: ${data.text || '(empty)'}${data.role ? `\nRole: ${data.role}` : ''}`;

    case 'stickyNote':
      return `Sticky Note (${data.color || 'yellow'}): ${data.text || '(empty)'}`;

    case 'heading':
      return `Heading (Level ${data.level || 1}): ${data.text || '(empty)'}`;

    case 'taskList':
      const tasks = data.tasks || [];
      const taskText = tasks
        .map((task: any) => `  - [${task.completed ? 'x' : ' '}] ${task.text}`)
        .join('\n');
      return `Task List: ${data.title || 'Untitled'}\n${taskText || '  (no tasks)'}`;

    case 'codeBlock':
      return `Code Block (${data.language || 'text'}):\n\`\`\`\n${data.code || '(empty)'}\n\`\`\``;

    case 'notionPage':
      const blocks = data.blocks || [];
      const blockTexts = blocks
        .map((block: any) => {
          switch (block.type) {
            case 'paragraph':
              return block.content || '';
            case 'heading1':
              return `# ${block.content}`;
            case 'heading2':
              return `## ${block.content}`;
            case 'heading3':
              return `### ${block.content}`;
            case 'bulletList':
              return `• ${block.content}`;
            case 'numberedList':
              return `1. ${block.content}`;
            case 'checkbox':
              return `[${block.checked ? 'x' : ' '}] ${block.content}`;
            case 'quote':
              return `> ${block.content}`;
            case 'code':
              return `\`\`\`\n${block.content}\n\`\`\``;
            case 'divider':
              return '---';
            case 'table':
              if (block.tableData && Array.isArray(block.tableData)) {
                return block.tableData
                  .map((row: any[]) => row.join(' | '))
                  .join('\n');
              }
              return '';
            default:
              return block.content || '';
          }
        })
        .filter((text: string) => text)
        .join('\n');
      return `Notion Page: ${data.title || 'Untitled'} ${data.icon || ''}\n${blockTexts || '(empty)'}`;

    case 'shape':
      const shapeText = data.text || '';
      return shapeText
        ? `Shape (${data.shape || 'unknown'}): ${shapeText}`
        : `Shape (${data.shape || 'unknown'}): (no text)`;

    case 'image':
      return `Image: ${data.alt || data.url || '(no description)'}`;

    default:
      // Try to extract any text-like fields
      const textFields = ['text', 'content', 'title', 'description'];
      for (const field of textFields) {
        if (data[field]) {
          return `${field}: ${data[field]}`;
        }
      }
      return '';
  }
}

/**
 * Get a short label for a node
 */
function getNodeLabel(node: Node): string {
  const { type, data } = node;

  switch (type) {
    case 'textNode':
      return data.text?.substring(0, 30) || 'Text Node';
    case 'stickyNote':
      return data.text?.substring(0, 30) || 'Sticky Note';
    case 'heading':
      return data.text?.substring(0, 30) || 'Heading';
    case 'taskList':
      return data.title || 'Task List';
    case 'codeBlock':
      return `Code (${data.language || 'text'})`;
    case 'notionPage':
      return data.title || 'Notion Page';
    case 'shape':
      return `${data.shape || 'Shape'}`;
    case 'image':
      return 'Image';
    default:
      return type || 'Node';
  }
}

/**
 * Prepare context for AI with token limit awareness
 * OpenAI GPT-4 has ~8k tokens context, we'll use a safe limit
 */
export function prepareContextForAI(
  nodes: Node[],
  edges: Edge[],
  maxTokens: number = 6000
): string {
  const fullText = extractCanvasText(nodes, edges);

  // Rough estimation: 1 token ≈ 4 characters
  const estimatedTokens = fullText.length / 4;

  if (estimatedTokens <= maxTokens) {
    return fullText;
  }

  // If too long, truncate and add a note
  const maxChars = maxTokens * 4;
  const truncated = fullText.substring(0, maxChars);
  return `${truncated}\n\n[Note: Canvas content was truncated due to length. Total nodes: ${nodes.length}]`;
}


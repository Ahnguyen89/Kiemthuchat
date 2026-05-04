import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Provider } from '@prisma/client';
import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';

export interface CanvasNode {
  id: string;
  type?: string;
  data: any;
  position?: { x: number; y: number };
}

export interface CanvasEdge {
  id: string;
  source: string;
  target: string;
}

@Injectable()
export class CanvasAnalysisService {
  private openai: OpenAI | null = null;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  private async generateWithGoogle(apiKey: string, prompt: string): Promise<string> {
    const genAI = new GoogleGenAI({ apiKey });
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingBudget: 0,
        },
      },
    });

    return response.text || 'Unable to generate response';
  }

  /**
   * Extract text content from canvas nodes
   */
  private extractCanvasText(nodes: CanvasNode[], edges: CanvasEdge[]): string {
    const sections: string[] = [];

    // Add canvas structure overview
    sections.push(`Canvas Structure:`);
    sections.push(`- Total nodes: ${nodes.length}`);
    sections.push(`- Total connections: ${edges.length}`);
    sections.push('');

    // Extract text from each node
    nodes.forEach((node, index) => {
      const nodeText = this.extractNodeText(node);
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
            `- ${this.getNodeLabel(sourceNode)} -> ${this.getNodeLabel(targetNode)}`
          );
        }
      });
      sections.push('');
    }

    return sections.join('\n');
  }

  /**
   * Extract text from a single node
   */
  private extractNodeText(node: CanvasNode): string {
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
        return `Code Block (${data.language || 'text'}):\n\`\`\`${data.language || ''}\n${data.code || '(empty)'}\n\`\`\``;

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
          .filter((text) => text)
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
  private getNodeLabel(node: CanvasNode): string {
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
   * Summarize canvas using OpenAI
   */
  async summarizeCanvas(
    nodes: CanvasNode[],
    edges: CanvasEdge[],
    userApiKey?: string,
    provider: Provider = 'OPENAI',
  ): Promise<string> {
    if (provider === 'OPENAI' && !this.openai && !userApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const canvasText = this.extractCanvasText(nodes, edges);

    try {
      if (provider === 'GOOGLE' && userApiKey) {
        return this.generateWithGoogle(
          userApiKey,
          `You are an AI assistant helping users understand their canvas boards.
A canvas is a visual workspace where users can organize ideas, tasks, code, and information.
Provide a clear, concise summary and helpful insights.

Please provide a comprehensive summary of this canvas:

${canvasText}`,
        );
      }

      const client = userApiKey ? new OpenAI({ apiKey: userApiKey }) : this.openai!;
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant helping users understand their canvas boards. 
A canvas is a visual workspace where users can organize ideas, tasks, code, and information.
Provide clear, concise summaries and helpful insights.`,
          },
          {
            role: 'user',
            content: `Please provide a comprehensive summary of this canvas:\n\n${canvasText}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      return response.choices[0]?.message?.content || 'Unable to generate summary';
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown OpenAI error';
      if (message.includes('Incorrect API key') || message.includes('401')) {
        throw new BadRequestException('The configured OpenAI API key is invalid. Add a valid OpenAI key in Settings.');
      }
      throw new BadRequestException(`Failed to summarize canvas: ${message}`);
    }
  }

  /**
   * Answer questions about the canvas using OpenAI
   */
  async answerQuestion(
    nodes: CanvasNode[],
    edges: CanvasEdge[],
    question: string,
    userApiKey?: string,
    provider: Provider = 'OPENAI',
  ): Promise<string> {
    if (provider === 'OPENAI' && !this.openai && !userApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const canvasText = this.extractCanvasText(nodes, edges);

    try {
      if (provider === 'GOOGLE' && userApiKey) {
        return this.generateWithGoogle(
          userApiKey,
          `You are an AI assistant helping users understand their canvas boards.
A canvas is a visual workspace where users can organize ideas, tasks, code, and information.
Answer based on the canvas content. Be specific and reference actual content from the canvas.
If the canvas does not contain information to answer the question, say so clearly.

Canvas content:

${canvasText}

Question: ${question}`,
        );
      }

      const client = userApiKey ? new OpenAI({ apiKey: userApiKey }) : this.openai!;
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant helping users understand their canvas boards. 
A canvas is a visual workspace where users can organize ideas, tasks, code, and information.
Answer questions based on the canvas content. Be specific and reference actual content from the canvas.
If the canvas doesn't contain information to answer the question, say so clearly.`,
          },
          {
            role: 'user',
            content: `Canvas content:\n\n${canvasText}\n\nQuestion: ${question}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      return response.choices[0]?.message?.content || 'Unable to answer question';
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown OpenAI error';
      if (message.includes('Incorrect API key') || message.includes('401')) {
        throw new BadRequestException('The configured OpenAI API key is invalid. Add a valid OpenAI key in Settings.');
      }
      throw new BadRequestException(`Failed to answer question: ${message}`);
    }
  }

  /**
   * Generate embeddings for canvas content (for future RAG implementation)
   */
  async generateEmbeddings(nodes: CanvasNode[], edges: CanvasEdge[], userApiKey?: string): Promise<number[]> {
    if (!this.openai && !userApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const client = userApiKey ? new OpenAI({ apiKey: userApiKey }) : this.openai!;
    const canvasText = this.extractCanvasText(nodes, edges);

    // Truncate if too long (OpenAI embeddings have a token limit)
    const maxLength = 8000; // roughly 2000 tokens
    const truncatedText = canvasText.length > maxLength 
      ? canvasText.substring(0, maxLength) 
      : canvasText;

    try {
      const response = await client.embeddings.create({
        model: 'text-embedding-3-small',
        input: truncatedText,
      });

      return response.data[0].embedding;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown OpenAI error';
      if (message.includes('Incorrect API key') || message.includes('401')) {
        throw new BadRequestException('The configured OpenAI API key is invalid. Add a valid OpenAI key in Settings.');
      }
      throw new BadRequestException(`Failed to generate embeddings: ${message}`);
    }
  }
}

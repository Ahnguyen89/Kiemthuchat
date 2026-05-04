import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Provider } from '@prisma/client';
import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';

export interface GenerateTemplateRequest {
  description: string;
  category?: string;
  nodeCount?: number;
}

@Injectable()
export class TemplateGeneratorService {
  private openai: OpenAI | null = null;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  private parseJsonResponse(content: string): any {
    const cleaned = content
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```$/i, '')
      .trim();

    return JSON.parse(cleaned);
  }

  private async generateWithGoogle(
    apiKey: string,
    systemPrompt: string,
    userPrompt: string,
  ): Promise<string> {
    const genAI = new GoogleGenAI({ apiKey });
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${systemPrompt}\n\n${userPrompt}`,
      config: {
        responseMimeType: 'application/json',
        thinkingConfig: {
          thinkingBudget: 0,
        },
      },
    });

    if (!response.text) {
      throw new Error('No response from Gemini');
    }

    return response.text;
  }

  /**
   * Node type schemas that the AI can use to generate templates
   */
  private getNodeTypeSchemas(): string {
    return `
# Available Node Types

## 1. textNode
Used for: Text content, paragraphs, descriptions
Schema:
{
  id: string (unique, e.g., "text_1"),
  type: "textNode",
  position: { x: number, y: number },
  data: {
    id: string (unique, e.g., "data_text_1"),
    text: string,
    role: "user" | "assistant" (optional),
    isEditing: false
  }
}

## 2. stickyNote
Used for: Ideas, quick notes, brainstorming
Schema:
{
  id: string (unique, e.g., "sticky_1"),
  type: "stickyNote",
  position: { x: number, y: number },
  data: {
    id: string (unique, e.g., "data_sticky_1"),
    text: string,
    color: "yellow" | "pink" | "blue" | "green" | "purple" | "orange",
    fontSize: "small" | "medium" | "large"
  }
}

## 3. heading
Used for: Titles, section headers, organization
Schema:
{
  id: string (unique, e.g., "heading_1"),
  type: "heading",
  position: { x: number, y: number },
  data: {
    id: string (unique, e.g., "data_heading_1"),
    text: string,
    level: 1 | 2 | 3 (1 is largest)
  }
}

## 4. taskList
Used for: Todo lists, checklists, project tasks
Schema:
{
  id: string (unique, e.g., "task_1"),
  type: "taskList",
  position: { x: number, y: number },
  data: {
    id: string (unique, e.g., "data_task_1"),
    title: string,
    tasks: [
      {
        id: string (unique, e.g., "t1"),
        text: string,
        completed: boolean
      }
    ]
  }
}

## 5. codeBlock
Used for: Code snippets, technical documentation
Schema:
{
  id: string (unique, e.g., "code_1"),
  type: "codeBlock",
  position: { x: number, y: number },
  data: {
    id: string (unique, e.g., "data_code_1"),
    code: string,
    language: "javascript" | "typescript" | "python" | "java" | "go" | "rust" | "cpp" | "c" | "html" | "css" | "sql" | "bash" | "json" | "yaml" | "markdown",
    theme: "light" | "dark",
    showLineNumbers: boolean
  }
}

## 6. notionPage
Used for: Rich documents, structured content, detailed notes
Schema:
{
  id: string (unique, e.g., "notion_1"),
  type: "notionPage",
  position: { x: number, y: number },
  data: {
    id: string (unique, e.g., "data_notion_1"),
    title: string,
    icon: string (emoji, e.g., "📄", "💡", "🎯"),
    width: number (default 600),
    blocks: [
      {
        id: string (unique),
        type: "paragraph" | "heading1" | "heading2" | "heading3" | "bulletList" | "numberedList" | "checkbox" | "quote" | "code" | "divider" | "table",
        content: string,
        checked?: boolean (for checkbox type),
        tableData?: string[][] (for table type)
      }
    ]
  }
}

## 7. shape
Used for: Flowcharts, diagrams, visual elements
Schema:
{
  id: string (unique, e.g., "shape_1"),
  type: "shape",
  position: { x: number, y: number },
  data: {
    id: string (unique, e.g., "data_shape_1"),
    shape: "rectangle" | "circle" | "triangle" | "diamond",
    text: string (optional),
    fill: string (hex color with alpha, e.g., "#3B82F640"),
    stroke: string (hex color, e.g., "#3B82F6"),
    strokeWidth: number (usually 2),
    width: number (default 150),
    height: number (default 150)
  }
}

Common color schemes:
- Blue: fill "#3B82F640", stroke "#3B82F6"
- Green: fill "#10B98140", stroke "#10B981"
- Red: fill "#EF444440", stroke "#EF4444"
- Yellow: fill "#F59E0B40", stroke "#F59E0B"
- Purple: fill "#8B5CF640", stroke "#8B5CF6"
- Pink: fill "#EC489940", stroke "#EC4899"

## 8. image
Used for: Visual references, diagrams, screenshots
Schema:
{
  id: string (unique, e.g., "image_1"),
  type: "image",
  position: { x: number, y: number },
  data: {
    id: string (unique, e.g., "data_image_1"),
    url: string (image URL or placeholder),
    alt: string (description)
  }
}

## Edges (Connections)
Edges connect nodes to show relationships:
Schema:
{
  id: string (unique, e.g., "e1-2" or "edge_source_target"),
  source: string (source node id),
  target: string (target node id)
}

# Layout Guidelines

1. **Spacing**: Leave 150-300px between nodes horizontally and vertically
2. **Hierarchy**: Place main titles/headings at the top (y: 50-100)
3. **Flow**: Organize nodes left-to-right or top-to-bottom for logical flow
4. **Grouping**: Related items should be close together
5. **Canvas Size**: Design for viewport ~1200x800, but users can zoom/pan
6. **Starting Position**: Center important content around x: 400-600, y: 200-400

# Design Principles

1. Use appropriate node types for content (don't use shapes for text content)
2. Create visual hierarchy with headings
3. Use colors meaningfully (sticky notes for ideas, shapes for process steps)
4. Connect related nodes with edges when there's a logical flow
5. Balance the canvas - don't cluster everything in one corner
6. Use notionPage for detailed, structured content
7. Use sticky notes for brainstorming and quick ideas
8. Use taskLists for actionable items
9. Use shapes for flowcharts and process diagrams
`;
  }

  /**
   * Generate a canvas template using AI
   */
  async generateTemplate(
    request: GenerateTemplateRequest,
    userApiKey?: string,
    provider: Provider = 'OPENAI',
  ): Promise<{ nodes: any[]; edges: any[] }> {
    if (provider === 'OPENAI' && !this.openai && !userApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const nodeTypeSchemas = this.getNodeTypeSchemas();

    const systemPrompt = `You are an expert canvas designer that creates beautiful, well-organized visual workspaces.
Your task is to generate a JSON structure for a canvas board based on the user's description.

${nodeTypeSchemas}

IMPORTANT RULES:
1. Return ONLY valid JSON with this structure: {"nodes": [...], "edges": [...]}
2. All IDs must be unique strings
3. Position nodes thoughtfully for visual appeal and logical flow
4. Use appropriate node types for the content
5. Create realistic, useful content - not just placeholders
6. Include 5-15 nodes for a rich, useful template (unless specified otherwise)
7. Add edges to show relationships when appropriate
8. Use colors and formatting to create visual hierarchy
9. Make the canvas immediately useful - fill in real content examples

DO NOT include any markdown formatting, explanations, or text outside the JSON.`;

    const userPrompt = `Create a beautiful canvas template for: "${request.description}"
${request.category ? `Category: ${request.category}` : ''}
${request.nodeCount ? `Target number of nodes: ${request.nodeCount}` : ''}

    Generate a complete, ready-to-use canvas with realistic content.`;

    try {
      const content =
        provider === 'GOOGLE' && userApiKey
          ? await this.generateWithGoogle(userApiKey, systemPrompt, userPrompt)
          : (
              await (userApiKey ? new OpenAI({ apiKey: userApiKey }) : this.openai!)
                .chat.completions.create({
                  model: 'gpt-4o-mini',
                  messages: [
                    {
                      role: 'system',
                      content: systemPrompt,
                    },
                    {
                      role: 'user',
                      content: userPrompt,
                    },
                  ],
                  temperature: 0.8,
                  max_tokens: 4000,
                  response_format: { type: 'json_object' },
                })
            ).choices[0]?.message?.content;

      if (!content) {
        throw new Error('No response from AI');
      }

      // Parse the JSON response
      const template = this.parseJsonResponse(content);

      // Validate the structure
      if (!template.nodes || !Array.isArray(template.nodes)) {
        throw new Error('Invalid template structure: missing nodes array');
      }

      if (!template.edges) {
        template.edges = [];
      }

      // Ensure all nodes have required fields
      template.nodes = template.nodes.map((node: any, index: number) => ({
        ...node,
        id: node.id || `node_${index}`,
        data: {
          ...node.data,
          id: node.data?.id || `data_${index}`,
        },
      }));

      return {
        nodes: template.nodes,
        edges: template.edges,
      };
    } catch (error) {
      console.error('Error generating template:', error);
      throw new Error(
        `Failed to generate template: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Generate multiple template suggestions based on a description
   */
  async generateTemplateSuggestions(
    description: string,
    userApiKey?: string,
    provider: Provider = 'OPENAI',
  ): Promise<string[]> {
    if (provider === 'OPENAI' && !this.openai && !userApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `You are a creative assistant that suggests canvas template ideas.
Generate 3-5 specific, actionable template suggestions based on the user's description.
Each suggestion should be a clear, concise description (1-2 sentences).
Return as JSON: {"suggestions": ["suggestion 1", "suggestion 2", ...]}`;
    const userPrompt = `Suggest canvas template ideas for: "${description}"`;

    const content =
      provider === 'GOOGLE' && userApiKey
        ? await this.generateWithGoogle(userApiKey, systemPrompt, userPrompt)
        : (
            await (userApiKey ? new OpenAI({ apiKey: userApiKey }) : this.openai!)
              .chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                  {
                    role: 'system',
                    content: systemPrompt,
                  },
                  {
                    role: 'user',
                    content: userPrompt,
                  },
                ],
                temperature: 0.9,
                response_format: { type: 'json_object' },
              })
          ).choices[0]?.message?.content;

    if (!content) {
      return [];
    }

    const result = this.parseJsonResponse(content);
    return result.suggestions || [];
  }
}

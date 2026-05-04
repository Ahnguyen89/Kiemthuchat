# AI Canvas Template Generator

## Overview

The AI Template Generator replaces hardcoded templates with dynamic, AI-powered canvas generation. Users can describe what they want in natural language, and the AI creates a beautifully organized, fully functional canvas with realistic content.

## Why AI-Generated Templates?

### Problems with Hardcoded Templates
- ❌ Limited variety and customization
- ❌ Generic placeholder content
- ❌ Fixed layouts that may not fit user needs
- ❌ Requires manual creation of new templates
- ❌ Can't adapt to specific use cases

### Benefits of AI Generation
- ✅ **Unlimited Variety**: Create any type of canvas imaginable
- ✅ **Contextual Content**: Real, useful content based on description
- ✅ **Perfect Layout**: AI optimizes positioning and organization
- ✅ **All Node Types**: Automatically selects appropriate node types
- ✅ **Instant Customization**: No coding required to add new templates

## Features

### 1. Natural Language Input
Users describe what they want in plain English:
- "A project planning board with phases, tasks, and milestones"
- "A machine learning study guide with algorithms, code examples, and explanations"
- "A wedding planning canvas with budget tracker and checklist"

### 2. Quick Start Templates
Pre-populated prompts for common use cases:
- 📋 Project Planning Board
- 💡 Brainstorming Canvas
- 📚 Learning Notes
- 🎯 Sprint Planning
- 📊 Business Strategy
- 💻 Code Documentation

### 3. AI Suggestions
The AI can generate multiple variations:
- Suggest 3-5 different approaches
- Click any suggestion to generate that canvas
- Refine ideas before generating

### 4. Smart Node Selection
The AI automatically chooses the best node types:
- **Text Nodes**: For descriptions and explanations
- **Sticky Notes**: For brainstorming and quick ideas
- **Headings**: For titles and organization
- **Task Lists**: For actionable items
- **Code Blocks**: For technical examples
- **Notion Pages**: For detailed documentation
- **Shapes**: For flowcharts and diagrams
- **Images**: For visual references

### 5. Intelligent Layout
The AI creates visually appealing layouts:
- Proper spacing between elements
- Hierarchical organization
- Logical flow (left-to-right, top-to-bottom)
- Grouped related content
- Connected nodes with edges

## Technical Implementation

### Backend Service

#### Template Generator Service (`template-generator.service.ts`)

**Complete Node Type Schema**
The AI receives detailed schemas for all 8 node types:
```typescript
1. textNode - Text content and descriptions
2. stickyNote - Ideas with colors (yellow, pink, blue, green, purple, orange)
3. heading - Section headers (levels 1-3)
4. taskList - Todo lists with checkboxes
5. codeBlock - Code snippets (15+ languages)
6. notionPage - Rich documents with blocks (paragraphs, tables, lists, etc.)
7. shape - Flowchart elements (rectangle, circle, triangle, diamond)
8. image - Visual elements with descriptions
```

**Layout Guidelines Provided to AI**
- Spacing: 150-300px between nodes
- Hierarchy: Titles at top (y: 50-100)
- Flow: Left-to-right or top-to-bottom
- Canvas size: ~1200x800 viewport
- Starting position: Center around (400-600, 200-400)

**Generation Process**
```typescript
1. Parse user description
2. Determine appropriate node types
3. Create realistic content
4. Calculate optimal positions
5. Add connecting edges
6. Return JSON structure
```

#### API Endpoints

**POST `/api/flows/templates/generate`**
```typescript
Request:
{
  description: string,
  category?: string,
  nodeCount?: number
}

Response:
{
  success: true,
  data: {
    nodes: Node[],
    edges: Edge[]
  }
}
```

**POST `/api/flows/templates/suggestions`**
```typescript
Request:
{
  description: string
}

Response:
{
  success: true,
  data: {
    suggestions: string[]
  }
}
```

### Frontend Components

#### AI Template Dialog (`ai-template-dialog.tsx`)

**Features**
- Clean, modern UI with gradient styling
- Quick start buttons for common templates
- Natural language textarea input
- AI suggestions generation
- Loading states and animations
- Error handling with toast notifications

**User Flow**
1. Click "AI Generate" button
2. Either select quick template or describe custom canvas
3. Optionally get AI suggestions
4. Click "Generate Canvas"
5. AI creates template in 3-5 seconds
6. Review in canvas creation dialog
7. Name and create canvas

#### Canvas Page Integration

**Two Creation Methods**
```typescript
1. Traditional: Click "New Canvas" → Choose template
2. AI-Powered: Click "AI Generate" → Describe → Auto-populate
```

**Seamless Integration**
- AI-generated template appears in template selector
- Highlighted with purple gradient styling
- Shows node count
- Can switch back to manual templates

### API Client

**New Methods**
```typescript
// Generate template from description
apiClient.generateTemplate(
  description: string,
  category?: string,
  nodeCount?: number
): Promise<{ nodes: any[], edges: any[] }>

// Get AI suggestions
apiClient.generateTemplateSuggestions(
  description: string
): Promise<{ suggestions: string[] }>
```

## Usage Examples

### Example 1: Software Development Workflow

**User Input:**
```
"A software development workflow with planning, coding, testing, and deployment phases"
```

**AI Generates:**
```json
{
  "nodes": [
    {
      "type": "heading",
      "data": { "text": "Software Development Pipeline", "level": 1 },
      "position": { "x": 400, "y": 50 }
    },
    {
      "type": "taskList",
      "data": {
        "title": "Planning Phase",
        "tasks": [
          { "text": "Requirements gathering", "completed": true },
          { "text": "Architecture design", "completed": true },
          { "text": "Sprint planning", "completed": false }
        ]
      },
      "position": { "x": 100, "y": 200 }
    },
    {
      "type": "codeBlock",
      "data": {
        "code": "// Example CI/CD Pipeline\nnpm install\nnpm test\nnpm run build\nnpm run deploy",
        "language": "bash"
      },
      "position": { "x": 450, "y": 200 }
    },
    // ... more nodes
  ],
  "edges": [
    { "source": "task_1", "target": "code_1" }
  ]
}
```

### Example 2: Learning Canvas

**User Input:**
```
"A machine learning study guide with key concepts, algorithms, and code examples"
```

**AI Generates:**
- Notion page with ML fundamentals
- Sticky notes for key concepts (supervised, unsupervised, etc.)
- Code blocks with algorithm implementations
- Task list for practice exercises
- Shapes showing workflow diagrams

### Example 3: Business Planning

**User Input:**
```
"A business strategy canvas with vision, goals, KPIs, and action items"
```

**AI Generates:**
- Heading for company vision
- Sticky notes for strategic goals
- Multiple task lists for different departments
- Text nodes for KPI definitions
- Shapes showing process flows

## Configuration

### Environment Variables
```bash
# Required for AI template generation
OPENAI_API_KEY=sk-...
```

### Model Settings
- **Model**: GPT-4o-mini
- **Temperature**: 0.8 (creative layouts)
- **Max Tokens**: 4000 (handles complex templates)
- **Response Format**: JSON object (structured output)

## Best Practices

### Writing Effective Descriptions

**Good Examples:**
```
✅ "A sprint planning board with user stories, tasks by priority, and a burndown chart"
✅ "A recipe collection with ingredients, steps, cooking times, and nutritional info"
✅ "A personal finance tracker with budget categories, expenses, and savings goals"
```

**Poor Examples:**
```
❌ "Make me a canvas" (too vague)
❌ "Canvas" (no context)
❌ "Something for work" (not specific)
```

**Tips for Better Results:**
1. Be specific about the purpose
2. Mention key elements you want
3. Describe the structure or flow
4. Include any special requirements
5. Specify if you need specific node types

### Template Refinement

**Use AI Suggestions:**
1. Write a general description
2. Click "Get AI Suggestions"
3. Review 3-5 variations
4. Pick the best one
5. Generate!

**Iterate:**
- If result isn't perfect, try again with more details
- Mention specific node types if needed
- Describe spatial layout preferences

## Performance

### Generation Time
- Simple templates (5-10 nodes): 2-3 seconds
- Medium templates (10-15 nodes): 3-5 seconds
- Complex templates (15-20 nodes): 5-8 seconds

### Cost Optimization
- Uses GPT-4o-mini (most cost-effective)
- JSON mode reduces token waste
- Single API call per generation
- User API keys supported (cost passed to user)

### Caching
Future enhancement: Cache popular templates
- Store frequently requested descriptions
- Return cached results instantly
- Reduce API costs

## Error Handling

### Common Issues

**1. No API Key**
```
Error: "OpenAI API key not configured"
Solution: Add OPENAI_API_KEY or configure user API key
```

**2. Invalid JSON Response**
```
Error: "Invalid template structure"
Solution: AI retries with better prompt
```

**3. Network Timeout**
```
Error: "Failed to generate template"
Solution: User can retry immediately
```

### Fallback Behavior
- If AI generation fails, user can still use manual templates
- Error messages guide user to alternatives
- Graceful degradation to hardcoded templates

## Comparison: AI vs Hardcoded Templates

| Feature | Hardcoded | AI-Generated |
|---------|-----------|--------------|
| Variety | 5-10 templates | Unlimited |
| Customization | Fixed | Fully custom |
| Content Quality | Generic | Contextual |
| Layout | Static | Optimized |
| Maintenance | Manual updates | Self-improving |
| User Input | Click selection | Natural language |
| Generation Time | Instant | 3-5 seconds |
| Flexibility | Low | High |

## Future Enhancements

### 1. Template Gallery
- Save AI-generated templates
- Share with community
- Rate and favorite templates
- Search by keywords

### 2. Template Refinement
- Edit generated templates before creating
- Drag to adjust positions
- Add/remove nodes
- Preview in mini canvas

### 3. Multi-step Generation
- Generate base structure
- User provides feedback
- AI refines iteratively
- Collaborative design

### 4. Smart Templates
- Learn from user behavior
- Suggest templates based on history
- Personalized recommendations
- Team template libraries

### 5. Visual Input
- Upload reference images
- AI analyzes and recreates
- Convert diagrams to canvas
- OCR for text extraction

### 6. Template Marketplace
- Community-contributed templates
- Professional template packs
- Industry-specific collections
- Import/export templates

## Analytics & Monitoring

### Metrics to Track
- Generation success rate
- Average generation time
- Most popular descriptions
- User satisfaction ratings
- Template usage patterns

### Quality Assurance
- Monitor invalid responses
- Track user retry rates
- Collect feedback
- A/B test prompts

## Conclusion

The AI Template Generator transforms canvas creation from a manual, limited process into an intelligent, unlimited experience. By leveraging GPT-4o-mini's understanding of all node types and layout principles, we can generate beautiful, functional canvases in seconds based on simple natural language descriptions.

**Key Benefits:**
- 🚀 **10x faster** than manual template creation
- ♾️ **Unlimited variety** vs 5-10 hardcoded templates
- 🎯 **Context-aware** realistic content
- 🎨 **Professional layouts** automatically optimized
- 💡 **Zero learning curve** - just describe what you want

This feature makes canvas creation accessible to everyone, regardless of design skills or technical knowledge.


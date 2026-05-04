# Canvas AI Q&A and Summarization Feature

## Overview
This feature adds AI-powered question answering and summarization capabilities to canvas boards using RAG (Retrieval Augmented Generation) principles. Users can now ask questions about their canvas content or get comprehensive summaries.

## Features

### 1. AI Q&A Button
- **Location**: Canvas toolbar (bottom center)
- **Icon**: Purple sparkles icon with gradient background
- **Access**: Available on all non-read-only canvases

### 2. AI Canvas Dialog
A modern, chat-style interface that provides:
- **Quick Actions**:
  - Summarize Canvas - Get a comprehensive overview of all canvas content
  - Suggested Questions - Pre-populated question examples
  
- **Chat Interface**:
  - Ask custom questions about canvas content
  - Receive context-aware answers based on actual canvas data
  - Conversation history maintained during session

### 3. Content Extraction
The system extracts and analyzes text from all node types:
- **Text Nodes**: Direct text content and role
- **Sticky Notes**: Color and content
- **Headings**: Level and text
- **Task Lists**: Title and task items with completion status
- **Code Blocks**: Language and code content
- **Notion Pages**: Title, icon, and all block types (paragraphs, headings, lists, tables, etc.)
- **Shapes**: Shape type and any text content
- **Images**: Alt text and descriptions
- **Edges**: Connection relationships between nodes

## Technical Implementation

### Frontend Components

#### 1. AI Canvas Dialog (`ai-canvas-dialog.tsx`)
```typescript
interface AICanvasDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSummarize: () => Promise<string>;
  onAskQuestion: (question: string) => Promise<string>;
  canvasName?: string;
}
```

Features:
- Chat-style message display
- Loading states with animations
- Quick action buttons
- Suggested questions
- Keyboard shortcuts (Enter to send)

#### 2. Canvas Toolbar Update (`canvas-toolbar.tsx`)
- Added `onAIClick` optional prop
- AI button with distinctive styling
- Tooltip with clear description

#### 3. Text Extraction Utility (`canvas-text-extractor.ts`)
Comprehensive text extraction supporting:
- All node types
- Connection mapping
- Token-aware truncation
- Structured output for LLM context

### Backend Services

#### 1. Canvas Analysis Service (`canvas-analysis.service.ts`)
```typescript
@Injectable()
export class CanvasAnalysisService {
  // Summarize canvas content
  async summarizeCanvas(nodes, edges, userApiKey?): Promise<string>
  
  // Answer specific questions
  async answerQuestion(nodes, edges, question, userApiKey?): Promise<string>
  
  // Generate embeddings for future RAG
  async generateEmbeddings(nodes, edges, userApiKey?): Promise<number[]>
}
```

Features:
- Uses OpenAI GPT-4o-mini for fast, cost-effective responses
- Supports both system-level and user-level API keys
- Comprehensive text extraction from all node types
- Context-aware prompting for accurate responses

#### 2. API Endpoints (`flow.controller.ts`)
```
POST /api/flows/:id/summarize
- Generates a comprehensive summary of the canvas

POST /api/flows/:id/ask
- Body: { question: string }
- Answers questions about canvas content

POST /api/flows/:id/embeddings
- Generates vector embeddings for canvas content
- Returns: { embeddings: number[], dimension: number }
```

All endpoints:
- Require JWT authentication
- Check user ownership of canvas
- Support user-specific OpenAI API keys
- Handle errors gracefully

### API Client (`api.ts`)
New methods added:
```typescript
// Summarize entire canvas
async summarizeCanvas(flowId: string): Promise<ApiResponse<{ summary: string }>>

// Ask a question about canvas
async askCanvasQuestion(flowId: string, question: string): Promise<ApiResponse<{ answer: string }>>

// Generate embeddings for RAG
async generateCanvasEmbeddings(flowId: string): Promise<ApiResponse<{ embeddings: number[], dimension: number }>>
```

## Usage

### For End Users

1. **Open any canvas** with content
2. **Click the sparkles button** in the toolbar (bottom center)
3. **Choose an action**:
   - Click "Summarize Canvas" for a quick overview
   - Select a suggested question
   - Type your own question
4. **View the response** in the chat interface
5. **Continue the conversation** by asking follow-up questions

### Example Questions

- "What are the main topics covered in this canvas?"
- "What tasks need to be completed?"
- "Can you explain the code blocks in this canvas?"
- "What are the connections between different ideas?"
- "Summarize the workflow shown in this canvas"

## RAG Implementation

### Current Approach
The system uses a **context-based approach**:
1. Extract all text content from nodes and edges
2. Structure it in a readable format
3. Send as context to OpenAI GPT-4o-mini
4. LLM analyzes context and answers questions

### Token Management
- Maximum context: ~6000 tokens (roughly 24,000 characters)
- Automatic truncation for large canvases
- Preserves most important information

### Future Enhancements
The `generateEmbeddings` endpoint is ready for advanced RAG:
1. **Vector Database Integration**: Store embeddings in Pinecone, Weaviate, or pgvector
2. **Semantic Search**: Find relevant nodes using similarity search
3. **Chunk-based RAG**: Process large canvases by chunking
4. **Incremental Updates**: Update embeddings when canvas changes
5. **Multi-canvas Search**: Search across multiple canvases

## API Key Management

The system supports two levels of API keys:

1. **System-level**: Configured via `OPENAI_API_KEY` environment variable
2. **User-level**: Users can add their own OpenAI API keys in Settings

Priority: User API key → System API key

## Error Handling

- **No API Key**: Clear error message prompting user to add key
- **Canvas Access**: Validates user ownership before processing
- **Network Errors**: Graceful error messages in chat interface
- **Token Limits**: Automatic truncation with notification

## Security

- **Authentication**: All endpoints require JWT authentication
- **Authorization**: Users can only analyze their own canvases
- **API Key Storage**: Keys are hashed in database (encryption recommended for production)
- **Rate Limiting**: Inherits from existing API rate limits

## Performance Considerations

- **Model**: Using GPT-4o-mini for fast, cost-effective responses
- **Token Limits**: Optimized context size to balance completeness and cost
- **Caching**: Future enhancement - cache embeddings to avoid regeneration
- **Streaming**: Consider implementing streaming responses for better UX

## Configuration

### Environment Variables
```bash
# Required for AI features
OPENAI_API_KEY=sk-...

# Already configured
DATABASE_URL=postgresql://...
JWT_SECRET=...
```

### Dependencies
Backend (`apps/api/package.json`):
```json
{
  "openai": "^4.20.1"
}
```

Frontend - No new dependencies required!

## Sample Data Examples

### Example 1: Simple Canvas
```json
[
  {
    "id": "text_1",
    "type": "textNode",
    "data": { "text": "Project planning meeting" }
  },
  {
    "id": "task_1",
    "type": "taskList",
    "data": {
      "title": "Action Items",
      "tasks": [
        { "text": "Review requirements", "completed": true },
        { "text": "Create mockups", "completed": false }
      ]
    }
  }
]
```

**AI Summary**: "This canvas shows a project planning meeting with two action items. The requirements review is completed, while mockup creation is still pending."

### Example 2: Complex Canvas
The system handles canvases with:
- Multiple node types (text, code, tasks, notion pages)
- Interconnected nodes with edges
- Rich content (tables, code blocks, formatted text)
- Spatial relationships (although not currently analyzed)

## Development Notes

### Testing
To test the feature:
1. Ensure OpenAI API key is configured
2. Create a canvas with diverse content
3. Click the AI button
4. Try both summarization and Q&A

### Extending
To add new node types:
1. Update `extractNodeText()` in `canvas-analysis.service.ts`
2. Update `extractNodeText()` in `canvas-text-extractor.ts`
3. Add corresponding type definitions

### Monitoring
Consider adding:
- Token usage tracking
- Response time metrics
- User satisfaction ratings
- Error rate monitoring

## Future Roadmap

1. **Vector Database Integration** ✅ (Embeddings endpoint ready)
   - Connect to Pinecone or pgvector
   - Store and retrieve embeddings
   - Semantic search across canvases

2. **Streaming Responses**
   - Real-time token streaming
   - Better UX for long responses

3. **Multi-modal Support**
   - Analyze images in canvas (GPT-4 Vision)
   - Process uploaded files
   - Understand diagrams and drawings

4. **Collaborative AI**
   - Shared AI conversations
   - AI suggestions in real-time
   - Canvas auto-organization

5. **Advanced Analytics**
   - Detect patterns and insights
   - Suggest improvements
   - Identify missing connections

## Conclusion

This feature transforms canvas boards from static visual workspaces into intelligent, queryable knowledge bases. By leveraging OpenAI's capabilities and implementing RAG principles, users can now interact with their canvas content in natural language, making information retrieval and understanding significantly easier.


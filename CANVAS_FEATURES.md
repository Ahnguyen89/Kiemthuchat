# Canvas LLM - AFFiNE-Inspired Features

## Overview

Your platform has been transformed into an **AFFiNE-like canvas workspace** with powerful visual thinking and collaboration tools. Below is a comprehensive guide to all the new features.

## 🎨 New Features

### 1. **Enhanced Canvas Board**

The canvas board now supports multiple node types similar to AFFiNE's "Edgeless" mode:

#### Node Types

- **📝 Text Blocks** - Rich text editing with markdown support
- **📌 Sticky Notes** - Colorful, handwriting-style notes (7 colors available)
- **📋 Task Lists** - Interactive to-do lists with progress tracking
- **💻 Code Blocks** - Syntax-highlighted code with 19+ language support
- **🖼️ Images** - Add images via URL with captions
- **🔷 Shapes** - Geometric shapes (rectangles, circles, triangles, diamonds, hexagons)
- **📑 Headings** - Six levels of headings for structure

### 2. **Visual Toolbar**

A comprehensive toolbar with organized sections:

- **Content Tools**: Text blocks, sticky notes, headings, task lists, code blocks
- **Shapes**: Quick access to geometric shapes
- **Media**: Image insertion

### 3. **Template System**

Six pre-built templates to get you started:

1. **Blank Canvas** - Start from scratch
2. **Brainstorming** - Organize ideas with sticky notes
3. **Project Planning** - Task-based project management with phases
4. **Flowchart** - Process diagrams with shapes and connectors
5. **Documentation** - API docs with code examples
6. **Cornell Notes** - Structured note-taking for learning

### 4. **Canvas Management Dashboard**

- Grid view of all your canvases
- Preview thumbnails showing node count
- Quick actions: Duplicate, Delete
- Search and filter capabilities
- Template selection when creating new canvases

### 5. **Export & Import**

**Export Options:**
- 📸 **Export as PNG** - High-quality image export (2x resolution)
- 📄 **Export as JSON** - Complete canvas data for backup

**Import:**
- 📥 **Import from JSON** - Restore canvases from JSON files

### 6. **AI Assistant Panel**

An intelligent assistant that provides contextual suggestions:

**Suggestion Types:**
- **Node Suggestions**: Add headings, visual elements, etc.
- **Connection Suggestions**: Link related concepts
- **Improvement Suggestions**: Organize layout, complete tasks

**Features:**
- Auto-appears after 2 seconds when suggestions are available
- Color-coded suggestion types (blue, purple, green)
- Dismissible panel
- Context-aware based on canvas content

### 7. **Modern UI/UX**

**Design Improvements:**
- AFFiNE-inspired color scheme
- Smooth animations and transitions
- Custom scrollbars
- Glassmorphism effects
- Responsive design
- Dark mode support

**Interactive Elements:**
- Drag-and-drop node placement
- Double-click to edit
- Color pickers for sticky notes and shapes
- Inline editing for all node types
- Connection handles that appear on selection

## 🚀 Getting Started

### Creating Your First Canvas

1. Navigate to **Dashboard → Canvas**
2. Click **"New Canvas"** button
3. Choose a template or start blank
4. Enter canvas name and optional description
5. Click **"Create Canvas"**

### Using the Canvas

**Adding Nodes:**
1. Click any tool in the toolbar at the top
2. A new node will appear in a random position
3. Drag to reposition

**Editing Nodes:**
- Click on a node to select it
- Double-click or click the edit button to enter edit mode
- For sticky notes and shapes, use the color picker to change colors

**Connecting Nodes:**
- Hover over a node to see connection handles
- Drag from one handle to another to create connections
- Delete connections by selecting and pressing Delete

**Saving:**
- Click **"Save"** button in the header
- Changes are auto-saved to the database

**Exporting:**
- Click **"Export"** dropdown
- Choose PNG or JSON format

## 📦 Node Type Details

### Sticky Notes
- **7 Colors**: Yellow, Pink, Blue, Green, Purple, Orange, Gray
- **Font Sizes**: Small, Medium, Large
- **Handwriting-style** font for authenticity
- **Rotated appearance** for visual appeal

### Shapes
- **Types**: Rectangle, Circle, Triangle, Diamond, Hexagon
- **Customizable**: Fill color, stroke color, stroke width
- **Text Support**: Double-click to add text labels
- **7 Color Options**: Blue, Green, Red, Yellow, Purple, Pink, Gray

### Task Lists
- **Interactive checkboxes**
- **Progress tracking** (completed/total)
- **Add/remove tasks** dynamically
- **Editable title** and task descriptions

### Code Blocks
- **19+ Languages**: JavaScript, Python, TypeScript, Java, C++, Go, Rust, etc.
- **Copy to clipboard** functionality
- **Monospace font** with syntax highlighting readiness
- **Line numbers** option

### Images
- **URL-based** image loading
- **Caption support**
- **Error handling** for failed loads
- **Resize support**

## 🤖 AI Features

### Canvas Analysis
The AI assistant analyzes your canvas in real-time for:

- Empty canvases → Suggests templates
- Disconnected nodes → Recommends connections
- Missing organization → Suggests headings
- Completed tasks → Celebrates achievements
- Clustered layout → Recommends spreading out

### Content Suggestions
Context-aware suggestions based on node type:

- **Headings**: "Project Overview", "Meeting Notes", etc.
- **Sticky Notes**: "Key insight", "Question to explore", etc.
- **Task Lists**: "Weekly Goals", "Sprint Tasks", etc.

## 🎯 Use Cases

### 1. **Brainstorming Sessions**
- Use colorful sticky notes for ideas
- Connect related concepts with edges
- Add images for visual inspiration

### 2. **Project Planning**
- Create task lists for each phase
- Use shapes for milestones
- Add headings for organization

### 3. **Documentation**
- Combine text blocks and code blocks
- Use headings for structure
- Add images for diagrams

### 4. **Learning & Note-Taking**
- Cornell Notes template
- Mix text and visual elements
- Task lists for action items

### 5. **Process Design**
- Flowchart template with shapes
- Connect shapes to show flow
- Add text blocks for descriptions

## 💡 Tips & Tricks

1. **Use Templates**: Start with a template that matches your use case
2. **Color Coding**: Use different colored sticky notes for different types of ideas
3. **Keyboard Shortcuts**: Click and drag for quick node placement
4. **Export Regularly**: Save important work as JSON backups
5. **AI Suggestions**: Let the AI assistant guide you for better organization
6. **Task Tracking**: Mark tasks as complete to track progress
7. **Visual Balance**: Mix different node types for engaging canvases

## 🔮 Future Enhancements

Potential additions based on AFFiNE's roadmap:

- [ ] Real-time collaboration
- [ ] Version history
- [ ] More export formats (PDF, SVG)
- [ ] Drawing tools (freehand, pen)
- [ ] Advanced AI features (auto-summarize, generate content)
- [ ] Embeds (YouTube, Twitter, etc.)
- [ ] Table nodes
- [ ] Kanban board view
- [ ] Calendar integration

## 🏗️ Architecture

### Component Structure
```
apps/web/src/
├── components/canvas/
│   ├── canvas-board.tsx          # Main canvas component
│   ├── canvas-toolbar.tsx        # Toolbar with node types
│   ├── text-node.tsx             # Text/chat node
│   ├── sticky-note-node.tsx      # Sticky note component
│   ├── shape-node.tsx            # Shape component
│   ├── heading-node.tsx          # Heading component
│   ├── task-list-node.tsx        # Task list component
│   ├── code-block-node.tsx       # Code block component
│   ├── image-node.tsx            # Image component
│   ├── ai-assistant-panel.tsx    # AI suggestions panel
│   └── flow-preview.tsx          # Canvas preview
├── lib/
│   ├── templates.ts              # Canvas templates
│   ├── canvas-export.ts          # Export/import utilities
│   └── ai-suggestions.ts         # AI suggestion engine
└── app/dashboard/canvas/
    ├── page.tsx                  # Canvas list page
    └── [id]/page.tsx             # Individual canvas page
```

### Data Flow
1. **Canvas State**: Managed by ReactFlow (nodes, edges)
2. **Persistence**: Saved to PostgreSQL via NestJS API
3. **AI Analysis**: Real-time analysis triggers suggestions
4. **Export**: Client-side conversion to PNG/JSON

## 📊 Comparison with AFFiNE

| Feature | AFFiNE | Your Platform | Status |
|---------|--------|---------------|---------|
| Multiple Node Types | ✅ | ✅ | Complete |
| Sticky Notes | ✅ | ✅ | Complete |
| Shapes | ✅ | ✅ | Complete |
| Task Lists | ✅ | ✅ | Complete |
| Code Blocks | ✅ | ✅ | Complete |
| Templates | ✅ | ✅ | Complete |
| Export/Import | ✅ | ✅ | Complete |
| AI Integration | ✅ | ✅ | Complete |
| Modern UI | ✅ | ✅ | Complete |
| Real-time Collab | ✅ | ❌ | Future |
| Drawing Tools | ✅ | ❌ | Future |
| Table Nodes | ✅ | ❌ | Future |

## 🎉 Conclusion

Your platform now has a comprehensive AFFiNE-inspired canvas workspace with:

- **7 node types** for versatile content creation
- **6 templates** to jumpstart your work
- **AI-powered suggestions** for better organization
- **Export/import** for data portability
- **Modern, beautiful UI** with smooth animations

The foundation is solid, and the platform is ready for users to create beautiful, organized, and collaborative workspaces!

---

**Built with**: Next.js 15, ReactFlow, TypeScript, Tailwind CSS, shadcn/ui


# Canvas LLM Platform - AFFiNE-Inspired Workspace

A modern full-stack platform for visual thinking, collaboration, and AI-powered workflows. Built with Next.js 15, NestJS, and ReactFlow.

## ✨ Key Features

### 🎨 **Canvas Workspace** (NEW!)
- **7 Node Types**: Text, Sticky Notes, Shapes, Tasks, Code, Images, Headings
- **6 Templates**: Brainstorming, Project Planning, Flowchart, Documentation, Cornell Notes, Blank
- **Export/Import**: PNG and JSON export, JSON import
- **AI Assistant**: Intelligent suggestions for canvas organization
- **Modern UI**: AFFiNE-inspired design with smooth animations

### 🤖 **AI Integration**
- Multi-Provider LLM: OpenAI, Anthropic, and Google support
- Real-time streaming responses
- AI-powered canvas suggestions
- Context-aware content recommendations

### 🔐 **Authentication & Security**
- JWT-based auth with refresh tokens
- Secure API key management with encryption
- User settings and preferences

### 💬 **Chat System**
- Interactive streaming chat interface
- Real-time WebSocket/SSE communication
- Chat history and room management

### 🎨 **Modern UI/UX**
- Next.js 15 with App Router
- Tailwind CSS and shadcn/ui components
- Light/dark mode with system preference detection
- Responsive design

## Tech Stack

### Frontend
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- ReactFlow
- Zustand

### Backend
- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- WebSocket/SSE

## 🚀 Getting Started

### Prerequisites
- Node.js 18.17.0 or higher
- PostgreSQL database
- npm or yarn

### Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd canvas-llm-platform
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
# Copy example env files
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
```

4. **Set up the database**
```bash
docker compose up -d
cd apps/api
npx prisma migrate dev
npx prisma generate
```

5. **Start development servers**
```bash
npm run dev
```

This will start:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

6. **Access the platform**
- Create an account or log in
- Navigate to **Canvas** in the sidebar
- Click **"New Canvas"** and choose a template
- Start creating!

### 📚 Documentation

- **Canvas Features**: See [CANVAS_FEATURES.md](./CANVAS_FEATURES.md) for detailed feature documentation
- **Quick Start Guide**: See [docs/CANVAS_QUICKSTART.md](./docs/CANVAS_QUICKSTART.md) for a quick tutorial
- **Setup Guide**: See [docs/SETUP.md](./docs/SETUP.md) for detailed installation instructions

## 📦 Project Structure

```
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/           # Next.js pages
│   │   │   │   └── dashboard/
│   │   │   │       └── canvas/  # Canvas workspace
│   │   │   ├── components/
│   │   │   │   ├── canvas/    # Canvas components (7 node types)
│   │   │   │   └── ui/        # UI components (shadcn)
│   │   │   └── lib/
│   │   │       ├── templates.ts      # Canvas templates
│   │   │       ├── canvas-export.ts  # Export/import utilities
│   │   │       └── ai-suggestions.ts # AI assistant
│   └── api/                   # NestJS backend
│       └── src/
│           ├── flow/          # Canvas/flow management
│           ├── chat/          # Chat system
│           ├── auth/          # Authentication
│           └── llm-providers/ # LLM integrations
├── packages/
│   └── shared/                # Shared types and utilities
└── docs/                      # Documentation
```

## Environment Variables

### Frontend (`apps/web/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### Backend (`apps/api/.env`)
```
DATABASE_URL=postgresql://user:password@localhost:5432/canvas_llm
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-jwt-refresh-secret
ENCRYPTION_KEY=your-encryption-key
```

## API Providers Setup

Add your API keys in the settings dashboard after logging in:

- **OpenAI**: Get your API key from https://platform.openai.com/
- **Anthropic**: Get your API key from https://console.anthropic.com/
- **Google**: Get your API key from https://makersuite.google.com/

## Development

### Running Tests
```bash
npm run test
```

### Linting
```bash
npm run lint
```

### Type Checking
```bash
npm run type-check
```

### Building
```bash
npm run build
```

## 🎯 Use Cases

### Visual Thinking
- Brainstorm ideas with colorful sticky notes
- Create mind maps with connected nodes
- Organize thoughts visually

### Project Management
- Plan projects with task lists
- Track progress with checkboxes
- Visualize project phases with shapes

### Documentation
- Create technical documentation with code blocks
- Add images and diagrams
- Structure with headings

### Learning & Education
- Take structured notes (Cornell Notes)
- Create study guides
- Build concept maps

### Process Design
- Design flowcharts with shapes
- Map out workflows
- Document processes

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality UI components
- **ReactFlow** - Canvas/flow editor
- **Zustand** - State management
- **React Query** - Server state management

### Backend
- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe development
- **Prisma ORM** - Database toolkit
- **PostgreSQL** - Relational database
- **JWT** - Authentication
- **WebSocket/SSE** - Real-time communication

### AI/LLM
- **OpenAI** - GPT models
- **Anthropic** - Claude models
- **Google** - Gemini models

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **AFFiNE** - For inspiration on canvas design and UX
- **ReactFlow** - For the excellent flow editor library
- **shadcn/ui** - For beautiful UI components
- **Vercel** - For Next.js and hosting platform

---

**Built with ❤️ using modern web technologies**

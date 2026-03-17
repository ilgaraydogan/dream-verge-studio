# Dream Verge Studio — CLAUDE.md

> This file is the primary context document for AI-assisted development.
> Read this before every task. Do not skip it.

---

## Project Identity

**Name:** Dream Verge Studio
**Type:** Native macOS desktop application (Tauri v2)
**Purpose:** Professional AI-powered dream analysis IDE for psychologists and therapists
**License:** MIT
**Owner:** Bayram Ilgar Aydoğan
**Brand:** DreamVerge (dreamverge.ilgaraydogan.com.tr)
**GitHub:** https://github.com/ilgaraydogan/dream-verge-studio

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Desktop runtime | Tauri | v2.x |
| Backend language | Rust | latest stable |
| Frontend framework | React | 18.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS + shadcn/ui | latest |
| State management | Zustand | latest |
| File system | Tauri FS API | — |
| Secure storage | Tauri stronghold / OS keychain | — |
| Auto-update | Tauri Updater | — |
| Build | Vite | latest |
| CI/CD | GitHub Actions | — |

---

## Application Architecture

### Layout (Xcode-style, 4-pane)
```
┌─────────────────────────────────────────────────────┐
│  Toolbar (project name, run analysis, settings)      │
├──────────┬──────────────────┬──────────────────────┤
│          │                  │                      │
│Navigator │   Dream Editor   │   Analysis Panel     │
│          │                  │   (multi-model       │
│ - File   │  (markdown-like  │    output side       │
│   tree   │   .dream editor) │    by side)          │
│ - Soul   │                  │                      │
│ - Config │                  │                      │
├──────────┴──────────────────┴──────────────────────┤
│  Inspector (soul.md summary, flags, session meta)   │
└─────────────────────────────────────────────────────┘
```

### Source Layout
```
src/
├── app/                    # App shell, routing, layout
├── components/
│   ├── editor/             # Dream file editor
│   ├── navigator/          # Left panel: file tree, sessions
│   ├── analysis/           # Right panel: AI model outputs
│   ├── inspector/          # Bottom panel: meta, flags, soul
│   └── ui/                 # shadcn/ui base components
├── lib/
│   ├── ai/
│   │   ├── runner.ts       # Parallel model orchestration
│   │   ├── openai.ts       # OpenAI adapter
│   │   ├── anthropic.ts    # Anthropic adapter
│   │   ├── gemini.ts       # Google Gemini adapter
│   │   └── ollama.ts       # Ollama (local) adapter
│   ├── project/
│   │   ├── project.ts      # Project model & serialization
│   │   ├── dreamFile.ts    # .dream file parser/writer
│   │   ├── soulFile.ts     # soul.md reader/writer
│   │   └── config.ts       # .dreamconfig parser
│   └── flags/
│       ├── engine.ts       # Suspicion flag detection
│       └── patterns.ts     # Cross-session pattern matching
├── store/
│   ├── projectStore.ts     # Current project state
│   ├── editorStore.ts      # Editor state
│   └── settingsStore.ts    # API keys, preferences
└── main.tsx
```

---

## File Formats

### `.dream` file
```
---
id: string (auto-generated)
date: ISO date string
session: number
tags: string[]
flagged: boolean
models_used: string[]
---

Free text dream content written by the clinician.
```

### `soul.md`
Plain markdown. First-level headings are sections (Core Themes, Symbols, Flags, Notes).
AI may propose updates; clinician approves. Auto-backup on every change.

### `.dreamconfig`
```typescript
interface DreamConfig {
  models: string[];           // e.g. ["gpt-4o", "claude-3-5-sonnet"]
  parallelAnalysis: boolean;
  language: string;           // "tr" | "en"
  flagging: {
    enabled: boolean;
    sensitivityLevel: "low" | "clinical" | "high";
    keywords: string[];
  };
  soul: {
    autoUpdate: boolean;
    updateAfterSessions: number;
  };
}
```

---

## AI Integration Rules

1. API keys are stored in the OS keychain via Tauri — NEVER store them in plain files or state.
2. All model calls happen from TypeScript (`src/lib/ai/`). Rust does not call AI APIs directly.
3. Parallel analysis: fire all configured models simultaneously with `Promise.allSettled()`.
4. Each model response is stored as `<dreamId>.<modelId>.json` in the project folder.
5. Model adapters must implement this interface:
```typescript
interface ModelAdapter {
  id: string;
  name: string;
  analyze(dream: DreamFile, soul: string, config: DreamConfig): Promise<AnalysisResult>;
}
```

---

## Design System

- **Aesthetic:** Zed-inspired — minimal, near-black dark mode, precise typography
- **Primary background:** `#0d0d0d` (near black)
- **Secondary surface:** `#161616`
- **Border:** `#2a2a2a`
- **Primary accent:** `#8b5cf6` (violet — dream/unconscious feel)
- **Text primary:** `#e5e5e5`
- **Text muted:** `#737373`
- **Font:** Inter (UI), JetBrains Mono (editor)
- **No gradients, no shadows, no rounded corners on structural elements**
- **Transitions:** 150ms ease — fast, not flashy

---

## Coding Conventions

- All components are functional React with TypeScript — no class components
- Use named exports, not default exports (exception: page-level components)
- File names: `camelCase.ts` for lib, `PascalCase.tsx` for components
- Zustand stores: one file per domain, no god stores
- Tauri commands: named `snake_case` in Rust, wrapped as `camelCase` in TypeScript
- No `any` types — use `unknown` and narrow
- All async functions use `async/await`, not `.then()`
- Error handling: use `Result<T, E>` pattern in Rust; `try/catch` in TypeScript with typed errors
- Comments only for non-obvious logic — do not comment what the code already says

---

## What NOT to do

- Do NOT use Electron — this is a Tauri project
- Do NOT store API keys in localStorage, Zustand persist, or any file
- Do NOT call AI APIs from Rust — all AI calls go through TypeScript
- Do NOT use class-based React components
- Do NOT add dependencies without checking if Tauri already provides the capability natively
- Do NOT use `console.log` in production code — use the structured logger
- Do NOT access the filesystem directly from React — always go through Tauri FS commands

---

## Current Phase

**Phase 0 — Foundation**

Focus on: project skeleton, app window layout, file open/create, basic editor.
Do NOT build AI features yet in Phase 0.

---

## Key Commands

```bash
npm run tauri dev       # Start dev server + native window
npm run tauri build     # Build .dmg for macOS
npm run lint            # ESLint + TypeScript check
npm test                # Vitest unit tests
```

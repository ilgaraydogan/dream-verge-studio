# Dream Verge Studio — Technical Architecture

**Version:** 1.0 (Pre-Alpha)
**Author:** Bayram Ilgar Aydoğan
**Date:** March 2026

---

## 1. Overview

Dream Verge Studio is a native macOS desktop application. It is built on **Tauri v2**, combining a Rust backend for native OS capabilities with a React/TypeScript frontend for the user interface. The application is project-based: each patient is represented as a folder on the local filesystem containing structured dream files, a soul profile, and a configuration file.

The core value of the application is its AI orchestration layer, which sends dream entries to multiple AI models simultaneously and presents the outputs side by side for clinical comparison.

---

## 2. Technology Rationale

### Why Tauri (not Electron)?
Electron bundles a full Chromium instance (~150MB+), uses significant RAM, and has no native OS integration. Tauri uses the OS-native WebView (WKWebView on macOS), produces binaries under 10MB, consumes minimal RAM, and provides first-class access to OS APIs including the keychain, filesystem, and auto-update. For a professional clinical tool that will run alongside other applications all day, resource efficiency matters.

### Why React + TypeScript (not Swift/SwiftUI)?
AI code generation tools (Claude Code, Copilot, Cursor) are most capable with TypeScript and React — the training data coverage is extensive. Since AI will write the majority of this codebase, using the technology AI writes best is a strategic advantage, not a compromise. The Tauri Rust layer handles anything that must be truly native.

### Why Rust for the backend?
Tauri's command system is Rust. The Rust layer handles: file system operations with proper permissions, OS keychain access for API keys, the auto-update mechanism, and any CPU-intensive processing. Rust provides memory safety and performance without a runtime.

---

## 3. Application Layers

```
┌─────────────────────────────────────────────────┐
│            React + TypeScript UI                 │
│  Navigator | Editor | Analysis | Inspector       │
├─────────────────────────────────────────────────┤
│              Zustand State Layer                 │
│  projectStore | editorStore | settingsStore      │
├─────────────────────────────────────────────────┤
│            TypeScript Business Logic             │
│  AI runners | File parsers | Flag engine         │
├─────────────────────────────────────────────────┤
│              Tauri IPC Bridge                    │
│  invoke() calls → Rust commands                  │
├─────────────────────────────────────────────────┤
│                Rust (Tauri)                      │
│  FS | Keychain | Updater | Window management     │
├─────────────────────────────────────────────────┤
│                  macOS APIs                      │
│  WKWebView | Security framework | AppKit         │
└─────────────────────────────────────────────────┘
```

---

## 4. Data Model

### Project
A project is a folder on disk. The folder name is the patient identifier (the clinician assigns this — no real patient names are enforced).

```
PatientProject/
├── .dreamconfig          # Analysis configuration
├── soul.md               # Patient soul profile
├── sessions/
│   ├── 2025-03-01-001.dream
│   ├── 2025-03-01-001.gpt-4o.json
│   ├── 2025-03-01-001.claude-3-5-sonnet.json
│   ├── 2025-03-08-002.dream
│   └── ...
└── exports/
    └── report-2025-03.pdf
```

### Dream File (`.dream`)
YAML frontmatter + free text body. Parsed on open, written on save.

```typescript
interface DreamFile {
  id: string;
  date: string;           // ISO 8601
  session: number;
  tags: string[];
  flagged: boolean;
  modelsUsed: string[];
  body: string;           // Free text dream content
}
```

### Analysis Result (`.{modelId}.json`)
Stored per-dream per-model. Never overwritten — append-only per session.

```typescript
interface AnalysisResult {
  modelId: string;
  timestamp: string;
  dreamId: string;
  output: string;         // Model's analysis text
  flags: Flag[];          // Flags identified by this model
  tokens: number;         // Token usage for cost tracking
}

interface Flag {
  type: "keyword" | "semantic" | "pattern";
  severity: "note" | "watch" | "urgent";
  excerpt: string;        // The flagged passage
  reason: string;         // Why it was flagged
}
```

### Soul Profile (`soul.md`)
Plain markdown. Sections are free-form. The AI update flow proposes a new version; the clinician accepts or edits before it is saved.

### Config (`.dreamconfig`)
JSON. Validated against a Zod schema on load. Defaults applied for missing fields.

---

## 5. AI Orchestration

### Parallel Analysis Flow

```
Clinician clicks "Analyze"
        │
        ▼
Read .dreamconfig → get models[]
        │
        ▼
Read soul.md → build context string
        │
        ▼
┌───────────────────────────────────┐
│     Promise.allSettled([          │
│       openai.analyze(dream, ...),  │
│       anthropic.analyze(dream,...),│
│       gemini.analyze(dream, ...)   │
│     ])                            │
└───────────────────────────────────┘
        │
        ▼
Each result streams into its panel (SSE / chunked response)
        │
        ▼
Results saved to disk as .{modelId}.json
        │
        ▼
Flag engine runs on all results → updates Inspector
        │
        ▼ (if soul.autoUpdate && session % updateAfterSessions === 0)
AI proposes soul.md update → clinician review modal
```

### Model Adapter Interface

All model integrations implement one interface:

```typescript
interface ModelAdapter {
  readonly id: string;           // e.g. "gpt-4o"
  readonly name: string;         // e.g. "GPT-4o"
  readonly provider: string;     // e.g. "openai"

  analyze(
    dream: DreamFile,
    soulContext: string,
    config: DreamConfig,
    onChunk?: (chunk: string) => void   // streaming callback
  ): Promise<AnalysisResult>;

  isConfigured(): boolean;       // checks if API key present
}
```

### System Prompt (base)

```
You are a professional dream analysis assistant supporting a licensed psychologist.
Your task is to analyze the following dream entry in a clinical, structured manner.

Patient context (soul profile):
{soul.md content}

Analyze this dream for:
1. Dominant symbols and their possible psychological meanings
2. Emotional tone and affect
3. Recurring themes (compare against soul profile if present)
4. Patterns that may warrant clinical attention (flag these clearly)
5. Suggested follow-up questions for the next session

Respond in {language}. Be precise and professional. Do not speculate beyond the evidence in the text.
```

---

## 6. API Key Security

API keys are stored exclusively in the OS keychain via Tauri's secure storage API. The flow:

1. User enters API key in Settings
2. TypeScript calls `invoke('store_api_key', { provider, key })`
3. Rust stores it in the macOS Security framework (Keychain)
4. On analysis, TypeScript calls `invoke('get_api_key', { provider })` → gets key at runtime
5. Key is used in memory for the API call and immediately discarded
6. Keys are never written to disk, never in Zustand persist, never in `.dreamconfig`

---

## 7. Auto-Update

Uses Tauri's built-in updater:
- App checks for updates on launch (configurable)
- Update manifest hosted on GitHub Releases
- Update downloaded in background, applied on next launch
- User notified non-intrusively

---

## 8. GitHub Actions CI/CD

### `build.yml` — runs on every push
- Lint (ESLint + TypeScript)
- Unit tests (Vitest)
- Tauri build for macOS
- Uploads `.dmg` artifact

### `release.yml` — runs on version tag (`v*.*.*`)
- Full build + notarization (requires Apple Developer credentials as secrets)
- Creates GitHub Release
- Uploads signed `.dmg`
- Updates Tauri updater manifest

---

## 9. GitHub Repository Setup

### Recommended structure
```
dream-verge-studio/               ← repo root
├── .github/
│   ├── workflows/
│   │   ├── build.yml
│   │   └── release.yml
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── PULL_REQUEST_TEMPLATE.md
├── src-tauri/
├── src/
├── CLAUDE.md                     ← AI dev context
├── README.md
├── ROADMAP.md
├── CONTRIBUTING.md
├── LICENSE                       ← MIT
└── .gitignore
```

### Labels to create
- `phase:0` `phase:1` `phase:2` `phase:3` `phase:4`
- `type:bug` `type:feature` `type:docs` `type:refactor`
- `priority:high` `priority:medium` `priority:low`
- `ai:ready` (issue is scoped enough for Claude Code to implement)

### Branch strategy
- `main` → always builds, always releasable
- `dev` → integration branch
- `feature/*` → feature branches, PR into dev
- Tags: `v0.1.0`, `v0.2.0`, etc. trigger releases

---

## 10. Non-Goals (v1.0)

The following are explicitly out of scope for the first release:
- Windows / Linux support
- Cloud sync or any remote storage of patient data
- Native patient authentication or access control (use OS user accounts)
- Real-time collaboration
- Mobile companion app
- Any in-app AI hosting (all models are third-party BYOK)

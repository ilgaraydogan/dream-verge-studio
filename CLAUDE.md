# Dream Verge Studio — CLAUDE.md

> This file is the primary context document for AI-assisted development.
> Read this before every task. Do not skip it.

---

## Project Identity

**Name:** Dream Verge Studio
**Type:** Native macOS + Linux desktop application (Tauri v2)
**Purpose:** Professional AI-powered dream analysis IDE for psychologists and therapists
**License:** MIT
**Owner:** Bayram Ilgar Aydoğan
**Brand:** DreamVerge (dreamverge.ilgaraydogan.com.tr)
**GitHub:** https://github.com/ilgaraydogan/dream-verge-studio
**Current Version:** v0.1.0-alpha.2

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
| Secure storage | Tauri plugin-store | — |
| Auto-update | Tauri Updater | — |
| Build | Vite | latest |
| CI/CD | GitHub Actions | — |
| AI (Playground) | OpenRouter API | — |

---

## Application Modes

Dream Verge Studio has two distinct modes:

### 1. PROJECT MODE (Beta)
Full IDE experience for professional clinical use.
- Patient project folders
- .dream file editor
- soul.md patient profile
- Multi-model AI analysis (user's own API keys)
- Flagging system
- Cross-session pattern detection

### 2. PLAYGROUND MODE (New)
Simple, accessible dream interpretation for anyone.
- No project setup required
- No API key required
- User types their dream, AI interprets it
- Uses OpenRouter API with embedded GPT-4o-mini-free key
- Single page, chat-like interface
- Results are NOT saved (session only)

---

## Application Architecture

### Welcome Screen (Xcode-style)
Shown on every app launch before any mode is selected.

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   [DV Logo]          Dream Verge Studio                 │
│                      v0.1.0-alpha.2                     │
│                                                         │
├─────────────────┬───────────────────────────────────────┤
│                 │                                       │
│  Recent         │   ┌─────────────────────────────┐    │
│  Projects       │   │  📁 New Project        Beta  │    │
│                 │   │  Professional dream analysis │    │
│  - Project A    │   │  IDE. Patient folders,       │    │
│  - Project B    │   │  multi-model AI, flagging.   │    │
│  - Project C    │   └─────────────────────────────┘    │
│                 │                                       │
│  [Open Other]   │   ┌─────────────────────────────┐    │
│                 │   │  ✨ Playground          New  │    │
│                 │   │  Just type your dream and    │    │
│                 │   │  get instant AI analysis.    │    │
│                 │   │  No setup required.          │    │
│                 │   └─────────────────────────────┘    │
│                 │                                       │
├─────────────────┴───────────────────────────────────────┤
│  github.com/ilgaraydogan/dream-verge-studio    MIT      │
└─────────────────────────────────────────────────────────┘
```

### Project Mode Layout (4-pane IDE)
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

### Playground Mode Layout
```
┌─────────────────────────────────────────────────────┐
│  [DV] Dream Verge Studio        [Open Project Mode] │
├─────────────────────────────────────────────────────┤
│                                                     │
│         ✨ Dream Playground                         │
│         Rüyanı yaz, AI yorumlasın                   │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │  Rüyanı buraya yaz...                         │  │
│  │                                               │  │
│  │                                               │  │
│  └───────────────────────────────────────────────┘  │
│                    [Yorumla →]                      │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │  AI Yorumu burada görünecek...                │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Source Layout
```
src/
├── app/
│   ├── WelcomeScreen.tsx       # Xcode-style launch screen
│   ├── ProjectMode.tsx         # Full IDE wrapper
│   ├── PlaygroundMode.tsx      # Simple chat wrapper
│   └── router.tsx              # Mode routing
├── components/
│   ├── editor/
│   ├── navigator/
│   ├── analysis/
│   ├── inspector/
│   ├── playground/
│   │   ├── DreamInput.tsx
│   │   ├── PlaygroundResult.tsx
│   │   └── PlaygroundLayout.tsx
│   ├── installer/
│   │   └── InstallerScreen.tsx # Animasyonlu kurulum ekranı (ilk açılış)
│   └── ui/
├── lib/
│   ├── ai/
│   │   ├── runner.ts
│   │   ├── openai.ts
│   │   ├── anthropic.ts
│   │   ├── gemini.ts
│   │   ├── openrouter.ts
│   │   └── ollama.ts
│   ├── project/
│   │   ├── project.ts
│   │   ├── dreamFile.ts
│   │   ├── soulFile.ts
│   │   └── config.ts
│   └── flags/
│       ├── engine.ts
│       └── patterns.ts
├── store/
│   ├── projectStore.ts
│   ├── editorStore.ts
│   ├── settingsStore.ts
│   └── appStore.ts             # Current mode (installer/welcome/project/playground)
└── main.tsx
```

---

## Installer / First Launch Experience

### Davranış
- Uygulama ilk kez açıldığında (veya `onboarded` flag'i yoksa) **InstallerScreen** gösterilir
- Dia Browser / ChatGPT Atlas tarzı: animasyonlu, şık, tek sayfalık karşılama akışı
- Tamamlandığında `onboarded: true` Tauri plugin-store'a yazılır
- Sonraki açılışlarda direkt WelcomeScreen açılır

### Installer Akışı (3 adım, animated)
```
ADIM 1 — Karşılama
  [DV Logo animasyonu — fade in + subtle scale]
  "Dream Verge Studio'ya Hoş Geldiniz"
  "Psikologlar için AI destekli rüya analiz IDE'si"
  [Devam Et →]

ADIM 2 — Modları Tanıt
  İki kart yan yana, hover'da glow efekti:
  [📁 Project Mode]     [✨ Playground]
  "Klinik kullanım"     "Hızlı analiz"
  [Devam Et →]

ADIM 3 — Hazır
  Checkmark animasyonu (çizgi çizer gibi)
  "Her şey hazır!"
  "API anahtarlarınızı Settings'ten ekleyebilirsiniz"
  [Başla →]  ← Bu butona basınca WelcomeScreen açılır
```

### Installer Tasarım Kuralları
- Arka plan: `#0d0d0d` — tam siyah, sade
- Logo: ortada, `#8b5cf6` violet glow ile
- Adım geçişleri: `framer-motion` veya CSS `@keyframes` ile slide + fade
- Hiçbir adımda form veya input yok — sadece bilgi ve ileri butonu
- Mobil veya küçük pencere düşünülmez — bu bir desktop app
- "Skip" butonu sağ üstte her adımda mevcut

---

## Linux .deb Support

### Hedef Dağıtımlar
- Debian 12+
- Ubuntu 22.04+
- Pardus 23+

### Tauri Build Konfigürasyonu
`src-tauri/tauri.conf.json` bundle targets içine `"deb"` eklenir:
```json
"bundle": {
  "active": true,
  "targets": ["dmg", "deb"],
  ...
}
```

### Linux'a Özel Kurallar
- Keychain yerine `tauri-plugin-store` kullan (zaten mevcut, cross-platform)
- `$HOME/**` path'i Linux'ta da çalışır — capabilities dosyası değişmez
- Uygulama ikonu: `src-tauri/icons/` klasöründeki `.png` dosyaları yeterli
- `.deb` çıktısı: `src-tauri/target/release/bundle/deb/` altında
- Linux build sadece Linux makinede veya GitHub Actions'ta yapılır

### GitHub Actions — Linux Build
`.github/workflows/release.yml` dosyasına Linux runner eklenir:
```yaml
jobs:
  build-macos:
    runs-on: macos-latest
    # mevcut macOS build

  build-linux:
    runs-on: ubuntu-22.04
    steps:
      - uses: actions/checkout@v4
      - name: Install dependencies
        run: |
          sudo apt-get update
          sudo apt-get install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Setup Rust
        uses: dtolnay/rust-toolchain@stable
      - name: Install npm deps
        run: npm install
      - name: Build
        run: npm run tauri build
        env:
          VITE_OPENROUTER_KEY: ${{ secrets.OPENROUTER_KEY }}
      - name: Upload .deb
        uses: actions/upload-artifact@v4
        with:
          name: dream-verge-studio-linux
          path: src-tauri/target/release/bundle/deb/*.deb
```

### Linux'ta Test Etme (Mac'ten cross-build yapılmaz)
- Linux build için GitHub Actions kullanılır
- Local test için Ubuntu/Pardus sanal makine veya paralel kurulum gerekir
- Şimdilik: macOS'ta geliştir, Linux build'i Actions üzerinden al

---

## Playground Mode — Technical Details

### OpenRouter Integration
- Model: `openai/gpt-4o-mini` (free tier)
- API key: embedded in build via environment variable — NEVER hardcoded string
- Base URL: `https://openrouter.ai/api/v1`
- Required headers:
  ```
  Authorization: Bearer {VITE_OPENROUTER_KEY}
  HTTP-Referer: https://dreamverge.ilgaraydogan.com.tr
  X-Title: Dream Verge Studio
  ```

### Playground System Prompt
```
You are a professional dream interpreter assistant.
Analyze the dream the user describes and provide:
1. Key symbols and their psychological meaning
2. Overall emotional tone
3. Possible themes or messages
4. A brief, thoughtful summary

Be warm, professional, and insightful.
Do not make medical diagnoses.
Respond in the same language the user writes in.
Keep response under 400 words.
```

### Rate Limiting
- Limit: 3 analyses per session (soft limit, client-side)
- After 3: show message "For unlimited analysis, use Project Mode with your own API key"

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
  models: string[];
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

1. PROJECT MODE: API keys stored via Tauri plugin-store — NEVER in plain files or state.
2. PLAYGROUND MODE: OpenRouter key embedded at build time via environment variable.
3. All model calls happen from TypeScript (`src/lib/ai/`). Rust does not call AI APIs.
4. Parallel analysis: `Promise.allSettled()` for all configured models.
5. Each model response stored as `<dreamId>.<modelId>.json` in project folder.
6. FS permission errors: always fail gracefully with default values, never crash.

---

## Known Bugs (do not break workarounds)

### BUG-001: FS Permission Error (GitHub Issue #1)
- `.dreamconfig` and `.dream` files cannot be read from arbitrary folders
- Workaround: if file read fails, use default config values silently
- Do NOT remove this workaround until the bug is properly fixed

---

## Design System

- **Aesthetic:** Zed-inspired — minimal, near-black dark mode, precise typography
- **Primary background:** `#0d0d0d`
- **Secondary surface:** `#161616`
- **Border:** `#2a2a2a`
- **Primary accent:** `#8b5cf6` (violet)
- **Text primary:** `#e5e5e5`
- **Text muted:** `#737373`
- **Font:** Inter (UI), JetBrains Mono (editor)
- **No gradients, no shadows, no rounded corners on structural elements**
- **Transitions:** 150ms ease

### Welcome Screen & Installer Design
- macOS native feel — similar to Xcode welcome window
- Frosted glass effect on cards (backdrop-blur)
- Subtle hover states on mode cards
- Installer: full-screen animated onboarding, Dia Browser aesthetic
- framer-motion veya pure CSS @keyframes — ikisi de kabul

---

## Coding Conventions

- All components are functional React with TypeScript — no class components
- Named exports, not default exports (exception: page-level components)
- File names: `camelCase.ts` for lib, `PascalCase.tsx` for components
- Zustand stores: one file per domain, no god stores
- Tauri commands: `snake_case` in Rust, `camelCase` in TypeScript
- No `any` types — use `unknown` and narrow
- All async functions use `async/await`
- Error handling: `Result<T, E>` in Rust; `try/catch` in TypeScript
- Comments only for non-obvious logic

---

## What NOT to do

- Do NOT use Electron
- Do NOT store API keys in localStorage, Zustand persist, or any plain file
- Do NOT call AI APIs from Rust
- Do NOT use class-based React components
- Do NOT hardcode the OpenRouter API key as a plain string in source — use env variable
- Do NOT add dependencies without checking Tauri native capabilities first
- Do NOT use `console.log` in production — use structured logger
- Do NOT access filesystem directly from React — go through Tauri FS commands
- Do NOT attempt Linux cross-compilation from macOS — use GitHub Actions

---

## Current Phase

**Alpha 2 — Final**

Tamamlananlar:
- [x] WelcomeScreen component (Xcode-style)
- [x] App mode routing (welcome → project / playground)
- [x] Playground mode UI
- [x] OpenRouter integration (GPT-4o-mini-free)
- [x] Rate limiting (3/session soft limit)

Kalan görevler:
- [ ] Installer / First Launch Experience (Dia Browser tarzı animasyonlu onboarding)
- [ ] Linux .deb build konfigürasyonu (tauri.conf.json + GitHub Actions)
- [ ] Alpha 2 final build (.dmg + .deb via Actions)
- [ ] GitHub Release v0.1.0-alpha.2

---

## Key Commands

```bash
npm run tauri dev       # Start dev server + native window
npm run tauri build     # Build .dmg for macOS
npm run lint            # ESLint + TypeScript check
npm test                # Vitest unit tests
```
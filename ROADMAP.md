# Dream Verge Studio — Roadmap

## Phase 0 — Foundation (Week 1–2)
> Skeleton up, nothing crashes.

- [ ] Tauri v2 project initialized (macOS target)
- [ ] React + TypeScript + Tailwind + shadcn/ui setup
- [ ] App window layout: Navigator | Editor | Analysis | Inspector
- [ ] Open/create project folder (patient project)
- [ ] File tree in Navigator — shows `.dream` files and `soul.md`
- [ ] Basic `.dream` file editor (plain text, saves to disk)
- [ ] `.dreamconfig` created automatically on new project
- [ ] GitHub repo public, MIT license, CI workflow (build check)

## Phase 1 — Core Files & Editor (Week 3–4)
> Files work correctly, editor feels good.

- [ ] `.dream` file format: YAML frontmatter + body
- [ ] Frontmatter editor (date, tags, session number)
- [ ] `soul.md` file: auto-created, opens in editor
- [ ] `.dreamconfig` editor (form-based or raw JSON toggle)
- [ ] Session list view in Navigator (sorted by date)
- [ ] Dark mode (Zed-inspired — near-black background, soft contrast)
- [ ] Keyboard shortcuts: new dream, save, open project

## Phase 2 — AI Integration (Week 5–7)
> First real analysis output.

- [ ] Settings panel: API key management (OpenAI, Anthropic, Google)
- [ ] Keys stored securely via Tauri secure storage (OS keychain)
- [ ] Single-model analysis: send dream → get response → display
- [ ] Parallel multi-model analysis (run all configured models simultaneously)
- [ ] Side-by-side comparison panel for model outputs
- [ ] Analysis output saved alongside dream file (`.dream.analysis.json`)
- [ ] Basic loading/streaming UI while models respond

## Phase 3 — Suspicion Flagging (Week 8–9)
> The clinical intelligence layer.

- [ ] Flag engine: keyword + semantic matching per `.dreamconfig`
- [ ] In-editor flag highlights (underline / sidebar marker)
- [ ] Cross-session pattern detection (appears in 2+ sessions → flag)
- [ ] Flag summary panel in Inspector
- [ ] Manual flag override (clinician can confirm or dismiss)
- [ ] `soul.md` auto-update: after each session, AI proposes updates

## Phase 4 — Polish & Distribution (Week 10–12)
> Looks like a real product.

- [ ] Zed-level UI polish pass (typography, spacing, transitions)
- [ ] Onboarding flow (first launch: create first patient project)
- [ ] Export: session report as PDF or Markdown
- [ ] Ollama support (local models, fully offline)
- [ ] Auto-update via Tauri Updater + GitHub Releases
- [ ] macOS app signing & notarization
- [ ] `.dmg` installer published to GitHub Releases
- [ ] Landing page update on dreamverge.ilgaraydogan.com.tr

## Phase 5 — Community & Ecosystem (Post v1.0)
> Open source growth.

- [ ] Plugin/extension API (community-built model adapters)
- [ ] Turkish + English localization
- [ ] Symbol library: curated dream symbol database
- [ ] Template system for `.dreamconfig` (e.g., "Jungian analysis mode")
- [ ] Community dream analysis prompts repository
- [ ] TestFlight-style beta channel via GitHub pre-releases

---

## Version Plan

| Version | Goal |
|---|---|
| v0.1.0 | Phase 0 complete — skeleton app |
| v0.2.0 | Phase 1 complete — editor works |
| v0.5.0 | Phase 2 complete — first AI output |
| v0.8.0 | Phase 3 complete — flagging works |
| v1.0.0 | Phase 4 complete — public release |

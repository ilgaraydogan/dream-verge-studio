# Contributing to Dream Verge Studio

Thank you for your interest in contributing. This document explains how to get involved.

---

## Development Setup

### Requirements
- macOS 13+
- Node.js 18+
- Rust (latest stable via rustup)
- Xcode Command Line Tools (`xcode-select --install`)

### Steps
```bash
git clone https://github.com/ilgaraydogan/dream-verge-studio
cd dream-verge-studio
npm install
npm run tauri dev
```

---

## Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Always builds. Always releasable. |
| `dev` | Active integration. PRs go here. |
| `feature/<name>` | Individual features. Branch from `dev`. |

Never push directly to `main`.

---

## Submitting a PR

1. Branch from `dev`
2. Make your changes
3. Run `npm run lint` and `npm test` — both must pass
4. Write a clear PR description: what changed, why, how to test
5. Reference the related issue (`Closes #123`)

---

## Reporting a Bug

Use the Bug Report issue template on GitHub. Include:
- macOS version
- Steps to reproduce
- Expected vs actual behavior
- Logs from the Tauri dev console if available

---

## Feature Requests

Use the Feature Request template. Explain the clinical or practical use case — not just the technical ask.

---

## AI System Prompts

The prompts used for dream analysis are in `PROMPTS.md`. They are community-reviewable and improvable via PR. If you are a mental health professional with suggestions for improving the clinical quality of analysis prompts, your input is especially welcome.

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

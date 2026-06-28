# Form Filler Extension — Project Overview

> **Canonical project documentation for AI coding assistants.**  
> High-level orientation only — read source files for current behavior.

---

## What This Project Is

A **Chrome Extension (Manifest V3)** that auto-fills job application and similar web forms. The user opens the popup on a page; a content script scans the DOM, matches fields to a personal answer config, and fills **empty fields only**.

**Core idea:** config-driven fuzzy matching — no hard-coded form layouts. Patterns and thresholds live in committed config; personal values live in a gitignored data file.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Language | TypeScript |
| Extension build | Vite + `@crxjs/vite-plugin` |
| Popup UI | React |
| Fuzzy matching | `fuzzball` |
| Extension API | Chrome MV3 |

---

## Architecture

```
Popup (React)  ──RUN_FILLER──►  Content Script
       ◄──FILLER_RESULT──              │
                                      ▼
                    Extract → Resolve → Log → Patch
                                      │
                         ANSWERS_CONFIG + ANSWERS_DATA
```

| Stage | Service | Role |
|-------|---------|------|
| Extract | `FormExtractor` | Find fillable controls; collect question hints |
| Resolve | `AnswerResolver` | Match hints to config; look up answers |
| Log | `Logger` | Console JSON for tuning unmatched fields |
| Patch | `FormPatcher` | Write answers into empty fields |

---

## Key Directories

| Path | Purpose |
|------|---------|
| `src/content/` | Content script; runs the pipeline |
| `src/popup/` | Extension popup UI |
| `src/services/` | Extract, resolve, patch, log |
| `src/utils/` | Shared helpers (DOM, matching, normalization) |
| `src/config/answers.config.ts` | Question patterns + thresholds (**committed**) |
| `src/data/answers.data.ts` | Personal answers (**gitignored**) |
| `src/data/answers.data.example.ts` | Template for personal answers |
| `src/form/` | Local HTML test form |
| `manifest.config.ts` | Extension manifest |
| `vite.config.ts` | Build config |

---

## Config vs Data

- **`answers.config.ts`** — what questions to recognize (patterns, thresholds, `QuestionIdEnum`). Safe to commit.
- **`answers.data.ts`** — your actual answers. **Never commit.** Copy from `answers.data.example.ts`.
- Adding a new question type usually touches: `QuestionIdEnum`, `answers.config.ts`, and both data files.

---

## Build & Development

```bash
npm ci
cp src/data/answers.data.example.ts src/data/answers.data.ts
# edit src/data/answers.data.ts

npm run dev    # watch build → dist/
npm run build  # production build
```

Load `dist/` as an unpacked extension in `chrome://extensions`. Test with `src/form/index.html` or live ATS pages.

---

## Conventions

1. **Read source before editing** — this doc is orientation, not a spec.
2. **Pipeline order** — extract → resolve → log → patch.
3. **Never overwrite filled fields** — patching is non-destructive.
4. **Never commit personal data** — only `answers.data.ts` holds PII.
5. **Run `npm run build`** after substantive changes.

---

## Common Tasks

| Task | Start here |
|------|------------|
| Add / change an answer | `answers.config.ts`, `QuestionIdEnum`, data files |
| Improve field detection | `FormExtractor`, `utils/collectQuestionHints.ts` |
| Change matching | `utils/matchQuestion.ts`, config thresholds |
| Fix fill not sticking (SPAs) | `FormPatcher`, `utils/domForm.ts` |
| Popup UI | `src/popup/` |
| Debug unmatched fields | Browser console while extension runs |

---

## Related Docs

- `README.md` — human setup instructions
- Source JSDoc — per-file behavior

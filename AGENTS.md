# Form Filler Extension — Project Overview

> **Canonical project documentation for AI coding assistants.**  
> Use this file (Cursor, Claude, GitHub Copilot, etc.) to understand the codebase before editing.  
> For implementation details, read the source files referenced here — this document does not contain code.

---

## What This Project Is

A **Chrome Extension (Manifest V3)** that auto-fills job application and similar web forms. The user clicks the extension popup on any page; a content script scans the DOM, matches each field label to a personal answer config, and writes values into empty fields only.

**Core idea:** config-driven fuzzy matching — no hard-coded form layouts. Answers live in a user-specific config file; the engine extracts labels, scores them against patterns, and patches the DOM.

**Primary use case:** speeding up repetitive job-application forms (name, email, work authorization, etc.) across different ATS sites.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Language | TypeScript |
| Extension build | Vite + `@crxjs/vite-plugin` |
| Popup UI | React 19 |
| Styling | Tailwind CSS (popup), CSS modules (popup component) |
| Extension API | Chrome MV3 (`activeTab`, content scripts, `chrome.tabs.sendMessage`) |
| Package manager | npm |

---

## High-Level Architecture

```
┌─────────────┐     RUN_FILLER      ┌──────────────────┐
│ Popup (React)│ ──────────────────► │ Content Script   │
│ src/popup/  │ ◄── FILLER_RESULT ── │ src/content/     │
└─────────────┘                     └────────┬─────────┘
                                             │
                    ┌────────────────────────┼────────────────────────┐
                    ▼                        ▼                        ▼
             FormExtractor            AnswerResolver              FormPatcher
             (DOM → metadata)    (config → answers)         (answers → DOM)
                    │                        │                        │
                    └────────────────────────┴────────────────────────┘
                                             │
                                    ANSWERS_CONFIG
                                    src/config/
```

### Fill pipeline (content script)

1. **Extract** — `FormExtractor` walks the page for visible, enabled `input`, `select`, and `textarea` elements. Builds `ExtractedInput` objects (label text, type, options, current value, context).
2. **Resolve** — `AnswerResolver` matches each field’s label against `ANSWERS_CONFIG` using fuzzy pattern scoring. Skips already-filled fields. Produces `ResolvedPatch` objects (answer or skip reason).
3. **Log** — `Logger` prints JSON `{ request, response }` per field to the console (for tuning config on unmatched questions).
4. **Patch** — `FormPatcher` applies answers to empty fields only. Dispatches `input`/`change`/`blur` events so React/Vue forms detect changes.

### Matching model

- Config entries have **patterns** (strings or RegExp), a **threshold** (0–100), and an **answer**.
- **First matching entry wins** — order in config matters; put specific patterns before generic ones.
- **Sub-patterns** on an entry can override the default answer for narrower label variants.
- For selects/radios, answers are snapped to the **closest option label** via substring matching.

### Skip behavior

Fields are skipped when already filled, when no config entry matches, or when patching fails safely. Patched/skipped/error counts are returned to the popup.

---

## Complete File Structure

```
form-fill-extension/
├── AGENTS.md                    # This file — AI/project overview
├── README.md                    # Human setup & build instructions
├── package.json
├── package-lock.json
├── manifest.config.ts           # Chrome extension manifest (MV3)
├── vite.config.ts               # Vite + CRXJS build config
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── .gitignore
├── .prettierrc
├── .prettierignore
│
├── public/
│   └── icons/
│       └── icon48.png           # Extension icon
│
├── dist/                        # Build output — load as unpacked extension
│
├── src/
│   ├── content/
│   │   └── index.ts             # Content script entry; message handler + pipeline
│   │
│   ├── popup/
│   │   ├── index.html           # Popup shell
│   │   ├── index.tsx            # React mount point
│   │   ├── index.css            # Popup global styles (Tailwind)
│   │   ├── Popup.tsx            # Popup UI (auto-runs filler on open)
│   │   └── Popup.module.css     # Popup component styles
│   │
│   ├── services/
│   │   ├── FormExtractor.ts     # DOM scanning & label resolution
│   │   ├── AnswerResolver.ts    # Config matching & answer resolution
│   │   ├── FormPatcher.ts       # Writes values into form controls
│   │   └── Logger.ts            # Console logging for config tuning
│   │
│   ├── utils/
│   │   ├── normalizeText.ts     # Lowercase, strip punctuation, collapse whitespace
│   │   ├── matchQuestion.ts     # Fuzzy pattern scoring (LCS + RegExp)
│   │   └── findClosestOption.ts # Best option index for select/radio answers
│   │
│   ├── interfaces/              # Shared data shapes (see section below)
│   ├── types/                   # Chrome message types
│   ├── enums/
│   │   ├── InputTypeEnum.ts     # Normalized HTML input kinds
│   │   └── QuestionIdEnum.ts    # IDs linking pattern config to personal answers
│   │
│   ├── config/
│   │   └── answers.config.ts        # Question patterns + thresholds (committed)
│   │
│   ├── data/
│   │   ├── answers.data.example.ts  # Example personal answers (committed template)
│   │   └── answers.data.ts          # Personal answers — GITIGNORED
│   │
│   ├── form/
│   │   ├── index.html           # Local test form (job application mock)
│   │   └── styles.css           # Test form styles
│   │
│   └── vite-env.d.ts
│
└── .vscode/
    └── settings.json
```

**Not in repo / generated:** `node_modules/`, `dist/` (after build), `src/data/answers.data.ts` (local only).

---

## Folder Guide

### `src/content/`

Runs in the context of every web page (`<all_urls>`, `document_idle`). Listens for `RUN_FILLER` from the popup, orchestrates the four services, responds with `FILLER_RESULT`. **This is the runtime heart of the extension.**

### `src/popup/`

Small React app shown when the user clicks the extension icon. On mount it messages the active tab’s content script and displays patched/skipped/error summary. No config editing in UI — config is file-based.

### `src/services/`

Business logic layer. Keep DOM side effects in `FormExtractor` / `FormPatcher`; keep matching logic in `AnswerResolver`; keep pure helpers in `utils/`.

### `src/utils/`

Stateless helpers used by services. No Chrome APIs, no config imports.

### `src/interfaces/`

TypeScript interfaces describing data passed between pipeline stages. Prefer adding new shapes here rather than inline types in services.

### `src/types/`

Chrome extension message contracts between popup and content script.

### `src/enums/`

Shared enumerations. `InputTypeEnum` is re-exported from `src/types/InputTypeEnum.ts` for convenient imports in interfaces.

### `src/config/`

Question pattern config — `answers.config.ts` with patterns, thresholds, and `QuestionIdEnum` references (committed).

### `src/data/`

Personal answer values — `answers.data.ts` keyed by `QuestionIdEnum` (gitignored). Template: `answers.data.example.ts`.

**Never commit real personal data.** Add patterns in `answers.config.ts`; add values in `src/data/answers.data.ts`.

### `src/form/`

Standalone HTML test page mimicking a job application. Open in browser during development to exercise the extension without visiting live ATS sites.

### Root config files

- `manifest.config.ts` — extension name, permissions, content script registration, popup path.
- `vite.config.ts` — bundles popup (React) and content script via CRXJS.

---

## Services (Detail)

### FormExtractor

**File:** `src/services/FormExtractor.ts`

Scans a DOM subtree (default: `document`) for fillable controls. Filters out hidden, disabled, and non-interactive inputs (hidden, submit, button, file, etc.).

For each element, resolves:
- **labelText** — from `<label for>`, `aria-label`, `aria-labelledby`, placeholder, sibling text, or `name` attribute
- **inputType** — mapped to `InputTypeEnum`
- **options** — option labels for `<select>` and radio/checkbox groups
- **currentValue** — existing value or selection
- **contextText** — surrounding section/heading text for disambiguation

Returns `ExtractedInput[]`.

### AnswerResolver

**File:** `src/services/AnswerResolver.ts`

Takes `ExtractedInput[]`, `AnswerConfigEntry[]` (from `ANSWERS_CONFIG`), and `Record<QuestionIdEnum, string>` (from `ANSWERS_DATA`). For each input:

1. Skip if `isAlreadyFilled` (non-empty text, select index > 0, checked radio/checkbox)
2. Find first config entry where `QuestionMatcher.matches(label, threshold, patterns)`
3. Apply `subPatterns` overrides if any match
4. Snap answer to closest option label when options exist

Returns `ResolvedPatch[]` with `answer`, `configIndex`, or `skippedReason` (`already_filled` | `no_match` | `below_threshold`).

Also exposes `getLogRequest()` for structured console logging.

### FormPatcher

**File:** `src/services/FormPatcher.ts`

Applies `ResolvedPatch[]` to the live DOM. **Never overwrites non-empty fields.**

Per input type:
- **Text / textarea / email / tel / etc.** — set `value` if empty
- **Select** — pick closest option if `selectedIndex` is 0 (placeholder)
- **Radio** — check closest label in group if none selected
- **Checkbox** — check if answer is truthy (`yes`, `true`, `1`, `on`)

Fires synthetic events after each change so SPA frameworks react.

Returns `PatchResult` (`patched`, `skipped`, `errors[]`).

### Logger

**File:** `src/services/Logger.ts`

Logs `{ request: LogRequest, response: string | null }` as JSON to `console.log`. Used to discover unmatched field labels while browsing real forms.

---

## Utilities

| File | Role |
|------|------|
| `normalizeText.ts` | Canonical string normalization for all comparisons |
| `matchQuestion.ts` | Scores question vs pattern; RegExp = binary, string = substring/LCS % |
| `findClosestOption.ts` | Exact match first, then longest overlapping substring |

---

## Interfaces & Types

### Pipeline data (`src/interfaces/`)

| File | Purpose |
|------|---------|
| `ExtractedInput.ts` | One scanned form field + metadata + DOM element reference |
| `AnswerConfigEntry.ts` | Config rule: patterns, threshold, questionId, optional subPatterns |
| `SubPatternEntry.ts` | Narrower pattern set overriding parent via questionId |
| `Pattern.ts` | `string \| RegExp` |
| `ResolvedPatch.ts` | Field + resolved answer or skip reason |
| `SkippedReason.ts` | Union of skip causes |
| `PatchResult.ts` | Aggregate patch outcome |
| `PatchError.ts` | Per-field patch failure |
| `LogRequest.ts` | Label + optional options for logging |

### Messages (`src/types/`)

| File | Direction | Purpose |
|------|-----------|---------|
| `RunFillerMessage.ts` | Popup → Content | `{ type: 'RUN_FILLER' }` |
| `FillerResultMessage.ts` | Content → Popup | `{ type: 'FILLER_RESULT', result, error? }` |
| `ContentMessage.ts` | Alias for messages content script accepts |
| `PopupMessage.ts` | Alias for messages popup receives |

---

## Answer Config

**Patterns:** `src/config/answers.config.ts` (committed)  
**Personal answers:** `src/data/answers.data.ts` (gitignored)  
**Template:** `src/data/answers.data.example.ts`

Each entry shape (`AnswerConfigEntry`):
- `patterns` — strings and/or RegExp to match normalized label text
- `threshold` — minimum match score (0–100)
- `questionId` — key into `src/data/answers.data.ts` (`QuestionIdEnum`)
- `subPatterns` (optional) — ordered overrides with their own patterns/threshold/questionId

**Ordering rule:** first match wins. Group entries by topic (identity, contact, work auth, etc.); put specific labels before broad ones (e.g. "first name" before "name").

**Tuning workflow:** run extension on a form → read console logs from `Logger` → add/adjust patterns in `answers.config.ts` and values in `src/data/answers.data.ts` → rebuild/reload extension.

---

## Extension Permissions & Manifest

Defined in `manifest.config.ts`:
- **Popup** at `src/popup/index.html`
- **Content script** on all URLs at idle
- **Permissions:** `activeTab`, `scripting`
- **Host permissions:** `<all_urls>`

---

## Build & Development

```bash
npm ci
cp src/data/answers.data.example.ts src/data/answers.data.ts
# edit src/data/answers.data.ts with personal answers

npm run dev    # watch build → dist/
npm run build  # production build
```

Load `dist/` as an unpacked extension in `chrome://extensions`.

Test locally with `src/form/index.html` (open as file or via dev server).

---

## Conventions for AI Agents Editing This Repo

1. **Read before edit** — use this file to locate the right service; read that file for behavior and JSDoc.
2. **Pipeline order** — extract → resolve → log → patch. New field types need changes in both `FormExtractor` and `FormPatcher` (and possibly `AnswerResolver.isAlreadyFilled`).
3. **Matching changes** — prefer `utils/matchQuestion.ts` and `utils/findClosestOption.ts` over duplicating logic in services.
4. **Config changes** — edit `answers.config.ts` for patterns; edit `answers.data.example.ts` when adding new `QuestionIdEnum` values. Never put real PII in committed files. User data belongs only in gitignored `src/data/answers.data.ts`.
5. **Messages** — if adding popup ↔ content communication, extend types in `src/types/` and handle in `src/content/index.ts` and `src/popup/Popup.tsx`.
6. **Skip filled fields** — patching must remain non-destructive; do not overwrite user-entered values.
7. **No tests directory yet** — manual testing via `src/form/` and live sites.
8. **Style** — match existing patterns: class-based services, static utility classes, interfaces in `interfaces/`, JSDoc on public APIs.
9. **Build** — run `npm run build` after substantive changes to verify TypeScript compiles.

---

## Common Tasks → Where to Look

| Task | Primary files |
|------|----------------|
| Add a new answer category | `src/config/answers.config.ts`, `src/enums/QuestionIdEnum.ts`, `src/data/answers.data.example.ts` |
| Improve label detection | `src/services/FormExtractor.ts` |
| Change matching sensitivity | `src/utils/matchQuestion.ts`, config `threshold` values |
| Support new input type | `FormExtractor`, `FormPatcher`, `InputTypeEnum`, `AnswerResolver.isAlreadyFilled` |
| Change popup UI | `src/popup/Popup.tsx`, `Popup.module.css` |
| Change when script runs | `manifest.config.ts`, `src/content/index.ts` |
| Debug unmatched fields | Browser console (Logger output) while extension runs |

---

## Related Docs

- `README.md` — short human-facing setup and build commands
- Source JSDoc — per-function documentation in each `.ts` file

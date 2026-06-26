# Form Filler Chrome Extension

Auto-fills job application forms using a config-driven matching engine.

> **AI / project overview:** see [AGENTS.md](./AGENTS.md) for architecture, file map, and conventions.

## Setup

```bash
npm ci
cp src/data/answers.data.example.ts src/data/answers.data.ts
```

Edit `src/data/answers.data.ts` with your personal answers. This file is gitignored. Question patterns live in `src/config/answers.config.ts` (committed).

## Development

```bash
npm run dev
```

Load the `dist` folder as an unpacked extension in `chrome://extensions`.

## Build

```bash
npm run build
```

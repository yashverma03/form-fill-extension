# Form Filler Chrome Extension

Auto-fills job application forms using a config-driven matching engine.

> **AI / project overview:** see [AGENTS.md](./AGENTS.md) for architecture, file map, and conventions.

## Setup

```bash
npm ci
cp src/config/answers.config.example.ts src/config/answers.config.ts
```

Edit `src/config/answers.config.ts` with your personal data. This file is gitignored and will not be committed.

## Development

```bash
npm run dev
```

Load the `dist` folder as an unpacked extension in `chrome://extensions`.

## Build

```bash
npm run build
```

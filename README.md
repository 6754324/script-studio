# Script Studio

A screenplay & shot-list workbench for film and broadcast writers. Structure a story into
scenes (场), tag each scene with the classical 起承转合 narrative beat, write per-shot
分镜 (shot size / camera move / subject / line / audio), and export an industry-format
screenplay as text.

## Features

- **Scene editor** — slug, location, time-of-day, interior/exterior, beat, duration, plot
  summary, and which characters appear.
- **Shot list (分镜)** — per scene, order shots with 景别 (远/全/中/近/特), 运镜
  (固定/推/拉/摇/移/跟/升降), 画面, 台词, 音效.
- **AI scene generation** — generate a scene breakdown from a one-line premise via DeepSeek.
  Falls back to a canned demo structure when no API key is configured, so the app is fully
  runnable offline.
- **Structure analysis** — checks 起承转合 coverage and flags missing beats or beats without
  shots.
- **Export** — industry screenplay format (场号 / 场景 / 内·外景 / 时间 / 人物 / 分镜) as
  copyable text or a `.txt` download.

## The self-developed core

The parts that make this more than a form are a small pure-TypeScript engine under
[`src/engine`](src/engine):

| Module | Responsibility |
| --- | --- |
| [`duration.ts`](src/engine/duration.ts) | Parses `90` / `1:30` / `0:01:30` into seconds and formats back. |
| [`format.ts`](src/engine/format.ts) | Turns structured scenes into an industry screenplay or a single-scene shot list. |
| [`stats.ts`](src/engine/stats.ts) | Computes scene/shot/时长 totals and runs the 起承转合 structure analysis. |

All three are unit-tested in [`src/engine/engine.test.ts`](src/engine/engine.test.ts)
(14 tests). The AI layer ([`src/ai/generate.ts`](src/ai/generate.ts)) is deliberately
isolated from this engine — it only produces suggestions, which then flow through the same
editor and formatter as hand-written scenes.

## Tech

React 19 · TypeScript (strict) · Vite · Tailwind CSS 4 · Zustand (persisted state) · Vitest

## AI setup

To use live generation, paste a DeepSeek API key in the left panel. The browser calls the
serverless proxy at [`api/generate.ts`](api/generate.ts) (deployed on Vercel), which forwards
to DeepSeek. Without a key the app uses the built-in demo. You can also set a
`DEEPSEEK_API_KEY` environment variable on the deployment instead of pasting a key per-user.

## Develop

```bash
npm install
npm run dev      # local dev server
npm test         # unit tests
npm run build    # type-check + production build
```

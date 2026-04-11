# Midnight Electric — Design System Roadmap

## ✅ Done (v1.1)

- [x] Content/prose tokens (`--prose-*`)
- [x] Semantic color tokens for API content (`--color-endpoint`, `--color-param`, etc.)
- [x] Token aliases (`--color-bg-*`, `--color-text-*`, `--color-border-*`)
- [x] Noise texture overlay (SVG fractalNoise, 2.5% opacity)
- [x] Keyboard navigation (j/k section scroll)
- [x] API doc extensions (ApiMethod, ApiEndpoint, ApiParams)
- [x] Dark-only enforcement (forceColorScheme)
- [x] Google Fonts integration (Bricolage Grotesque, DM Sans, JetBrains Mono)
- [x] Mantine theme override with ME tokens

## 🔜 Next (v1.2)

### Architecture
- [ ] **Core + Domain layers** — Split tokens into `core/tokens.css` (reusable) + `domain/api-docs.css` (documentation-specific)
- [ ] **Feature flags / variants** — `data-variant="reader|editor"` on components
- [ ] **Density modes** — `data-density="compact|comfortable|cozy"` on `<html>`, spacing tokens × 0.75/1.0/1.15

### UX Patterns
- [ ] **Inline RichTooltip** — Markdown-rendered tooltips with code, links, lists
- [ ] **Sticky context** — Sticky sub-header with current section, progress bar, "Jump to section"
- [ ] **Extended keyboard shortcuts** — `g h` → home, `g d` → docs, `/` → search, `e` → edit, `?` → help
- [ ] **Context-aware empty states** — Empty table, empty response, empty section, empty page
- [ ] **Optimistic UI patterns** — Inline spinners, "saved 2s ago" badges, undo toasts
- [ ] **Presence indicators** — Avatar bar with live dots, inline cursors

### Visual Language
- [ ] **Reading font** — Source Serif Pro / Literata for article prose (optional toggle)
- [ ] **Illustrations** — Geometric SVG compositions for empty states, errors, onboarding

### Infrastructure
- [ ] **Token versioning** — `--deprecated-*` tokens for 1 version before removal
- [ ] **Component playground** — Interactive props editor with live preview + copy snippet
- [ ] **Migration guides** — v1 → v2 guide with codemods

### Strategic
- [ ] **Public demo landing** — midnight-electric.dev with hero, features, getting started
- [ ] **CONTRIBUTING.md** — Component proposal → review → merge workflow
- [ ] **Version selector** — API version dropdown (v1/v2/v3)
- [ ] **Changelog timeline** — Vertical changelog with date grouping, diff highlighting

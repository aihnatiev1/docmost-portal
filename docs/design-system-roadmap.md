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

## ✅ Done (v1.2)

### Architecture
- [x] **Core + Domain layers** — Section headers separating core tokens (reusable) from domain tokens (docs-specific)
- [x] **Feature flags / variants** — `data-variant="reader|editor|api-reference"` with scoped token overrides
- [x] **Density modes** — `data-density="compact|cozy"` with scaled spacing/text tokens

### UX Patterns
- [x] **Sticky context** — Floating header showing current section on scroll
- [x] **Extended keyboard shortcuts** — `g→h` home, `g→d` docs, `/` search, `?` help overlay, j/k scroll
- [x] **Context-aware empty states** — CSS patterns: default/inline/compact variants

### Infrastructure
- [x] **Token versioning** — Deprecation markers for `--accent-glow`, `--gradient-soft`
- [x] **CONTRIBUTING.md** — Component proposal → review → merge workflow, naming conventions

## 🔜 Next (v1.3)

### UX Patterns
- [ ] **Inline RichTooltip** — Markdown-rendered tooltips with code, links, lists
- [ ] **Optimistic UI patterns** — Inline spinners, "saved 2s ago" badges, undo toasts
- [ ] **Presence indicators** — Avatar bar with live dots, inline cursors

### Visual Language
- [ ] **Reading font** — Source Serif Pro / Literata for article prose (optional toggle)
- [ ] **Illustrations** — Geometric SVG compositions for empty states, errors, onboarding

### Infrastructure
- [ ] **Component playground** — Interactive props editor with live preview + copy snippet
- [ ] **Migration guides** — v1 → v2 guide with codemods

### Strategic
- [ ] **Public demo landing** — midnight-electric.dev with hero, features, getting started
- [ ] **Version selector** — API version dropdown (v1/v2/v3)
- [ ] **Changelog timeline** — Vertical changelog with date grouping, diff highlighting

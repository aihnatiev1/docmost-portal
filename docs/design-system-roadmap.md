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

- [x] **Core + Domain layers** — Section headers separating core from domain tokens
- [x] **Feature flags / variants** — `data-variant="reader|editor|api-reference"`
- [x] **Density modes** — `data-density="compact|cozy"`
- [x] **Sticky context** — Floating header showing current section
- [x] **Extended keyboard shortcuts** — g→h, g→d, /, ?, j/k
- [x] **Context-aware empty states** — default/inline/compact variants
- [x] **Token versioning** — Deprecation markers
- [x] **CONTRIBUTING.md** — Component workflow guide

## ✅ Done (v1.3)

- [x] **Inline RichTooltip** — Hover tooltips with code, links, lists
- [x] **Optimistic UI patterns** — Spinner, saved badge, diff badge, undo action
- [x] **Presence indicators** — Avatar bar with overlap, status dots, count
- [x] **Reading font** — Literata (serif) via `--font-reading` token
- [x] **Illustrations** — Geometric SVG shapes for empty states (error/empty variants)
- [x] **Changelog timeline** — Vertical line with typed dots (feature/fix/breaking)

## 🔜 Future (v2.0)

- [ ] **Component playground** — Interactive props editor with live preview + copy snippet
- [ ] **Migration guides** — v1 → v2 guide with codemods
- [ ] **Public demo landing** — midnight-electric.dev
- [ ] **Version selector** — API version dropdown (v1/v2/v3)

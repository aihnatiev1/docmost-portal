# Contributing to Midnight Electric

## Adding a new component

1. **Propose** — Open an issue describing the component, its use cases, and API
2. **Design** — Create a static HTML demo following the Four Principles
3. **Implement** — Add as TipTap extension in `packages/editor-ext/src/lib/`
4. **Style** — Use only design tokens from `tokens.css`, no hardcoded values
5. **Test** — Add tests in `__tests__/` directory
6. **Document** — Add to Storybook (`08-storybook.html`)

## Token naming

- Surfaces: `--bg-{level}` (000-400)
- Text: `--text-{level}` (100-500)
- Semantic: `--color-{purpose}` (endpoint, param, type, etc.)
- Aliases: `--color-{category}-{variant}` (bg-page, text-primary, border-default)

## Commit style

```
feat: add ApiMethod badge component
fix: correct indigo hover state
docs: update Storybook with new examples
```

## Review checklist

- [ ] Uses design tokens, no hardcoded colors
- [ ] Works in dark mode (only mode)
- [ ] Follows the Four Principles (Quiet Depth, Precise Motion, Typographic Calm, Electric Restraint)
- [ ] Responsive (desktop + mobile)
- [ ] Accessible (WCAG AA minimum)
- [ ] Has tests

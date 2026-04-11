/**
 * Sticky context: shows current section name in a floating header
 * when user scrolls past the first heading in documentation.
 */
export function initStickyContext() {
  let stickyEl: HTMLElement | null = null;

  const createStickyEl = () => {
    if (stickyEl) return stickyEl;
    stickyEl = document.createElement('div');
    stickyEl.id = 'sticky-context';
    stickyEl.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; z-index: 199;
      background: var(--bg-000, #07080C);
      border-bottom: 1px solid var(--border-soft, #171A23);
      padding: 6px 24px;
      font-family: var(--font-mono, 'JetBrains Mono', monospace);
      font-size: 11px;
      color: var(--text-400, #5C6475);
      letter-spacing: 0.04em;
      transform: translateY(-100%);
      transition: transform 200ms var(--ease-out, cubic-bezier(0.16, 1, 0.3, 1));
      pointer-events: none;
      display: flex;
      align-items: center;
      gap: 8px;
    `;
    document.body.appendChild(stickyEl);
    return stickyEl;
  };

  let currentSection = '';
  let ticking = false;

  const update = () => {
    const headings = document.querySelectorAll('.ProseMirror h1, .ProseMirror h2, .ProseMirror h3, .docs-portal h1, .docs-portal h2, .docs-portal h3');
    if (headings.length === 0) {
      if (stickyEl) stickyEl.style.transform = 'translateY(-100%)';
      return;
    }

    const scrollY = window.scrollY;
    let activeHeading = '';

    for (const h of headings) {
      const top = (h as HTMLElement).getBoundingClientRect().top + scrollY;
      if (top <= scrollY + 80) {
        activeHeading = (h as HTMLElement).textContent || '';
      }
    }

    const el = createStickyEl();
    if (activeHeading && scrollY > 200) {
      if (activeHeading !== currentSection) {
        currentSection = activeHeading;
        el.textContent = `§ ${currentSection}`;
      }
      el.style.transform = 'translateY(0)';
    } else {
      el.style.transform = 'translateY(-100%)';
      currentSection = '';
    }
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => { update(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });
}

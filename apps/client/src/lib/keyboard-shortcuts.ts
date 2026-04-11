/**
 * Register global keyboard shortcuts for developer-friendly navigation.
 * Uses the ME utilities shortcuts system pattern.
 *
 * Shortcuts:
 *   j/k        — scroll by section (next/prev heading)
 *   g then h   — navigate to /home (two-key chord, 500ms window)
 *   g then d   — navigate to first docs space
 *   /          — focus search (trigger Cmd+K spotlight)
 *   ?          — show shortcuts help overlay
 */

let lastKey = '';
let lastKeyTimer: ReturnType<typeof setTimeout> | null = null;

function clearLastKey() {
  lastKey = '';
  if (lastKeyTimer) {
    clearTimeout(lastKeyTimer);
    lastKeyTimer = null;
  }
}

function setLastKey(key: string) {
  clearLastKey();
  lastKey = key;
  lastKeyTimer = setTimeout(clearLastKey, 500);
}

function showShortcutsHelp() {
  const existing = document.getElementById('me-shortcuts-help');
  if (existing) {
    existing.remove();
    return;
  }

  const overlay = document.createElement('div');
  overlay.id = 'me-shortcuts-help';
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(7, 8, 12, 0.75);
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-body, 'DM Sans', sans-serif);
    backdrop-filter: blur(4px);
  `;

  const card = document.createElement('div');
  card.style.cssText = `
    background: var(--bg-100, #0F1219);
    border: 1px solid var(--border, #1E2230);
    border-radius: 12px;
    padding: 24px 32px;
    max-width: 420px; width: 90%;
    box-shadow: 0 24px 48px -16px rgba(0,0,0,0.65);
    color: var(--text-200, #C2C6D4);
    font-size: 14px; line-height: 1.7;
  `;

  const shortcuts = [
    ['j', 'Next heading'],
    ['k', 'Previous heading'],
    ['g → h', 'Go to Home'],
    ['g → d', 'Go to first docs space'],
    ['/', 'Focus search (⌘K)'],
    ['?', 'Toggle this help'],
  ];

  const title = `<div style="font-family: var(--font-display, 'Bricolage Grotesque', sans-serif); font-size: 18px; font-weight: 600; color: var(--text-100, #ECEEF2); margin-bottom: 16px;">Keyboard Shortcuts</div>`;

  const rows = shortcuts.map(([key, desc]) =>
    `<div style="display:flex;justify-content:space-between;padding:4px 0;">
      <kbd style="font-family:var(--font-mono,'JetBrains Mono',monospace);font-size:12px;background:var(--bg-200,#181B24);padding:2px 8px;border-radius:4px;color:var(--text-100,#ECEEF2);">${key}</kbd>
      <span style="color:var(--text-300,#8B92A5);">${desc}</span>
    </div>`
  ).join('');

  card.innerHTML = title + rows + `<div style="margin-top:16px;text-align:center;font-size:11px;color:var(--text-400,#5C6475);">Press <kbd style="font-family:var(--font-mono,'JetBrains Mono',monospace);font-size:11px;">?</kbd> or <kbd style="font-family:var(--font-mono,'JetBrains Mono',monospace);font-size:11px;">Esc</kbd> to close</div>`;
  overlay.appendChild(card);

  const close = () => overlay.remove();
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', function handler(e) {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', handler); }
  });

  document.body.appendChild(overlay);
}

export function registerGlobalShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Skip if user is typing in an input/editor
    const target = e.target as HTMLElement;
    const isEditable = target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true' ||
      target.closest('.ProseMirror');
    if (isEditable) return;

    // ── Two-key chords: g → h (home), g → d (docs) ──
    if (lastKey === 'g' && !e.metaKey && !e.ctrlKey) {
      if (e.key === 'h') {
        clearLastKey();
        window.location.href = '/home';
        return;
      }
      if (e.key === 'd') {
        clearLastKey();
        // Navigate to first docs space — find sidebar space link
        const spaceLink = document.querySelector('a[href*="/s/"]') as HTMLAnchorElement | null;
        if (spaceLink) {
          spaceLink.click();
        } else {
          window.location.href = '/home';
        }
        return;
      }
      clearLastKey();
    }

    if (e.key === 'g' && !e.metaKey && !e.ctrlKey) {
      setLastKey('g');
      return;
    }

    // / — focus search (trigger Cmd+K spotlight)
    if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      // Dispatch Cmd+K / Ctrl+K to trigger Mantine Spotlight
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      document.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'k',
        code: 'KeyK',
        metaKey: isMac,
        ctrlKey: !isMac,
        bubbles: true,
      }));
      return;
    }

    // ? — show shortcuts help overlay
    if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
      showShortcutsHelp();
      return;
    }

    // j — next heading
    if (e.key === 'j' && !e.metaKey && !e.ctrlKey) {
      const headings = document.querySelectorAll('.ProseMirror h1, .ProseMirror h2, .ProseMirror h3');
      const scrollY = window.scrollY;
      for (const h of headings) {
        const top = (h as HTMLElement).offsetTop;
        if (top > scrollY + 50) {
          h.scrollIntoView({ behavior: 'smooth', block: 'start' });
          break;
        }
      }
      return;
    }

    // k — previous heading
    if (e.key === 'k' && !e.metaKey && !e.ctrlKey) {
      const headings = Array.from(document.querySelectorAll('.ProseMirror h1, .ProseMirror h2, .ProseMirror h3'));
      const scrollY = window.scrollY;
      for (let i = headings.length - 1; i >= 0; i--) {
        const top = (headings[i] as HTMLElement).offsetTop;
        if (top < scrollY - 10) {
          headings[i].scrollIntoView({ behavior: 'smooth', block: 'start' });
          break;
        }
      }
      return;
    }
  });
}

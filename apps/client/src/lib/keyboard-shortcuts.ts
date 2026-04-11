/**
 * Register global keyboard shortcuts for developer-friendly navigation.
 * Uses the ME utilities shortcuts system pattern.
 */
export function registerGlobalShortcuts() {
  // j/k — scroll by section
  document.addEventListener('keydown', (e) => {
    // Skip if user is typing in an input/editor
    const target = e.target as HTMLElement;
    const isEditable = target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true' ||
      target.closest('.ProseMirror');
    if (isEditable) return;

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

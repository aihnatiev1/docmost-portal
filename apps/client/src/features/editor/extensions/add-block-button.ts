import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { EditorView } from "@tiptap/pm/view";

/**
 * GitBook-style "+" button extension.
 * Renders a "+" button to the left of the drag handle.
 * On click, it focuses the editor at that line and triggers the slash menu by inserting "/".
 */
export const AddBlockButton = Extension.create({
  name: "addBlockButton",

  addProseMirrorPlugins() {
    const editor = this.editor;

    return [
      new Plugin({
        key: new PluginKey("addBlockButton"),
        view(editorView: EditorView) {
          const button = document.createElement("div");
          button.className = "add-block-button hide";
          button.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="8" y1="3" x2="8" y2="13"/><line x1="3" y1="8" x2="13" y2="8"/></svg>`;
          button.setAttribute("role", "button");
          button.setAttribute("aria-label", "Add block");
          button.draggable = false;

          // Track current block position
          let currentNodePos: number | null = null;

          button.addEventListener("mousedown", (e) => {
            e.preventDefault();
            e.stopPropagation();
          });

          button.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (currentNodePos === null) return;

            // Focus editor
            editor.commands.focus();

            // Find the end of the current block and insert a new paragraph with "/"
            const { doc } = editor.state;
            const resolvedPos = doc.resolve(currentNodePos);
            const node = resolvedPos.nodeAfter || resolvedPos.parent;

            if (node) {
              // Move cursor to end of this block
              const endPos = Math.min(
                currentNodePos + (resolvedPos.nodeAfter?.nodeSize || 1),
                doc.content.size
              );

              // Set cursor at the end of the node and insert slash
              editor
                .chain()
                .insertContentAt(endPos, { type: "paragraph" })
                .focus(endPos + 1)
                .run();

              // Small delay to let the new paragraph render, then type "/"
              setTimeout(() => {
                editor.commands.insertContent("/");
              }, 50);
            }
          });

          document.body.appendChild(button);

          // Observe drag handle position to place "+" button next to it
          const observer = new MutationObserver(() => {
            const dragHandle = document.querySelector(
              ".drag-handle:not(.hide)"
            ) as HTMLElement;
            if (dragHandle) {
              const rect = dragHandle.getBoundingClientRect();
              button.style.top = `${rect.top}px`;
              button.style.left = `${rect.left - 22}px`;
              button.classList.remove("hide");
              // Store the pos from the drag handle's data if available
            } else {
              button.classList.add("hide");
            }
          });

          observer.observe(document.body, {
            attributes: true,
            subtree: true,
            attributeFilter: ["style", "class"],
          });

          // Also track mouse position to determine which block we're at
          const handleMouseMove = (e: MouseEvent) => {
            const pos = editorView.posAtCoords({
              left: e.clientX,
              top: e.clientY,
            });
            if (pos) {
              const resolved = editorView.state.doc.resolve(pos.pos);
              // Find the start of the top-level block
              const depth = resolved.depth;
              if (depth > 0) {
                currentNodePos = resolved.before(1);
              } else {
                currentNodePos = pos.pos;
              }
            }
          };

          editorView.dom.addEventListener("mousemove", handleMouseMove);

          return {
            destroy() {
              observer.disconnect();
              editorView.dom.removeEventListener("mousemove", handleMouseMove);
              button.remove();
            },
          };
        },
      }),
    ];
  },
});

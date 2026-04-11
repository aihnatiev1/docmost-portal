import { mergeAttributes, Node } from "@tiptap/core";

function normalizeMethod(value: string): string {
  const upper = (value || "GET").toUpperCase();
  const valid = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];
  return valid.includes(upper) ? upper : "GET";
}

/**
 * Renders a URL string with path parameters in {braces} highlighted.
 * Returns TipTap renderHTML-compatible array structure.
 */
function renderUrlWithParams(url: string): Array<string | [string, Record<string, string>, string]> {
  const parts: Array<string | [string, Record<string, string>, string]> = [];
  const regex = /\{([^}]+)\}/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(url)) !== null) {
    if (match.index > lastIndex) {
      parts.push(url.slice(lastIndex, match.index));
    }
    parts.push([
      "span",
      { class: "api-endpoint-param" },
      `{${match[1]}}`,
    ]);
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < url.length) {
    parts.push(url.slice(lastIndex));
  }

  return parts;
}

export interface ApiEndpointOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    apiEndpoint: {
      setApiEndpoint: (attributes?: {
        method?: string;
        url?: string;
      }) => ReturnType;
    };
  }
}

export const ApiEndpoint = Node.create<ApiEndpointOptions>({
  name: "apiEndpoint",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      method: {
        default: "GET",
        parseHTML: (element: HTMLElement) =>
          normalizeMethod(element.getAttribute("data-method") || "GET"),
        renderHTML: (attributes: Record<string, string>) => ({
          "data-method": normalizeMethod(attributes.method),
        }),
      },
      url: {
        default: "/api/v1/resource",
        parseHTML: (element: HTMLElement) =>
          element.getAttribute("data-url") || "/api/v1/resource",
        renderHTML: (attributes: Record<string, string>) => ({
          "data-url": attributes.url,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: `div[data-type="${this.name}"]`,
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const method = normalizeMethod(HTMLAttributes["data-method"] || "GET");
    const url = HTMLAttributes["data-url"] || "/api/v1/resource";

    return [
      "div",
      mergeAttributes(
        {
          "data-type": this.name,
          "data-method": method,
          "data-url": url,
          class: "api-endpoint",
        },
        this.options.HTMLAttributes,
        HTMLAttributes
      ),
      [
        "span",
        { class: `api-method api-method-${method.toLowerCase()}` },
        method,
      ],
      [
        "span",
        { class: "api-endpoint-url" },
        ...renderUrlWithParams(url),
      ],
    ];
  },

  addCommands() {
    return {
      setApiEndpoint:
        (attributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              method: normalizeMethod(attributes?.method || "GET"),
              url: attributes?.url || "/api/v1/resource",
            },
          });
        },
    };
  },
});

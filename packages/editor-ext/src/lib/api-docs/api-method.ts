import { mergeAttributes, Node } from "@tiptap/core";

export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS";

const VALID_METHODS: HttpMethod[] = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "OPTIONS",
];

function normalizeMethod(value: string): HttpMethod {
  const upper = (value || "GET").toUpperCase() as HttpMethod;
  return VALID_METHODS.includes(upper) ? upper : "GET";
}

export interface ApiMethodOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    apiMethod: {
      setApiMethod: (attributes?: { method?: string }) => ReturnType;
    };
  }
}

export const ApiMethod = Node.create<ApiMethodOptions>({
  name: "apiMethod",
  group: "inline",
  inline: true,
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
          normalizeMethod(
            element.getAttribute("data-method") ||
              element.textContent ||
              "GET"
          ),
        renderHTML: (attributes: Record<string, string>) => ({
          "data-method": normalizeMethod(attributes.method),
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: `span[data-type="${this.name}"]`,
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const method = normalizeMethod(HTMLAttributes["data-method"] || "GET");
    return [
      "span",
      mergeAttributes(
        {
          "data-type": this.name,
          "data-method": method,
          class: `api-method api-method-${method.toLowerCase()}`,
        },
        this.options.HTMLAttributes,
        HTMLAttributes
      ),
      method,
    ];
  },

  addCommands() {
    return {
      setApiMethod:
        (attributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              method: normalizeMethod(attributes?.method || "GET"),
            },
          });
        },
    };
  },
});

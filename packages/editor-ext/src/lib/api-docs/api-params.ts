import { mergeAttributes, Node } from "@tiptap/core";

export interface ApiParam {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

function parseParams(value: string | ApiParam[]): ApiParam[] {
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Builds a TipTap renderHTML-compatible table structure from params.
 */
function buildTableContent(
  params: ApiParam[]
): Array<string | Record<string, string> | any[]> {
  const headerRow = [
    "tr",
    {},
    ["th", { class: "api-params-th" }, "Name"],
    ["th", { class: "api-params-th" }, "Type"],
    ["th", { class: "api-params-th" }, "Required"],
    ["th", { class: "api-params-th" }, "Description"],
  ];

  const thead = ["thead", {}, headerRow];

  const rows = params.map((param) => [
    "tr",
    {},
    [
      "td",
      { class: "api-params-td api-params-name" },
      ["code", {}, param.name || ""],
    ],
    [
      "td",
      { class: "api-params-td api-params-type" },
      ["code", {}, param.type || ""],
    ],
    [
      "td",
      { class: "api-params-td api-params-required" },
      param.required ? "Yes" : "No",
    ],
    ["td", { class: "api-params-td" }, param.description || ""],
  ]);

  const tbody = ["tbody", {}, ...rows];

  return [thead, tbody];
}

export interface ApiParamsOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    apiParams: {
      setApiParams: (attributes?: { params?: string }) => ReturnType;
    };
  }
}

export const ApiParams = Node.create<ApiParamsOptions>({
  name: "apiParams",
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
      params: {
        default: "[]",
        parseHTML: (element: HTMLElement) =>
          element.getAttribute("data-params") || "[]",
        renderHTML: (attributes: Record<string, string>) => ({
          "data-params":
            typeof attributes.params === "string"
              ? attributes.params
              : JSON.stringify(attributes.params),
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
    const paramsRaw = HTMLAttributes["data-params"] || "[]";
    const params = parseParams(paramsRaw);
    const [thead, tbody] = buildTableContent(params);

    return [
      "div",
      mergeAttributes(
        {
          "data-type": this.name,
          "data-params": typeof paramsRaw === "string" ? paramsRaw : JSON.stringify(paramsRaw),
          class: "api-params",
        },
        this.options.HTMLAttributes,
        HTMLAttributes
      ),
      ["table", { class: "api-params-table" }, thead, tbody],
    ];
  },

  addCommands() {
    return {
      setApiParams:
        (attributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              params: attributes?.params || "[]",
            },
          });
        },
    };
  },
});

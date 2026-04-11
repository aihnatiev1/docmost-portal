/**
 * Unit tests for API documentation TipTap extensions.
 *
 * These test the Node definitions (attributes, parseHTML, renderHTML)
 * without needing a full TipTap editor instance.
 */

import { ApiMethod } from "../api-method";
import { ApiEndpoint } from "../api-endpoint";
import { ApiParams } from "../api-params";

// Helper: call the extension's config to get addAttributes/renderHTML etc.
function getExtConfig(ext: any) {
  return ext.config;
}

describe("ApiMethod extension", () => {
  it("should have correct name", () => {
    expect(ApiMethod.name).toBe("apiMethod");
  });

  it("should be inline and atom", () => {
    const config = getExtConfig(ApiMethod);
    expect(config.group).toBe("inline");
    expect(config.inline).toBe(true);
    expect(config.atom).toBe(true);
  });

  it("should parse method attribute from data-method", () => {
    const attrs = ApiMethod.config.addAttributes?.call({}) as any;
    const el = {
      getAttribute: (name: string) =>
        name === "data-method" ? "POST" : null,
      textContent: "POST",
    } as unknown as HTMLElement;
    expect(attrs.method.parseHTML(el)).toBe("POST");
  });

  it("should normalize invalid method to GET", () => {
    const attrs = ApiMethod.config.addAttributes?.call({}) as any;
    const el = {
      getAttribute: () => "INVALID",
      textContent: "INVALID",
    } as unknown as HTMLElement;
    expect(attrs.method.parseHTML(el)).toBe("GET");
  });

  it("should normalize null method to GET", () => {
    const attrs = ApiMethod.config.addAttributes?.call({}) as any;
    const el = {
      getAttribute: () => null,
      textContent: null,
    } as unknown as HTMLElement;
    expect(attrs.method.parseHTML(el)).toBe("GET");
  });

  it("should handle all valid HTTP methods", () => {
    const attrs = ApiMethod.config.addAttributes?.call({}) as any;
    const methods = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];
    for (const method of methods) {
      const el = {
        getAttribute: () => method,
        textContent: method,
      } as unknown as HTMLElement;
      expect(attrs.method.parseHTML(el)).toBe(method);
    }
  });

  it("should be case-insensitive for method parsing", () => {
    const attrs = ApiMethod.config.addAttributes?.call({}) as any;
    const el = {
      getAttribute: () => "post",
      textContent: "post",
    } as unknown as HTMLElement;
    expect(attrs.method.parseHTML(el)).toBe("POST");
  });

  it("should parse from correct tag selector", () => {
    const parseHTML = ApiMethod.config.parseHTML?.call({ name: "apiMethod" });
    expect(parseHTML).toEqual([{ tag: 'span[data-type="apiMethod"]' }]);
  });
});

describe("ApiEndpoint extension", () => {
  it("should have correct name", () => {
    expect(ApiEndpoint.name).toBe("apiEndpoint");
  });

  it("should be block and atom", () => {
    const config = getExtConfig(ApiEndpoint);
    expect(config.group).toBe("block");
    expect(config.atom).toBe(true);
  });

  it("should parse method and url attributes", () => {
    const attrs = ApiEndpoint.config.addAttributes?.call({}) as any;
    const el = {
      getAttribute: (name: string) => {
        if (name === "data-method") return "DELETE";
        if (name === "data-url") return "/api/v1/users/{id}";
        return null;
      },
    } as unknown as HTMLElement;
    expect(attrs.method.parseHTML(el)).toBe("DELETE");
    expect(attrs.url.parseHTML(el)).toBe("/api/v1/users/{id}");
  });

  it("should default method to GET and url to /api/v1/resource", () => {
    const attrs = ApiEndpoint.config.addAttributes?.call({}) as any;
    expect(attrs.method.default).toBe("GET");
    expect(attrs.url.default).toBe("/api/v1/resource");
  });

  it("should parse from correct tag selector", () => {
    const parseHTML = ApiEndpoint.config.parseHTML?.call({
      name: "apiEndpoint",
    });
    expect(parseHTML).toEqual([{ tag: 'div[data-type="apiEndpoint"]' }]);
  });
});

describe("ApiParams extension", () => {
  it("should have correct name", () => {
    expect(ApiParams.name).toBe("apiParams");
  });

  it("should be block and atom", () => {
    const config = getExtConfig(ApiParams);
    expect(config.group).toBe("block");
    expect(config.atom).toBe(true);
  });

  it("should parse params attribute as JSON string", () => {
    const attrs = ApiParams.config.addAttributes?.call({}) as any;
    const paramsJson = JSON.stringify([
      { name: "id", type: "string", required: true, description: "User ID" },
    ]);
    const el = {
      getAttribute: (name: string) =>
        name === "data-params" ? paramsJson : null,
    } as unknown as HTMLElement;
    expect(attrs.params.parseHTML(el)).toBe(paramsJson);
  });

  it("should default params to empty array JSON", () => {
    const attrs = ApiParams.config.addAttributes?.call({}) as any;
    expect(attrs.params.default).toBe("[]");
  });

  it("should handle missing data-params gracefully", () => {
    const attrs = ApiParams.config.addAttributes?.call({}) as any;
    const el = {
      getAttribute: () => null,
    } as unknown as HTMLElement;
    expect(attrs.params.parseHTML(el)).toBe("[]");
  });

  it("should parse from correct tag selector", () => {
    const parseHTML = ApiParams.config.parseHTML?.call({ name: "apiParams" });
    expect(parseHTML).toEqual([{ tag: 'div[data-type="apiParams"]' }]);
  });
});

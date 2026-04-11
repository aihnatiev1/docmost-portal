import { createContext, useContext } from "react";

interface DocsPortalContextValue {
  basePath: string; // "/docs" or "/:locale/docs"
  locale?: string;
}

export const DocsPortalContext = createContext<DocsPortalContextValue>({
  basePath: "/docs",
});

export function useDocsPortalContext() {
  return useContext(DocsPortalContext);
}

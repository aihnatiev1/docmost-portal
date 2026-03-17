import { useEffect, useMemo } from "react";
import { AppShell, ScrollArea } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  useDocSpaceQuery,
  useDocTreeQuery,
  useDocPageQuery,
  useDocSpaceHomeQuery,
  useDocTranslationsQuery,
} from "../queries/docs-portal-query";
import { useFlatTree } from "../hooks/use-doc-tree";
import DocsHeader from "../header/DocsHeader";
import DocsNavTree from "../nav/DocsNavTree";
import DocsBreadcrumbs from "../breadcrumbs/DocsBreadcrumbs";
import DocsFooter from "../footer/DocsFooter";
import DocsSearchModal from "./DocsSearchModal";
import ReadonlyPageEditor from "@/features/editor/readonly-page-editor";
import { TableOfContents } from "@/features/editor/components/table-of-contents/table-of-contents";
import { readOnlyEditorAtom } from "@/features/editor/atoms/editor-atoms";
import { useAtomValue } from "jotai";
import { Error404 } from "@/components/ui/error-404";
import classes from "../styles/docs-portal.module.css";
import { IPortalSettings } from "@/features/space/types/space.types";

/**
 * Build CSS custom properties from portalSettings.theme
 * These cascade down to all portal components via CSS variables.
 */
function buildThemeCssVars(ps: IPortalSettings): React.CSSProperties {
  const vars: Record<string, string> = {};
  const theme = ps.theme || {};

  // Colors
  if (theme.primaryColor) {
    vars["--docs-primary"] = theme.primaryColor;
    // Generate a lighter tint for backgrounds
    vars["--docs-primary-light"] = theme.primaryColor + "14";
    vars["--docs-primary-medium"] = theme.primaryColor + "28";
  }
  if (theme.accentColor) {
    vars["--docs-accent"] = theme.accentColor;
  }

  // Fonts
  if (theme.fontFamily) {
    vars["--docs-font-family"] = theme.fontFamily;
  }
  if (theme.codeFontFamily) {
    vars["--docs-code-font-family"] = theme.codeFontFamily;
  }

  // Corner style
  if (theme.cornerStyle === "sharp") {
    vars["--docs-radius"] = "0px";
    vars["--docs-radius-sm"] = "0px";
    vars["--docs-radius-md"] = "0px";
  } else {
    vars["--docs-radius"] = "8px";
    vars["--docs-radius-sm"] = "4px";
    vars["--docs-radius-md"] = "8px";
  }

  return vars as React.CSSProperties;
}

/**
 * Build a <style> block for theme-driven overrides that can't be done via CSS vars alone
 */
function buildThemeStyles(ps: IPortalSettings): string {
  const theme = ps.theme || {};
  const parts: string[] = [];

  // Primary color applied to links, active nav, accents
  if (theme.primaryColor) {
    parts.push(`
      .docs-portal a:not([class]) { color: ${theme.primaryColor}; }
      .docs-portal .${classes.navItemActive} {
        background: ${theme.primaryColor}22 !important;
        color: ${theme.primaryColor} !important;
        border-left-color: ${theme.primaryColor} !important;
        font-weight: 600 !important;
      }
      .docs-portal .${classes.searchShortcut} {
        color: ${theme.primaryColor};
      }
      .docs-portal .${classes.pageNavCard}:hover {
        border-color: ${theme.primaryColor}40;
      }
    `);
  }

  // Font family
  if (theme.fontFamily) {
    parts.push(`
      .docs-portal, .docs-portal .ProseMirror {
        font-family: ${theme.fontFamily}, var(--mantine-font-family);
      }
    `);
  }

  // Code font
  if (theme.codeFontFamily) {
    parts.push(`
      .docs-portal code, .docs-portal pre {
        font-family: ${theme.codeFontFamily}, ui-monospace, monospace;
      }
    `);
  }

  // Tint style — adds primary color tint to backgrounds
  if (theme.tintStyle === "subtle" && theme.primaryColor) {
    parts.push(`
      .docs-portal .${classes.navbar} {
        background: linear-gradient(135deg, ${theme.primaryColor}05, ${theme.primaryColor}0a) !important;
      }
    `);
  } else if (theme.tintStyle === "bold" && theme.primaryColor) {
    parts.push(`
      .docs-portal .${classes.navbar} {
        background: linear-gradient(180deg, ${theme.primaryColor}12, ${theme.primaryColor}08) !important;
      }
      .docs-portal .${classes.header} {
        background: linear-gradient(90deg, ${theme.primaryColor}08, transparent) !important;
      }
    `);
  }

  // Sidebar background — filled
  if (theme.sidebarBackground === "filled" && theme.primaryColor) {
    parts.push(`
      .docs-portal .${classes.navbar} {
        background: ${theme.primaryColor}0a !important;
      }
    `);
  }

  // Sidebar list style — pill
  if (theme.sidebarListStyle === "pill") {
    parts.push(`
      .docs-portal .${classes.navItem} {
        border-radius: 8px !important;
        margin: 1px 8px !important;
        border-left: none !important;
        padding-left: 10px !important;
      }
      .docs-portal .${classes.navItem}:hover {
        background: ${theme.primaryColor ? theme.primaryColor + "10" : "var(--mantine-color-default-hover)"} !important;
      }
      .docs-portal .${classes.navItemActive} {
        border-radius: 8px !important;
        border-left: none !important;
        background: ${theme.primaryColor ? theme.primaryColor + "20" : "var(--mantine-primary-color-light)"} !important;
        box-shadow: inset 0 0 0 1px ${theme.primaryColor ? theme.primaryColor + "25" : "var(--mantine-primary-color-light)"};
      }
    `);
  }

  // Sidebar list style — line
  if (theme.sidebarListStyle === "line") {
    parts.push(`
      .docs-portal .${classes.navItem} {
        border-radius: 0 !important;
        border-left: 2px solid transparent !important;
        background: transparent !important;
      }
      .docs-portal .${classes.navItemActive} {
        border-radius: 0 !important;
        border-left: 2px solid ${theme.primaryColor || "var(--mantine-primary-color-filled)"} !important;
        background: transparent !important;
      }
    `);
  }

  // Theme preset overrides
  if (theme.preset === "bold") {
    parts.push(`
      .docs-portal .${classes.header} {
        background: rgba(0, 0, 0, 0.85) !important;
        backdrop-filter: blur(12px);
      }
      .docs-portal .${classes.brandTitle} {
        color: #fff !important;
      }
    `);
  }

  // Corner style
  if (theme.cornerStyle === "sharp") {
    parts.push(`
      .docs-portal .${classes.navItem} { border-radius: 0 !important; }
      .docs-portal .${classes.pageNavCard} { border-radius: 0 !important; }
      .docs-portal .${classes.searchTrigger} { border-radius: 0 !important; }
    `);
  }

  return parts.join("\n");
}

export default function DocsPortalLayout() {
  const { spaceSlug, pageSlug } = useParams<{
    spaceSlug: string;
    pageSlug?: string;
  }>();
  const navigate = useNavigate();

  const [sidebarOpened, { toggle: toggleSidebar }] = useDisclosure(true);
  const [searchOpened, { open: openSearch, close: closeSearch }] =
    useDisclosure(false);

  const { data: space, isLoading: spaceLoading } = useDocSpaceQuery(
    spaceSlug!,
  );
  const { data: treeItems } = useDocTreeQuery(spaceSlug!);
  const { tree, flat } = useFlatTree(treeItems);
  const { data: translations } = useDocTranslationsQuery(spaceSlug!);

  // If no pageSlug, redirect to first page
  const { data: homePage } = useDocSpaceHomeQuery(
    !pageSlug ? spaceSlug! : "",
  );

  useEffect(() => {
    if (!pageSlug && homePage) {
      const slug = homePage.title
        ? `${homePage.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${homePage.slugId}`
        : homePage.slugId;
      navigate(`/docs/${spaceSlug}/${slug}`, { replace: true });
    }
  }, [pageSlug, homePage, spaceSlug, navigate]);

  const {
    data: pageData,
    isLoading: pageLoading,
    isError,
  } = useDocPageQuery(spaceSlug!, pageSlug || "");

  const readOnlyEditor = useAtomValue(readOnlyEditorAtom);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        openSearch();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [openSearch]);

  if (spaceLoading) {
    return (
      <div className={classes.loadingContainer}>
        <div className={classes.loadingDots}>
          <div className={classes.loadingDot} />
          <div className={classes.loadingDot} />
          <div className={classes.loadingDot} />
        </div>
      </div>
    );
  }

  if (isError && pageSlug) {
    return <Error404 />;
  }

  // Defensive: portalSettings may be a string if double-serialized in DB
  const rawSettings = space?.portalSettings;
  const portalSettings: IPortalSettings = typeof rawSettings === 'string'
    ? (() => { try { return JSON.parse(rawSettings); } catch { return {}; } })()
    : rawSettings || {};

  // Build CSS variables and theme styles
  const cssVars = buildThemeCssVars(portalSettings);
  const themeStyles = buildThemeStyles(portalSettings);

  // Derived toggles
  const showHeader = portalSettings.headerEnabled !== false;
  const showPagination = portalSettings.paginationEnabled !== false;
  const showFooter = portalSettings.footerEnabled !== false;
  const showAnnouncement = portalSettings.announcementEnabled && portalSettings.announcementText;

  return (
    <>
      <Helmet>
        <title>
          {pageData?.page?.title
            ? `${pageData.page.title} — ${portalSettings.title || space?.name || "Docs"}`
            : portalSettings.title || space?.name || "Documentation"}
        </title>
        {pageData?.page?.metaDescription && (
          <meta
            name="description"
            content={pageData.page.metaDescription}
          />
        )}
        {portalSettings.favicon && (
          <link rel="icon" href={portalSettings.favicon} />
        )}
      </Helmet>

      {/* Theme-driven CSS */}
      {themeStyles && <style>{themeStyles}</style>}

      {/* User custom CSS */}
      {portalSettings.customCss && (
        <style>{portalSettings.customCss}</style>
      )}

      <div className="docs-portal" style={cssVars}>
        {/* Announcement banner */}
        {showAnnouncement && (
          <div
            style={{
              background: (portalSettings.theme?.primaryColor || "#228be6") + "14",
              borderBottom: `1px solid ${(portalSettings.theme?.primaryColor || "#228be6")}28`,
              padding: "8px 16px",
              textAlign: "center",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            {portalSettings.announcementUrl ? (
              <a
                href={portalSettings.announcementUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: portalSettings.theme?.primaryColor || "#228be6",
                  textDecoration: "none",
                }}
              >
                {portalSettings.announcementText}
              </a>
            ) : (
              <span>{portalSettings.announcementText}</span>
            )}
          </div>
        )}

        <AppShell
          header={{ height: showHeader ? 60 : 0 }}
          navbar={{
            width: 280,
            breakpoint: "sm",
            collapsed: { mobile: !sidebarOpened, desktop: !sidebarOpened },
          }}
          aside={{
            width: 240,
            breakpoint: "md",
            collapsed: { mobile: true, desktop: false },
          }}
          padding={0}
        >
          {showHeader && (
            <AppShell.Header className={classes.header}>
              <DocsHeader
                portalSettings={portalSettings}
                translations={translations}
                onSearchOpen={openSearch}
                onToggleSidebar={toggleSidebar}
              />
            </AppShell.Header>
          )}

          <AppShell.Navbar className={classes.navbar}>
            <DocsNavTree tree={tree} spaceSlug={spaceSlug!} />
          </AppShell.Navbar>

          <AppShell.Main>
            <div className={classes.contentArea}>
              {pageData && (
                <>
                  <DocsBreadcrumbs
                    spaceSlug={spaceSlug!}
                    spaceName={space?.name || "Docs"}
                    currentPageId={pageData.page.id}
                    flat={flat}
                  />

                  {pageData.page.updatedAt && (
                    <div className={classes.lastUpdated}>
                      Last updated{" "}
                      {new Date(pageData.page.updatedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  )}

                  <ReadonlyPageEditor
                    key={pageData.page.id}
                    title={pageData.page.title}
                    content={pageData.page.content}
                    pageId={pageData.page.id}
                  />

                  <DocsFooter
                    spaceSlug={spaceSlug!}
                    pageId={pageData.page.id}
                    flat={flat}
                    portalSettings={portalSettings}
                    showPagination={showPagination}
                    showFooterLinks={showFooter}
                  />
                </>
              )}

              {pageLoading && (
                <div className={classes.loadingContainer} style={{ minHeight: "40vh" }}>
                  <div className={classes.loadingDots}>
                    <div className={classes.loadingDot} />
                    <div className={classes.loadingDot} />
                    <div className={classes.loadingDot} />
                  </div>
                </div>
              )}
            </div>
          </AppShell.Main>

          <AppShell.Aside className={classes.aside}>
            <ScrollArea
              style={{ height: "calc(100vh - 80px)" }}
              scrollbarSize={4}
              type="hover"
            >
              <div className={classes.tocTitle}>On this page</div>
              <div style={{ paddingBottom: 50 }}>
                {readOnlyEditor && (
                  <TableOfContents isShare={true} editor={readOnlyEditor} />
                )}
              </div>
            </ScrollArea>
          </AppShell.Aside>
        </AppShell>

        <DocsSearchModal
          opened={searchOpened}
          onClose={closeSearch}
          spaceSlug={spaceSlug!}
        />
      </div>
    </>
  );
}

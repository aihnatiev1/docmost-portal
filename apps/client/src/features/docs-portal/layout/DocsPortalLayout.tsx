import { useEffect } from "react";
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
  const portalSettings = typeof rawSettings === 'string'
    ? (() => { try { return JSON.parse(rawSettings); } catch { return {}; } })()
    : rawSettings || {};

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

      {portalSettings.customCss && (
        <style>{portalSettings.customCss}</style>
      )}

      <AppShell
        header={{ height: 60 }}
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
        <AppShell.Header className={classes.header}>
          <DocsHeader
            portalSettings={portalSettings}
            translations={translations}
            onSearchOpen={openSearch}
            onToggleSidebar={toggleSidebar}
          />
        </AppShell.Header>

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
    </>
  );
}

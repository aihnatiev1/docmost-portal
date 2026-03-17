import { useEffect, useState, useCallback } from "react";
import {
  AppShell,
  Container,
  LoadingOverlay,
  ScrollArea,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Outlet, useParams, useNavigate } from "react-router-dom";
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

  // Keyboard shortcut Ctrl+K
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
    return <LoadingOverlay visible />;
  }

  if (isError && pageSlug) {
    return <Error404 />;
  }

  const portalSettings = space?.portalSettings || {};

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
      </Helmet>

      {portalSettings.customCss && (
        <style>{portalSettings.customCss}</style>
      )}

      <AppShell
        header={{ height: 56 }}
        navbar={{
          width: 260,
          breakpoint: "sm",
          collapsed: { mobile: !sidebarOpened, desktop: !sidebarOpened },
        }}
        aside={{
          width: 220,
          breakpoint: "md",
          collapsed: { mobile: true, desktop: false },
        }}
        padding="md"
      >
        <AppShell.Header>
          <DocsHeader
            portalSettings={portalSettings}
            translations={translations}
            onSearchOpen={openSearch}
            onToggleSidebar={toggleSidebar}
          />
        </AppShell.Header>

        <AppShell.Navbar p="xs">
          <DocsNavTree tree={tree} spaceSlug={spaceSlug!} />
        </AppShell.Navbar>

        <AppShell.Main>
          <Container size={720} p={0}>
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

            {pageLoading && <LoadingOverlay visible />}
          </Container>
        </AppShell.Main>

        <AppShell.Aside p="md">
          <ScrollArea
            style={{ height: "calc(100vh - 80px)" }}
            scrollbarSize={5}
          >
            {readOnlyEditor && (
              <TableOfContents isShare={true} editor={readOnlyEditor} />
            )}
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

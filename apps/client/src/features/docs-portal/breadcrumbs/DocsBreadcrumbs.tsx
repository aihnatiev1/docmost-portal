import { Breadcrumbs, Anchor, Text } from "@mantine/core";
import { Link } from "react-router-dom";
import { ITreeNode } from "../types/docs-portal.types";
import { buildPageSlug } from "../hooks/use-doc-tree";

interface DocsBreadcrumbsProps {
  spaceSlug: string;
  spaceName: string;
  currentPageId: string | null;
  flat: ITreeNode[];
}

export default function DocsBreadcrumbs({
  spaceSlug,
  spaceName,
  currentPageId,
  flat,
}: DocsBreadcrumbsProps) {
  if (!currentPageId) return null;

  const breadcrumbs = buildBreadcrumbChain(currentPageId, flat);

  return (
    <Breadcrumbs
      mb="md"
      styles={{
        root: { flexWrap: "wrap" },
        separator: { margin: "0 4px" },
      }}
    >
      <Anchor component={Link} to={`/docs/${spaceSlug}`} size="sm" c="dimmed">
        {spaceName}
      </Anchor>
      {breadcrumbs.map((item, index) =>
        index < breadcrumbs.length - 1 ? (
          <Anchor
            key={item.id}
            component={Link}
            to={`/docs/${spaceSlug}/${buildPageSlug(item.title, item.slugId)}`}
            size="sm"
            c="dimmed"
          >
            {item.title || "Untitled"}
          </Anchor>
        ) : (
          <Text key={item.id} size="sm" c="dimmed">
            {item.title || "Untitled"}
          </Text>
        ),
      )}
    </Breadcrumbs>
  );
}

function buildBreadcrumbChain(
  pageId: string,
  flat: ITreeNode[],
): ITreeNode[] {
  const chain: ITreeNode[] = [];
  let current = flat.find((p) => p.id === pageId);
  while (current) {
    chain.unshift(current);
    current = current.parentPageId
      ? flat.find((p) => p.id === current!.parentPageId)
      : undefined;
  }
  return chain;
}

import { useState } from "react";
import {
  NavLink,
  ScrollArea,
  Text,
} from "@mantine/core";
import { IconChevronRight, IconFile } from "@tabler/icons-react";
import { Link, useParams } from "react-router-dom";
import { ITreeNode } from "../types/docs-portal.types";
import { buildPageSlug } from "../hooks/use-doc-tree";

interface DocsNavTreeProps {
  tree: ITreeNode[];
  spaceSlug: string;
}

function NavTreeItem({
  node,
  spaceSlug,
  activeSlugId,
  level,
}: {
  node: ITreeNode;
  spaceSlug: string;
  activeSlugId: string | null;
  level: number;
}) {
  const isActive = node.slugId === activeSlugId;
  const hasChildren = node.children.length > 0;
  const [opened, setOpened] = useState(
    hasChildren && isAncestor(node, activeSlugId),
  );

  return (
    <>
      <NavLink
        component={Link}
        to={`/docs/${spaceSlug}/${buildPageSlug(node.title, node.slugId)}`}
        label={
          <Text size="sm" truncate>
            {node.icon || ""} {node.title || "Untitled"}
          </Text>
        }
        active={isActive}
        opened={hasChildren ? opened : undefined}
        onClick={
          hasChildren
            ? (e: React.MouseEvent) => {
                // Only toggle if clicking the chevron area
                const target = e.target as HTMLElement;
                if (target.closest("[data-chevron]")) {
                  e.preventDefault();
                  setOpened((o) => !o);
                }
              }
            : undefined
        }
        rightSection={
          hasChildren ? (
            <IconChevronRight
              size={14}
              data-chevron
              style={{
                transform: opened ? "rotate(90deg)" : "none",
                transition: "transform 150ms ease",
                cursor: "pointer",
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpened((o) => !o);
              }}
            />
          ) : undefined
        }
        leftSection={
          node.icon ? (
            <span style={{ fontSize: 16 }}>{node.icon}</span>
          ) : (
            <IconFile size={16} stroke={1.5} />
          )
        }
        style={{ paddingLeft: level * 12 + 12 }}
        variant="light"
      />
      {hasChildren && opened && (
        <div>
          {node.children.map((child) => (
            <NavTreeItem
              key={child.id}
              node={child}
              spaceSlug={spaceSlug}
              activeSlugId={activeSlugId}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </>
  );
}

function isAncestor(node: ITreeNode, slugId: string | null): boolean {
  if (!slugId) return false;
  for (const child of node.children) {
    if (child.slugId === slugId) return true;
    if (isAncestor(child, slugId)) return true;
  }
  return false;
}

function extractSlugId(pageSlug: string | undefined): string | null {
  if (!pageSlug) return null;
  const parts = pageSlug.split("-");
  return parts.length > 1 ? parts[parts.length - 1] : pageSlug;
}

export default function DocsNavTree({ tree, spaceSlug }: DocsNavTreeProps) {
  const { pageSlug } = useParams<{ pageSlug?: string }>();
  const activeSlugId = extractSlugId(pageSlug);

  return (
    <ScrollArea style={{ height: "calc(100vh - 70px)" }} scrollbarSize={5}>
      <div style={{ paddingBottom: 40 }}>
        {tree.map((node) => (
          <NavTreeItem
            key={node.id}
            node={node}
            spaceSlug={spaceSlug}
            activeSlugId={activeSlugId}
            level={0}
          />
        ))}
      </div>
    </ScrollArea>
  );
}

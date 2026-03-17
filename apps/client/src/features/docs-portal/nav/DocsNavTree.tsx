import { useState } from "react";
import { ScrollArea } from "@mantine/core";
import { IconChevronRight, IconFileText } from "@tabler/icons-react";
import { Link, useParams } from "react-router-dom";
import { ITreeNode } from "../types/docs-portal.types";
import { buildPageSlug } from "../hooks/use-doc-tree";
import classes from "../styles/docs-portal.module.css";
import cx from "clsx";

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
      <Link
        to={`/docs/${spaceSlug}/${buildPageSlug(node.title, node.slugId)}`}
        className={cx(classes.navItem, isActive && classes.navItemActive)}
        style={{ paddingLeft: level * 16 + 10 }}
      >
        <span className={classes.navItemIcon}>
          {node.icon ? (
            <span style={{ fontSize: 15 }}>{node.icon}</span>
          ) : (
            <IconFileText size={16} stroke={1.5} />
          )}
        </span>

        <span className={classes.navItemLabel}>
          {node.title || "Untitled"}
        </span>

        {hasChildren && (
          <span
            className={cx(
              classes.navChevron,
              opened && classes.navChevronOpen,
            )}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpened((o) => !o);
            }}
            role="button"
          >
            <IconChevronRight size={12} stroke={2} />
          </span>
        )}
      </Link>

      {hasChildren && opened && (
        <div className={classes.navChildren}>
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
    <ScrollArea
      style={{ height: "calc(100vh - 72px)" }}
      scrollbarSize={4}
      type="hover"
    >
      <div className={classes.navSection}>
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

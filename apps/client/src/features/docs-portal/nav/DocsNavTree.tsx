import { useState } from "react";
import { ScrollArea } from "@mantine/core";
import { IconChevronRight, IconFileDescription, IconBook2, IconExternalLink } from "@tabler/icons-react";
import { Link, useParams } from "react-router-dom";
import { ITreeNode } from "../types/docs-portal.types";
import { buildPageSlug } from "../hooks/use-doc-tree";
import classes from "../styles/docs-portal.module.css";
import cx from "clsx";

interface SidebarInsert {
  type: "header" | "link";
  label: string;
  url?: string;
  position: number;
}

interface DocsNavTreeProps {
  tree: ITreeNode[];
  spaceSlug: string;
  sidebarInserts?: SidebarInsert[];
  externalLinksTarget?: "same_tab" | "new_tab";
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
        onClick={() => { if (hasChildren) setOpened((o) => !o); }}
      >
        <span className={classes.navItemIcon}>
          {node.icon ? (
            <span style={{ fontSize: 15 }}>{node.icon}</span>
          ) : hasChildren ? (
            <IconBook2 size={16} stroke={1.5} />
          ) : (
            <IconFileDescription size={16} stroke={1.5} />
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

/** Render a sidebar section header (e.g., "PROXY-SELLER", "MOBILE CRM") */
function SidebarGroupHeader({ label }: { label: string }) {
  return <div className={classes.navSectionLabel}>{label}</div>;
}

/** Sanitize URL — block javascript:, data:, vbscript: protocols */
function sanitizeUrl(url: string): string {
  const trimmed = url.trim().toLowerCase();
  if (trimmed.startsWith("javascript:") || trimmed.startsWith("data:") || trimmed.startsWith("vbscript:")) {
    return "#";
  }
  return url;
}

/** Render a sidebar external link with arrow icon */
function SidebarExternalLink({
  label,
  url,
  target,
}: {
  label: string;
  url: string;
  target?: string;
}) {
  return (
    <a
      href={sanitizeUrl(url)}
      target={target || "_blank"}
      rel="noopener noreferrer"
      className={classes.navItem}
      style={{ paddingLeft: 10 }}
    >
      <span className={classes.navItemIcon}>
        <IconExternalLink size={16} stroke={1.5} />
      </span>
      <span className={classes.navItemLabel}>{label}</span>
      <span className={classes.navExternalArrow}>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 9L9 1M9 1H3M9 1V7" />
        </svg>
      </span>
    </a>
  );
}

export default function DocsNavTree({
  tree,
  spaceSlug,
  sidebarInserts,
  externalLinksTarget,
}: DocsNavTreeProps) {
  const { pageSlug } = useParams<{ pageSlug?: string }>();
  const activeSlugId = extractSlugId(pageSlug);

  const linkTarget = externalLinksTarget === "same_tab" ? "_self" : "_blank";

  // Build sidebar items: interleave inserts with page tree nodes
  const items: React.ReactNode[] = [];

  if (sidebarInserts && sidebarInserts.length > 0) {
    // Group inserts by position
    const insertsByPos: Record<number, SidebarInsert[]> = {};
    for (const ins of sidebarInserts) {
      if (!insertsByPos[ins.position]) insertsByPos[ins.position] = [];
      insertsByPos[ins.position].push(ins);
    }

    // Render: for each position, render inserts first, then the page node
    tree.forEach((node, idx) => {
      // Render inserts before this page
      if (insertsByPos[idx]) {
        for (const ins of insertsByPos[idx]) {
          if (ins.type === "header") {
            items.push(
              <SidebarGroupHeader key={`hdr-${idx}-${ins.label}`} label={ins.label} />,
            );
          } else if (ins.type === "link" && ins.url) {
            items.push(
              <SidebarExternalLink
                key={`lnk-${idx}-${ins.label}`}
                label={ins.label}
                url={ins.url}
                target={linkTarget}
              />,
            );
          }
        }
      }

      // Render the page tree node
      items.push(
        <NavTreeItem
          key={node.id}
          node={node}
          spaceSlug={spaceSlug}
          activeSlugId={activeSlugId}
          level={0}
        />,
      );
    });

    // Render any inserts after the last page (position >= tree.length)
    const afterEnd = Object.entries(insertsByPos)
      .filter(([pos]) => Number(pos) >= tree.length)
      .sort(([a], [b]) => Number(a) - Number(b));

    for (const [, inserts] of afterEnd) {
      for (const ins of inserts) {
        if (ins.type === "header") {
          items.push(
            <SidebarGroupHeader key={`hdr-end-${ins.label}`} label={ins.label} />,
          );
        } else if (ins.type === "link" && ins.url) {
          items.push(
            <SidebarExternalLink
              key={`lnk-end-${ins.label}`}
              label={ins.label}
              url={ins.url}
              target={linkTarget}
            />,
          );
        }
      }
    }
  } else {
    // No inserts — render plain tree
    tree.forEach((node) => {
      items.push(
        <NavTreeItem
          key={node.id}
          node={node}
          spaceSlug={spaceSlug}
          activeSlugId={activeSlugId}
          level={0}
        />,
      );
    });
  }

  return (
    <ScrollArea
      style={{ height: "calc(100vh - 72px)" }}
      scrollbarSize={4}
      type="hover"
    >
      <div className={classes.navSection}>{items}</div>
    </ScrollArea>
  );
}

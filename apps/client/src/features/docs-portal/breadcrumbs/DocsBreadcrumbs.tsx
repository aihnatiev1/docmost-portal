import { Link } from "react-router-dom";
import { IconChevronRight } from "@tabler/icons-react";
import { ITreeNode } from "../types/docs-portal.types";
import { buildPageSlug } from "../hooks/use-doc-tree";
import classes from "../styles/docs-portal.module.css";

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
    <nav className={classes.breadcrumbs}>
      <Link to={`/docs/${spaceSlug}`} className={classes.breadcrumbLink}>
        {spaceName}
      </Link>

      {breadcrumbs.map((item, index) => (
        <span key={item.id} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <IconChevronRight
            size={12}
            stroke={1.5}
            className={classes.breadcrumbSeparator}
          />
          {index < breadcrumbs.length - 1 ? (
            <Link
              to={`/docs/${spaceSlug}/${buildPageSlug(item.title, item.slugId)}`}
              className={classes.breadcrumbLink}
            >
              {item.title || "Untitled"}
            </Link>
          ) : (
            <span className={classes.breadcrumbCurrent}>
              {item.title || "Untitled"}
            </span>
          )}
        </span>
      ))}
    </nav>
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

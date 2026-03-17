import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { ITreeNode, IPortalSettings } from "../types/docs-portal.types";
import { buildPageSlug } from "../hooks/use-doc-tree";
import FeedbackWidget from "../feedback/FeedbackWidget";
import classes from "../styles/docs-portal.module.css";
import cx from "clsx";

interface DocsFooterProps {
  spaceSlug: string;
  pageId: string;
  flat: ITreeNode[];
  portalSettings: IPortalSettings;
}

export default function DocsFooter({
  spaceSlug,
  pageId,
  flat,
  portalSettings,
}: DocsFooterProps) {
  const currentIndex = flat.findIndex((p) => p.id === pageId);
  const prevPage = currentIndex > 0 ? flat[currentIndex - 1] : null;
  const nextPage =
    currentIndex >= 0 && currentIndex < flat.length - 1
      ? flat[currentIndex + 1]
      : null;

  return (
    <div>
      <FeedbackWidget pageId={pageId} />

      {(prevPage || nextPage) && (
        <div className={classes.pageNavigation}>
          {prevPage ? (
            <Link
              to={`/docs/${spaceSlug}/${buildPageSlug(prevPage.title, prevPage.slugId)}`}
              className={classes.pageNavCard}
            >
              <span className={classes.pageNavLabel}>
                <IconArrowLeft size={12} stroke={2} />
                Previous
              </span>
              <span className={classes.pageNavTitle}>
                {prevPage.title || "Untitled"}
              </span>
            </Link>
          ) : (
            <div />
          )}
          {nextPage ? (
            <Link
              to={`/docs/${spaceSlug}/${buildPageSlug(nextPage.title, nextPage.slugId)}`}
              className={cx(classes.pageNavCard, classes.pageNavCardNext)}
            >
              <span className={classes.pageNavLabel} style={{ justifyContent: "flex-end" }}>
                Next
                <IconArrowRight size={12} stroke={2} />
              </span>
              <span className={classes.pageNavTitle}>
                {nextPage.title || "Untitled"}
              </span>
            </Link>
          ) : (
            <div />
          )}
        </div>
      )}

      {portalSettings.footerLinks && portalSettings.footerLinks.length > 0 && (
        <div className={classes.footerLinks}>
          {portalSettings.footerLinks.map((link, i) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={classes.footerLink}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}

      <div className={classes.poweredBy}>
        Powered by <a href="https://docmost.com" target="_blank" rel="noopener noreferrer">Docmost</a>
      </div>
    </div>
  );
}

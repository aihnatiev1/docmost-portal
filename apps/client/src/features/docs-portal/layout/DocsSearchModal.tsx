import { useState, useCallback, useEffect, useRef } from "react";
import { Modal, Loader } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconSearch, IconFileText, IconCornerDownLeft } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { useDocSearchQuery } from "../queries/docs-portal-query";
import DOMPurify from "dompurify";
import classes from "../styles/docs-portal.module.css";

interface DocsSearchModalProps {
  opened: boolean;
  onClose: () => void;
  spaceSlug: string;
}

export default function DocsSearchModal({
  opened,
  onClose,
  spaceSlug,
}: DocsSearchModalProps) {
  const [query, setQuery] = useState("");
  const [debounced] = useDebouncedValue(query, 250);
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: results, isLoading } = useDocSearchQuery(
    spaceSlug,
    debounced,
  );

  // Reset active index on new results
  useEffect(() => {
    setActiveIndex(0);
  }, [results]);

  const handleSelect = useCallback(
    (slugId: string, title: string | null) => {
      const slug = title
        ? `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${slugId}`
        : slugId;
      navigate(`/docs/${spaceSlug}/${slug}`);
      onClose();
      setQuery("");
    },
    [navigate, spaceSlug, onClose],
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!results || results.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % results.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + results.length) % results.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = results[activeIndex];
        if (item) handleSelect(item.slugId, item.title);
      }
    },
    [results, activeIndex, handleSelect],
  );

  return (
    <Modal
      opened={opened}
      onClose={() => {
        onClose();
        setQuery("");
      }}
      withCloseButton={false}
      size="lg"
      padding={0}
      radius="lg"
      overlayProps={{ backgroundOpacity: 0.35, blur: 4 }}
      transitionProps={{ transition: "pop", duration: 150 }}
      styles={{
        content: {
          overflow: "hidden",
          border: "1px solid var(--mantine-color-default-border)",
        },
        body: { padding: 0 },
      }}
    >
      <div onKeyDown={handleKeyDown}>
        {/* Search input */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 16px",
            borderBottom: "1px solid var(--mantine-color-default-border)",
          }}
        >
          <IconSearch size={18} stroke={1.5} style={{ opacity: 0.4, flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search documentation…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: 16,
              color: "var(--mantine-color-text)",
              fontFamily: "inherit",
            }}
          />
          {isLoading && <Loader size={16} />}
        </div>

        {/* Results */}
        {results && results.length > 0 && (
          <div className={classes.searchResults}>
            {results.map((result, index) => (
              <div
                key={result.id}
                className={classes.searchResultItem}
                onClick={() => handleSelect(result.slugId, result.title)}
                style={{
                  backgroundColor:
                    index === activeIndex
                      ? "var(--mantine-color-default-hover)"
                      : undefined,
                }}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <span className={classes.searchResultIcon}>
                  {result.icon ? (
                    <span style={{ fontSize: 15 }}>{result.icon}</span>
                  ) : (
                    <IconFileText size={16} stroke={1.5} />
                  )}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className={classes.searchResultTitle}>
                    {result.title || "Untitled"}
                  </div>
                  {result.highlight && (
                    <div
                      className={classes.searchResultHighlight}
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(result.highlight, {
                          ALLOWED_TAGS: ["mark", "em", "strong", "b"],
                        }),
                      }}
                    />
                  )}
                </div>
                {index === activeIndex && (
                  <IconCornerDownLeft
                    size={14}
                    stroke={1.5}
                    style={{ opacity: 0.3, flexShrink: 0, marginTop: 2 }}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {debounced && debounced.length >= 2 && results && results.length === 0 && !isLoading && (
          <div className={classes.searchEmpty}>
            No results for "{debounced}"
          </div>
        )}

        {/* Hints bar */}
        <div className={classes.searchHint}>
          <span>
            <span className={classes.searchHintKey}>↑</span>{" "}
            <span className={classes.searchHintKey}>↓</span> navigate
          </span>
          <span>
            <span className={classes.searchHintKey}>↵</span> open
          </span>
          <span>
            <span className={classes.searchHintKey}>Esc</span> close
          </span>
        </div>
      </div>
    </Modal>
  );
}

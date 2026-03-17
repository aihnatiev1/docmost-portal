import { ActionIcon, Menu, Tooltip } from "@mantine/core";
import {
  IconSearch,
  IconMenu2,
  IconLanguage,
} from "@tabler/icons-react";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  IPortalSettings,
  IDocTranslation,
} from "../types/docs-portal.types";
import classes from "../styles/docs-portal.module.css";

interface DocsHeaderProps {
  portalSettings: IPortalSettings;
  translations?: IDocTranslation[];
  currentLocale?: string;
  onSearchOpen: () => void;
  onToggleSidebar: () => void;
  sidebarVisible?: boolean;
}

export default function DocsHeader({
  portalSettings,
  translations,
  onSearchOpen,
  onToggleSidebar,
}: DocsHeaderProps) {
  const isMac =
    typeof navigator !== "undefined" &&
    /Mac|iPod|iPhone|iPad/.test(navigator.platform);

  const navItems = portalSettings.navigationItems || [];
  const primaryLink = portalSettings.primaryLink || undefined;
  const isSubtle = portalSettings.searchBarStyle === "subtle";

  return (
    <div className={classes.headerInner}>
      <div className={classes.headerBrand}>
        <ActionIcon
          variant="subtle"
          color="gray"
          onClick={onToggleSidebar}
          hiddenFrom="sm"
          size="sm"
        >
          <IconMenu2 size={18} stroke={1.5} />
        </ActionIcon>

        {primaryLink ? (
          <a href={primaryLink} style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: "inherit" }}>
            {portalSettings.logo && (
              <img
                src={portalSettings.logo}
                alt=""
                className={classes.brandLogo}
              />
            )}
            <span className={classes.brandTitle}>
              {portalSettings.title || "Documentation"}
            </span>
          </a>
        ) : (
          <>
            {portalSettings.logo && (
              <img
                src={portalSettings.logo}
                alt=""
                className={classes.brandLogo}
              />
            )}
            <span className={classes.brandTitle}>
              {portalSettings.title || "Documentation"}
            </span>
          </>
        )}
      </div>

      <div className={classes.headerActions}>
        {/* Header navigation items */}
        {navItems.length > 0 && (
          <nav style={{ display: "flex", gap: 4, alignItems: "center", marginRight: 8 }}>
            {navItems.map((item, i) => (
              <a
                key={i}
                href={item.url}
                target={portalSettings.externalLinksTarget === "new_tab" ? "_blank" : "_self"}
                rel="noopener noreferrer"
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--mantine-color-text)",
                  textDecoration: "none",
                  padding: "4px 10px",
                  borderRadius: "var(--docs-radius-sm, 4px)",
                  transition: "background 0.15s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--mantine-color-default-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>
        )}

        {/* Desktop search trigger — GitBook style */}
        <div
          className={classes.searchTrigger}
          onClick={onSearchOpen}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && onSearchOpen()}
          style={isSubtle ? { background: "transparent", border: "1px solid transparent" } : undefined}
        >
          <IconSearch size={15} stroke={1.5} />
          <span className={classes.searchTriggerText}>
            {isSubtle ? "Search…" : "Search docs…"}
          </span>
          <span className={classes.searchShortcut}>
            {isMac ? "⌘K" : "Ctrl+K"}
          </span>
        </div>

        {/* Mobile search icon */}
        <ActionIcon
          variant="subtle"
          color="gray"
          onClick={onSearchOpen}
          hiddenFrom="sm"
          size="md"
        >
          <IconSearch size={18} stroke={1.5} />
        </ActionIcon>

        {translations && translations.length > 0 && (
          <Menu shadow="md" width={180} position="bottom-end">
            <Menu.Target>
              <Tooltip label="Language" withArrow>
                <ActionIcon variant="subtle" color="gray" size="md">
                  <IconLanguage size={18} stroke={1.5} />
                </ActionIcon>
              </Tooltip>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Language</Menu.Label>
              {translations.map((t) => (
                <Menu.Item key={t.locale} component="a" href={`/docs/${t.targetSlug}`}>
                  {t.targetName} ({t.locale.toUpperCase()})
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
        )}

        <ThemeToggle />
      </div>
    </div>
  );
}

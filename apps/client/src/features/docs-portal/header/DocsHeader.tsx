import {
  Group,
  Text,
  TextInput,
  ActionIcon,
  Image,
  Tooltip,
  Menu,
} from "@mantine/core";
import {
  IconSearch,
  IconMenu2,
  IconLanguage,
} from "@tabler/icons-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { IPortalSettings, IDocTranslation } from "../types/docs-portal.types";

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
  return (
    <Group wrap="nowrap" justify="space-between" py="sm" px="xl" h="100%">
      <Group wrap="nowrap" gap="sm">
        <Tooltip label="Toggle sidebar">
          <ActionIcon
            variant="subtle"
            onClick={onToggleSidebar}
            hiddenFrom="sm"
            size="sm"
          >
            <IconMenu2 size={20} />
          </ActionIcon>
        </Tooltip>

        {portalSettings.logo && (
          <Image
            src={portalSettings.logo}
            alt="Logo"
            h={28}
            w="auto"
            fit="contain"
          />
        )}

        <Text fw={600} size="lg" truncate>
          {portalSettings.title || "Documentation"}
        </Text>
      </Group>

      <Group wrap="nowrap" gap="xs">
        <Tooltip label="Search (Ctrl+K)">
          <TextInput
            placeholder="Search docs..."
            leftSection={<IconSearch size={16} />}
            size="sm"
            readOnly
            onClick={onSearchOpen}
            style={{ cursor: "pointer" }}
            styles={{ input: { cursor: "pointer", width: 200 } }}
            visibleFrom="sm"
          />
        </Tooltip>

        <Tooltip label="Search" hiddenFrom="sm">
          <ActionIcon variant="subtle" onClick={onSearchOpen} size="sm">
            <IconSearch size={20} />
          </ActionIcon>
        </Tooltip>

        {translations && translations.length > 0 && (
          <Menu shadow="md" width={160}>
            <Menu.Target>
              <Tooltip label="Language">
                <ActionIcon variant="subtle" size="sm">
                  <IconLanguage size={20} />
                </ActionIcon>
              </Tooltip>
            </Menu.Target>
            <Menu.Dropdown>
              {translations.map((t) => (
                <Menu.Item
                  key={t.locale}
                  component="a"
                  href={`/docs/${t.targetSlug}`}
                >
                  {t.targetName} ({t.locale.toUpperCase()})
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
        )}

        <ThemeToggle />
      </Group>
    </Group>
  );
}

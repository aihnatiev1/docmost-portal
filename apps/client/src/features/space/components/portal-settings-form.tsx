import { useState, useEffect, useRef } from "react";
import {
  Stack,
  TextInput,
  Textarea,
  ColorInput,
  Button,
  Group,
  Text,
  Paper,
  Tabs,
  Badge,
  Switch,
  Code,
  SimpleGrid,
  ActionIcon,
  Tooltip,
  CopyButton,
  Box,
  Select,
  Divider,
  UnstyledButton,
  SegmentedControl,
} from "@mantine/core";
import {
  IconBrush,
  IconSettings,
  IconWorldWww,
  IconCode,
  IconExternalLink,
  IconCopy,
  IconCheck,
  IconLink,
  IconTypography,
  IconDeviceAnalytics,
  IconLanguage,
  IconPhoto,
  IconPlus,
  IconTrash,
  IconLayout,
  IconShieldLock,
  IconGripVertical,
} from "@tabler/icons-react";
import { useUpdateSpaceMutation } from "@/features/space/queries/space-query";
import { IPortalSettings } from "@/features/space/types/space.types";
import { useTranslation } from "react-i18next";
import { notifications } from "@mantine/notifications";

interface PortalSettingsFormProps {
  spaceId: string;
  portalSettings: IPortalSettings;
  spaceSlug?: string;
}

// Theme preset visual data
const THEME_PRESETS = [
  {
    value: "clean" as const,
    label: "Clean",
    description: "Minimal and modern",
    colors: ["#ffffff", "#f8f9fa", "#228be6"],
  },
  {
    value: "muted" as const,
    label: "Muted",
    description: "Soft and subtle",
    colors: ["#f8f9fa", "#e9ecef", "#495057"],
  },
  {
    value: "bold" as const,
    label: "Bold",
    description: "Strong and vibrant",
    colors: ["#1a1b1e", "#25262b", "#4dabf7"],
  },
  {
    value: "gradient" as const,
    label: "Gradient",
    description: "Colorful gradient accents",
    colors: ["#f8f9fa", "#e7f5ff", "#4c6ef5"],
  },
];

const COLOR_SWATCHES = [
  "#228be6", "#7950f2", "#12b886", "#e64980",
  "#fa5252", "#fd7e14", "#fab005", "#40c057",
  "#15aabf", "#4c6ef5", "#be4bdb", "#845ef7",
];

export function PortalSettingsForm({
  spaceId,
  portalSettings,
  spaceSlug,
}: PortalSettingsFormProps) {
  const { t } = useTranslation();
  const updateSpaceMutation = useUpdateSpaceMutation();

  const initialized = useRef(false);
  const [settings, setSettings] = useState<IPortalSettings>(
    portalSettings || {},
  );

  // Only sync from props on initial mount, not after mutation updates cache
  useEffect(() => {
    if (!initialized.current) {
      setSettings(portalSettings || {});
      initialized.current = true;
    }
  }, [portalSettings]);

  // Reset when switching to a different space
  useEffect(() => {
    initialized.current = false;
    setSettings(portalSettings || {});
  }, [spaceId]);

  const updateField = (field: string, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const updateThemeField = (field: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      theme: { ...prev.theme, [field]: value },
    }));
  };

  const handleSave = async () => {
    try {
      await updateSpaceMutation.mutateAsync({
        spaceId,
        portalSettings: settings,
      });
      notifications.show({
        title: t("Saved"),
        message: t("Portal settings updated successfully"),
        color: "green",
        icon: <IconCheck size={16} />,
      });
    } catch {
      notifications.show({
        title: t("Error"),
        message: t("Failed to save portal settings"),
        color: "red",
      });
    }
  };

  // Footer links management
  const footerLinks = settings.footerLinks || [];
  const addFooterLink = () => {
    updateField("footerLinks", [...footerLinks, { label: "", url: "" }]);
  };
  const updateFooterLink = (index: number, field: "label" | "url", value: string) => {
    const updated = [...footerLinks];
    updated[index] = { ...updated[index], [field]: value };
    updateField("footerLinks", updated);
  };
  const removeFooterLink = (index: number) => {
    updateField("footerLinks", footerLinks.filter((_, i) => i !== index));
  };

  // Navigation items management
  const navItems = settings.navigationItems || [];
  const addNavItem = () => {
    updateField("navigationItems", [...navItems, { label: "", url: "", type: "link" }]);
  };
  const updateNavItem = (index: number, field: string, value: string) => {
    const updated = [...navItems];
    updated[index] = { ...updated[index], [field]: value };
    updateField("navigationItems", updated);
  };
  const removeNavItem = (index: number) => {
    updateField("navigationItems", navItems.filter((_, i) => i !== index));
  };

  const portalUrl = settings.customDomain
    ? `https://${settings.customDomain}`
    : spaceSlug
      ? `${window.location.origin}/docs/${spaceSlug}`
      : null;

  const currentPreset = settings.theme?.preset || "clean";

  return (
    <Stack gap="lg">
      {/* ═══ Header ═══ */}
      <Group justify="space-between" align="flex-start">
        <div>
          <Group gap="sm" mb={4}>
            <Text fw={700} size="xl">
              {t("Site customization")}
            </Text>
            <Badge
              variant="dot"
              color="green"
              size="lg"
              styles={{ root: { textTransform: "none" } }}
            >
              {t("Published")}
            </Badge>
          </Group>
          <Text size="sm" c="dimmed">
            {t("Customize the appearance and behavior of your public documentation portal.")}
          </Text>
        </div>
        <Group gap="xs">
          {portalUrl && (
            <Button
              variant="default"
              component="a"
              href={portalUrl}
              target="_blank"
              leftSection={<IconExternalLink size={16} />}
              size="sm"
            >
              {t("Visit")}
            </Button>
          )}
          <Button
            onClick={handleSave}
            loading={updateSpaceMutation.isPending}
            leftSection={<IconCheck size={16} />}
            size="sm"
          >
            {t("Save")}
          </Button>
        </Group>
      </Group>

      {/* Portal URL bar */}
      {portalUrl && (
        <Paper
          p="sm"
          radius="md"
          withBorder
          style={{
            background: "var(--mantine-color-default-hover)",
          }}
        >
          <Group gap="xs" justify="space-between">
            <Group gap="xs">
              <IconWorldWww size={16} style={{ color: "var(--mantine-color-dimmed)" }} />
              <Code style={{ background: "transparent", fontSize: 13 }}>{portalUrl}</Code>
            </Group>
            <CopyButton value={portalUrl}>
              {({ copied, copy }) => (
                <Tooltip label={copied ? t("Copied") : t("Copy URL")}>
                  <ActionIcon variant="subtle" color={copied ? "green" : "gray"} onClick={copy} size="sm">
                    {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                  </ActionIcon>
                </Tooltip>
              )}
            </CopyButton>
          </Group>
        </Paper>
      )}

      {/* ═══ Main Tabs ═══ */}
      <Tabs defaultValue="general" variant="default" styles={{
        tab: {
          fontWeight: 500,
          fontSize: "var(--mantine-font-size-sm)",
          padding: "var(--mantine-spacing-sm) var(--mantine-spacing-md)",
        },
        list: {
          borderBottom: "1px solid var(--mantine-color-default-border)",
        },
      }}>
        <Tabs.List>
          <Tabs.Tab value="general" leftSection={<IconBrush size={16} />}>
            {t("General")}
          </Tabs.Tab>
          <Tabs.Tab value="layout" leftSection={<IconLayout size={16} />}>
            {t("Layout")}
          </Tabs.Tab>
          <Tabs.Tab value="configure" leftSection={<IconSettings size={16} />}>
            {t("Configure")}
          </Tabs.Tab>
        </Tabs.List>

        {/* ════════════════════════ GENERAL TAB ════════════════════════ */}
        <Tabs.Panel value="general" pt="lg">
          <Stack gap="xl">

            {/* ── Basic ── */}
            <div>
              <Text size="sm" fw={600} mb="md" tt="uppercase" c="dimmed" style={{ letterSpacing: "0.05em" }}>
                {t("Basic")}
              </Text>
              <Stack gap="md">
                <TextInput
                  label={t("Title")}
                  description={t("Displayed in the header and browser tab")}
                  placeholder="e.g. Proxy-Seller Documentation"
                  value={settings.title || ""}
                  onChange={(e) => updateField("title", e.currentTarget.value)}
                />

                <Textarea
                  label={t("Description")}
                  description={t("Used for SEO meta description")}
                  placeholder="Complete guide to our services and API"
                  value={settings.description || ""}
                  onChange={(e) => updateField("description", e.currentTarget.value)}
                  autosize
                  minRows={2}
                  maxRows={4}
                />

                <SimpleGrid cols={2}>
                  <TextInput
                    label={t("Logo URL (light)")}
                    description={t("Shown in light mode header")}
                    placeholder="/attachments/logo.svg"
                    value={settings.logo || ""}
                    onChange={(e) => updateField("logo", e.currentTarget.value)}
                    leftSection={<IconPhoto size={16} />}
                  />
                  <TextInput
                    label={t("Logo URL (dark)")}
                    description={t("Optional dark mode variant")}
                    placeholder="/attachments/logo-dark.svg"
                    value={settings.logoDark || ""}
                    onChange={(e) => updateField("logoDark", e.currentTarget.value)}
                    leftSection={<IconPhoto size={16} />}
                  />
                </SimpleGrid>

                <TextInput
                  label={t("Favicon URL")}
                  description={t("Browser tab icon")}
                  placeholder="/attachments/favicon.ico"
                  value={settings.favicon || ""}
                  onChange={(e) => updateField("favicon", e.currentTarget.value)}
                  leftSection={<IconPhoto size={16} />}
                  style={{ maxWidth: "50%" }}
                />

                {/* Logo Preview */}
                {settings.logo && (
                  <Paper p="md" radius="md" withBorder>
                    <Text size="xs" c="dimmed" mb="sm" tt="uppercase" fw={600} style={{ letterSpacing: "0.05em" }}>
                      {t("Logo preview")}
                    </Text>
                    <Group gap="lg">
                      <Paper p="sm" radius="sm" bg="white" style={{ border: "1px solid var(--mantine-color-gray-3)" }}>
                        <img
                          src={settings.logo}
                          alt="Logo light"
                          style={{ height: 28, width: "auto", display: "block" }}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      </Paper>
                      {settings.logoDark && (
                        <Paper p="sm" radius="sm" bg="dark.7" style={{ border: "1px solid var(--mantine-color-dark-4)" }}>
                          <img
                            src={settings.logoDark}
                            alt="Logo dark"
                            style={{ height: 28, width: "auto", display: "block" }}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                        </Paper>
                      )}
                    </Group>
                  </Paper>
                )}
              </Stack>
            </div>

            <Divider />

            {/* ── Themes ── */}
            <div>
              <Text size="sm" fw={600} mb="xs" tt="uppercase" c="dimmed" style={{ letterSpacing: "0.05em" }}>
                {t("Themes")}
              </Text>
              <Text size="xs" c="dimmed" mb="md">
                {t("Choose a base theme for your documentation portal")}
              </Text>

              <SimpleGrid cols={4} spacing="sm">
                {THEME_PRESETS.map((preset) => (
                  <UnstyledButton
                    key={preset.value}
                    onClick={() => updateThemeField("preset", preset.value)}
                    style={{
                      borderRadius: "var(--mantine-radius-md)",
                      border: currentPreset === preset.value
                        ? "2px solid var(--mantine-primary-color-filled)"
                        : "2px solid var(--mantine-color-default-border)",
                      overflow: "hidden",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {/* Mini preview */}
                    <Box
                      h={64}
                      style={{
                        background: preset.value === "bold"
                          ? `linear-gradient(135deg, ${preset.colors[0]}, ${preset.colors[1]})`
                          : preset.value === "gradient"
                            ? `linear-gradient(135deg, ${preset.colors[0]}, ${preset.colors[1]}, ${preset.colors[2]}20)`
                            : preset.colors[0],
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        padding: "0 12px",
                      }}
                    >
                      <Box
                        w={8} h={32}
                        style={{
                          borderRadius: 3,
                          backgroundColor: preset.colors[2] + "40",
                        }}
                      />
                      <Box style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                        <Box h={6} w="70%" style={{ borderRadius: 3, backgroundColor: preset.value === "bold" ? "#fff4" : "#0002" }} />
                        <Box h={4} w="100%" style={{ borderRadius: 2, backgroundColor: preset.value === "bold" ? "#fff2" : "#0001" }} />
                        <Box h={4} w="85%" style={{ borderRadius: 2, backgroundColor: preset.value === "bold" ? "#fff2" : "#0001" }} />
                      </Box>
                    </Box>
                    <Box p="xs" ta="center">
                      <Text size="xs" fw={600}>{preset.label}</Text>
                    </Box>
                  </UnstyledButton>
                ))}
              </SimpleGrid>
            </div>

            <Divider />

            {/* ── Colors ── */}
            <div>
              <Text size="sm" fw={600} mb="xs" tt="uppercase" c="dimmed" style={{ letterSpacing: "0.05em" }}>
                {t("Colors")}
              </Text>

              <Stack gap="md">
                <SimpleGrid cols={2}>
                  <ColorInput
                    label={t("Primary color")}
                    description={t("Main brand color for links and accents")}
                    value={settings.theme?.primaryColor || "#228be6"}
                    onChange={(v) => updateThemeField("primaryColor", v)}
                    format="hex"
                    swatches={COLOR_SWATCHES}
                  />
                  <ColorInput
                    label={t("Accent color")}
                    description={t("Secondary color for highlights")}
                    value={settings.theme?.accentColor || "#7950f2"}
                    onChange={(v) => updateThemeField("accentColor", v)}
                    format="hex"
                    swatches={COLOR_SWATCHES}
                  />
                </SimpleGrid>

                {/* Tint style selector */}
                <div>
                  <Text size="sm" fw={500} mb={4}>{t("Tint color")}</Text>
                  <Text size="xs" c="dimmed" mb="xs">{t("How the primary color tints the background")}</Text>
                  <SegmentedControl
                    value={settings.theme?.tintStyle || "none"}
                    onChange={(v) => updateThemeField("tintStyle", v)}
                    data={[
                      { label: t("None"), value: "none" },
                      { label: t("Subtle"), value: "subtle" },
                      { label: t("Bold"), value: "bold" },
                    ]}
                    size="sm"
                  />
                </div>

                {/* Color preview */}
                <Paper p="md" radius="md" withBorder>
                  <Text size="xs" c="dimmed" mb="sm" tt="uppercase" fw={600} style={{ letterSpacing: "0.05em" }}>
                    {t("Color preview")}
                  </Text>
                  <Group gap="md">
                    <Box
                      w={48} h={48}
                      style={{
                        borderRadius: "var(--mantine-radius-md)",
                        backgroundColor: settings.theme?.primaryColor || "#228be6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text size="xs" c="white" fw={700}>Aa</Text>
                    </Box>
                    <Box
                      w={48} h={48}
                      style={{
                        borderRadius: "var(--mantine-radius-md)",
                        backgroundColor: settings.theme?.accentColor || "#7950f2",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text size="xs" c="white" fw={700}>Aa</Text>
                    </Box>
                    <Stack gap={2}>
                      <Text size="sm" fw={500} style={{ color: settings.theme?.primaryColor || "#228be6" }}>
                        Primary link text
                      </Text>
                      <Text size="sm" fw={500} style={{ color: settings.theme?.accentColor || "#7950f2" }}>
                        Accent highlight
                      </Text>
                    </Stack>
                  </Group>
                </Paper>
              </Stack>
            </div>

            <Divider />

            {/* ── Site styles ── */}
            <div>
              <Text size="sm" fw={600} mb="xs" tt="uppercase" c="dimmed" style={{ letterSpacing: "0.05em" }}>
                {t("Site styles")}
              </Text>

              <Stack gap="md">
                <SimpleGrid cols={2}>
                  <TextInput
                    label={t("Font")}
                    description={t("Body text font family")}
                    placeholder="Inter, system-ui, sans-serif"
                    value={settings.theme?.fontFamily || ""}
                    onChange={(e) => updateThemeField("fontFamily", e.currentTarget.value)}
                    leftSection={<IconTypography size={16} />}
                  />
                  <TextInput
                    label={t("Monospace font")}
                    description={t("Font for code blocks")}
                    placeholder="JetBrains Mono, monospace"
                    value={settings.theme?.codeFontFamily || ""}
                    onChange={(e) => updateThemeField("codeFontFamily", e.currentTarget.value)}
                    leftSection={<IconCode size={16} />}
                  />
                </SimpleGrid>

                <SimpleGrid cols={2}>
                  <div>
                    <Text size="sm" fw={500} mb={4}>{t("Corner style")}</Text>
                    <SegmentedControl
                      value={settings.theme?.cornerStyle || "rounded"}
                      onChange={(v) => updateThemeField("cornerStyle", v)}
                      data={[
                        { label: t("Rounded"), value: "rounded" },
                        { label: t("Sharp"), value: "sharp" },
                      ]}
                      size="sm"
                      fullWidth
                    />
                  </div>
                  <div />
                </SimpleGrid>
              </Stack>
            </div>

            <Divider />

            {/* ── Sidebar styles ── */}
            <div>
              <Text size="sm" fw={600} mb="xs" tt="uppercase" c="dimmed" style={{ letterSpacing: "0.05em" }}>
                {t("Sidebar styles")}
              </Text>

              <Stack gap="md">
                <div>
                  <Text size="sm" fw={500} mb={4}>{t("Background")}</Text>
                  <Text size="xs" c="dimmed" mb="xs">{t("Sidebar background appearance")}</Text>
                  <SimpleGrid cols={2} spacing="sm" style={{ maxWidth: 320 }}>
                    {(["default", "filled"] as const).map((style) => (
                      <UnstyledButton
                        key={style}
                        onClick={() => updateThemeField("sidebarBackground", style)}
                        style={{
                          borderRadius: "var(--mantine-radius-md)",
                          border: (settings.theme?.sidebarBackground || "default") === style
                            ? "2px solid var(--mantine-primary-color-filled)"
                            : "2px solid var(--mantine-color-default-border)",
                          overflow: "hidden",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <Box h={48} style={{
                          display: "flex",
                          padding: "8px",
                          gap: 4,
                        }}>
                          <Box w={24} h="100%" style={{
                            borderRadius: 4,
                            backgroundColor: style === "filled"
                              ? (settings.theme?.primaryColor || "#228be6") + "18"
                              : "var(--mantine-color-default-hover)",
                          }} />
                          <Box style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
                            <Box h={4} w="60%" style={{ borderRadius: 2, backgroundColor: "#0001" }} />
                            <Box h={4} w="80%" style={{ borderRadius: 2, backgroundColor: "#0001" }} />
                          </Box>
                        </Box>
                        <Box p={6} ta="center">
                          <Text size="xs" fw={500} tt="capitalize">{style}</Text>
                        </Box>
                      </UnstyledButton>
                    ))}
                  </SimpleGrid>
                </div>

                <div>
                  <Text size="sm" fw={500} mb={4}>{t("List style")}</Text>
                  <Text size="xs" c="dimmed" mb="xs">{t("How nav items look in the sidebar")}</Text>
                  <SimpleGrid cols={3} spacing="sm" style={{ maxWidth: 480 }}>
                    {(["default", "pill", "line"] as const).map((style) => (
                      <UnstyledButton
                        key={style}
                        onClick={() => updateThemeField("sidebarListStyle", style)}
                        style={{
                          borderRadius: "var(--mantine-radius-md)",
                          border: (settings.theme?.sidebarListStyle || "default") === style
                            ? "2px solid var(--mantine-primary-color-filled)"
                            : "2px solid var(--mantine-color-default-border)",
                          overflow: "hidden",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <Box h={56} p="xs" style={{ display: "flex", flexDirection: "column", gap: 3, justifyContent: "center" }}>
                          {[0.7, 1, 0.5].map((w, i) => (
                            <Box key={i} h={12} style={{
                              borderRadius: style === "pill" ? 6 : 3,
                              width: `${w * 85}%`,
                              backgroundColor: i === 1
                                ? style === "line"
                                  ? "transparent"
                                  : (settings.theme?.primaryColor || "#228be6") + "20"
                                : "transparent",
                              borderLeft: style === "line" && i === 1
                                ? `2px solid ${settings.theme?.primaryColor || "#228be6"}`
                                : "2px solid transparent",
                              paddingLeft: 6,
                              display: "flex",
                              alignItems: "center",
                            }}>
                              <Box h={3} w="100%" style={{ borderRadius: 1.5, backgroundColor: i === 1 ? "#0003" : "#0001" }} />
                            </Box>
                          ))}
                        </Box>
                        <Box p={6} ta="center">
                          <Text size="xs" fw={500} tt="capitalize">{style}</Text>
                        </Box>
                      </UnstyledButton>
                    ))}
                  </SimpleGrid>
                </div>
              </Stack>
            </div>

          </Stack>
        </Tabs.Panel>

        {/* ════════════════════════ LAYOUT TAB ════════════════════════ */}
        <Tabs.Panel value="layout" pt="lg">
          <Stack gap="xl">

            {/* ── Header ── */}
            <Paper p="lg" radius="md" withBorder>
              <Group justify="space-between" mb="md">
                <div>
                  <Text fw={600}>{t("Header")}</Text>
                  <Text size="xs" c="dimmed">{t("Controls the top navigation bar")}</Text>
                </div>
                <Switch
                  checked={settings.headerEnabled !== false}
                  onChange={(e) => updateField("headerEnabled", e.currentTarget.checked)}
                  size="md"
                />
              </Group>

              {settings.headerEnabled !== false && (
                <Stack gap="md">
                  <div>
                    <Text size="sm" fw={500} mb={4}>{t("Search bar")}</Text>
                    <Text size="xs" c="dimmed" mb="xs">
                      {t("Pick the style of the search bar. On small screens it's displayed as an icon button.")}
                    </Text>
                    <SegmentedControl
                      value={settings.searchBarStyle || "default"}
                      onChange={(v) => updateField("searchBarStyle", v)}
                      data={[
                        { label: t("Default"), value: "default" },
                        { label: t("Subtle"), value: "subtle" },
                      ]}
                      size="sm"
                    />
                  </div>

                  <Divider />

                  <div>
                    <Group justify="space-between" mb="xs">
                      <div>
                        <Text size="sm" fw={500}>{t("Navigation")}</Text>
                        <Text size="xs" c="dimmed">
                          {t("Header navigation items. Links open directly, menus show a dropdown.")}
                        </Text>
                      </div>
                      <Button variant="light" size="xs" leftSection={<IconPlus size={14} />} onClick={addNavItem}>
                        {t("Add Item")}
                      </Button>
                    </Group>

                    <Stack gap="xs">
                      {navItems.length === 0 && (
                        <Paper p="md" radius="md" ta="center" style={{ background: "var(--mantine-color-default-hover)" }}>
                          <Text size="sm" c="dimmed">{t("No navigation items. Click 'Add Item' to create one.")}</Text>
                        </Paper>
                      )}

                      {navItems.map((item, index) => (
                        <Paper key={index} p="sm" radius="md" withBorder>
                          <Group gap="sm" align="flex-end" wrap="nowrap">
                            <ActionIcon variant="subtle" color="gray" size="sm" style={{ cursor: "grab" }}>
                              <IconGripVertical size={14} />
                            </ActionIcon>
                            <TextInput
                              label={index === 0 ? t("Label") : undefined}
                              placeholder="Proxy"
                              value={item.label}
                              onChange={(e) => updateNavItem(index, "label", e.currentTarget.value)}
                              style={{ flex: 1 }}
                              size="sm"
                            />
                            <TextInput
                              label={index === 0 ? t("URL") : undefined}
                              placeholder="https://example.com"
                              value={item.url}
                              onChange={(e) => updateNavItem(index, "url", e.currentTarget.value)}
                              style={{ flex: 2 }}
                              size="sm"
                            />
                            <Select
                              label={index === 0 ? t("Type") : undefined}
                              data={[
                                { value: "link", label: "Link" },
                                { value: "menu", label: "Menu" },
                              ]}
                              value={item.type || "link"}
                              onChange={(v) => updateNavItem(index, "type", v || "link")}
                              style={{ width: 100 }}
                              size="sm"
                            />
                            <Tooltip label={t("Remove")}>
                              <ActionIcon variant="subtle" color="red" onClick={() => removeNavItem(index)} size="lg">
                                <IconTrash size={16} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                        </Paper>
                      ))}
                    </Stack>
                  </div>
                </Stack>
              )}
            </Paper>

            {/* ── Announcement ── */}
            <Paper p="lg" radius="md" withBorder>
              <Group justify="space-between" mb={settings.announcementEnabled ? "md" : 0}>
                <div>
                  <Text fw={600}>{t("Announcement")}</Text>
                  <Text size="xs" c="dimmed">{t("Display a banner at the top of your site")}</Text>
                </div>
                <Switch
                  checked={settings.announcementEnabled || false}
                  onChange={(e) => updateField("announcementEnabled", e.currentTarget.checked)}
                  size="md"
                />
              </Group>

              {settings.announcementEnabled && (
                <Stack gap="sm">
                  <TextInput
                    label={t("Announcement text")}
                    placeholder="🎉 We just launched v2.0!"
                    value={settings.announcementText || ""}
                    onChange={(e) => updateField("announcementText", e.currentTarget.value)}
                  />
                  <TextInput
                    label={t("Link URL (optional)")}
                    placeholder="https://blog.example.com/v2-launch"
                    value={settings.announcementUrl || ""}
                    onChange={(e) => updateField("announcementUrl", e.currentTarget.value)}
                    leftSection={<IconLink size={16} />}
                  />
                </Stack>
              )}
            </Paper>

            {/* ── Pagination ── */}
            <Paper p="lg" radius="md" withBorder>
              <Group justify="space-between">
                <div>
                  <Text fw={600}>{t("Pagination")}</Text>
                  <Text size="xs" c="dimmed">
                    {t("Show previous/next navigation buttons at the bottom of each page.")}
                  </Text>
                </div>
                <Switch
                  checked={settings.paginationEnabled !== false}
                  onChange={(e) => updateField("paginationEnabled", e.currentTarget.checked)}
                  size="md"
                />
              </Group>
            </Paper>

            {/* ── Footer ── */}
            <Paper p="lg" radius="md" withBorder>
              <Group justify="space-between" mb={settings.footerEnabled !== false ? "md" : 0}>
                <div>
                  <Text fw={600}>{t("Footer")}</Text>
                  <Text size="xs" c="dimmed">{t("Footer links displayed at the bottom of your portal")}</Text>
                </div>
                <Switch
                  checked={settings.footerEnabled !== false}
                  onChange={(e) => updateField("footerEnabled", e.currentTarget.checked)}
                  size="md"
                />
              </Group>

              {settings.footerEnabled !== false && (
                <div>
                  <Group justify="flex-end" mb="xs">
                    <Button variant="light" size="xs" leftSection={<IconPlus size={14} />} onClick={addFooterLink}>
                      {t("Add link")}
                    </Button>
                  </Group>

                  <Stack gap="xs">
                    {footerLinks.length === 0 && (
                      <Paper p="md" radius="md" ta="center" style={{ background: "var(--mantine-color-default-hover)" }}>
                        <Text size="sm" c="dimmed">{t("No footer links configured.")}</Text>
                      </Paper>
                    )}

                    {footerLinks.map((link, index) => (
                      <Paper key={index} p="sm" radius="md" withBorder>
                        <Group gap="sm" align="flex-end" wrap="nowrap">
                          <TextInput
                            label={index === 0 ? t("Label") : undefined}
                            placeholder="Website"
                            value={link.label}
                            onChange={(e) => updateFooterLink(index, "label", e.currentTarget.value)}
                            style={{ flex: 1 }}
                            size="sm"
                          />
                          <TextInput
                            label={index === 0 ? t("URL") : undefined}
                            placeholder="https://example.com"
                            value={link.url}
                            onChange={(e) => updateFooterLink(index, "url", e.currentTarget.value)}
                            style={{ flex: 2 }}
                            size="sm"
                          />
                          <Tooltip label={t("Remove")}>
                            <ActionIcon variant="subtle" color="red" onClick={() => removeFooterLink(index)} size="lg">
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Paper>
                    ))}
                  </Stack>
                </div>
              )}
            </Paper>

          </Stack>
        </Tabs.Panel>

        {/* ════════════════════════ CONFIGURE TAB ════════════════════════ */}
        <Tabs.Panel value="configure" pt="lg">
          <Stack gap="xl">

            {/* ── Localization ── */}
            <Paper p="lg" radius="md" withBorder>
              <Text fw={600} mb="md">{t("Localize user interface")}</Text>
              <TextInput
                label={t("Supported locales")}
                description={t("Comma-separated language codes (e.g. en, ru, de, fr)")}
                placeholder="en, ru, de, fr"
                value={(settings.locales || []).join(", ")}
                onChange={(e) =>
                  updateField("locales", e.currentTarget.value.split(",").map((s) => s.trim()).filter(Boolean))
                }
                leftSection={<IconLanguage size={16} />}
              />
              {settings.locales && settings.locales.length > 0 && (
                <Group gap="xs" mt="sm">
                  {settings.locales.map((locale) => (
                    <Badge key={locale} variant="light" size="lg">{locale.toUpperCase()}</Badge>
                  ))}
                </Group>
              )}
            </Paper>

            {/* ── Primary link ── */}
            <Paper p="lg" radius="md" withBorder>
              <Text fw={600} mb={4}>{t("Primary link")}</Text>
              <Text size="xs" c="dimmed" mb="md">
                {t("The destination when visitors click the site title or logo in the header.")}
              </Text>
              <TextInput
                placeholder={t("Search for content or type a URL...")}
                value={settings.primaryLink || ""}
                onChange={(e) => updateField("primaryLink", e.currentTarget.value)}
                leftSection={<IconLink size={16} />}
              />
            </Paper>

            {/* ── External links ── */}
            <Paper p="lg" radius="md" withBorder>
              <Group justify="space-between">
                <div>
                  <Text fw={600}>{t("External links")}</Text>
                  <Text size="xs" c="dimmed">{t("Choose how external links open")}</Text>
                </div>
                <Select
                  value={settings.externalLinksTarget || "same_tab"}
                  onChange={(v) => updateField("externalLinksTarget", v)}
                  data={[
                    { value: "same_tab", label: t("Same tab") },
                    { value: "new_tab", label: t("New tab") },
                  ]}
                  size="sm"
                  style={{ width: 140 }}
                />
              </Group>
            </Paper>

            {/* ── Page ratings ── */}
            <Paper p="lg" radius="md" withBorder>
              <Group justify="space-between">
                <div>
                  <Text fw={600}>{t("Page ratings")}</Text>
                  <Text size="xs" c="dimmed">{t("Gather feedback from visitors on the quality of your content.")}</Text>
                </div>
                <Switch
                  checked={settings.pageRatingsEnabled || false}
                  onChange={(e) => updateField("pageRatingsEnabled", e.currentTarget.checked)}
                  size="md"
                />
              </Group>
            </Paper>

            {/* ── Domain & Analytics ── */}
            <Paper p="lg" radius="md" withBorder>
              <Text fw={600} mb="md">{t("Domain & Analytics")}</Text>
              <Stack gap="md">
                <TextInput
                  label={t("Custom domain")}
                  description={t("Point your domain's DNS to this server and enter it here")}
                  placeholder="docs.example.com"
                  value={settings.customDomain || ""}
                  onChange={(e) => updateField("customDomain", e.currentTarget.value)}
                  leftSection={<IconWorldWww size={16} />}
                />
                <TextInput
                  label={t("Analytics tracking ID")}
                  description={t("Google Analytics or similar tracking ID")}
                  placeholder="G-XXXXXXXXXX"
                  value={settings.analyticsId || ""}
                  onChange={(e) => updateField("analyticsId", e.currentTarget.value)}
                  leftSection={<IconDeviceAnalytics size={16} />}
                />
              </Stack>
            </Paper>

            {/* ── Privacy ── */}
            <Paper p="lg" radius="md" withBorder>
              <Text fw={600} mb={4}>{t("Privacy policy URL")}</Text>
              <Text size="xs" c="dimmed" mb="md">
                {t("Provide a privacy policy URL to help visitors understand cookie tracking.")}
              </Text>
              <TextInput
                placeholder="https://mycompany.com/privacy-policy"
                value={settings.privacyPolicyUrl || ""}
                onChange={(e) => updateField("privacyPolicyUrl", e.currentTarget.value)}
                leftSection={<IconShieldLock size={16} />}
              />
            </Paper>

            {/* ── Custom CSS ── */}
            <Paper p="lg" radius="md" withBorder>
              <Text fw={600} mb={4}>{t("Custom CSS")}</Text>
              <Text size="xs" c="dimmed" mb="md">
                {t("Additional CSS injected into the public portal. Use browser DevTools to inspect element classes.")}
              </Text>
              <Textarea
                placeholder={`.docs-portal-content {\n  font-size: 16px;\n}`}
                value={settings.customCss || ""}
                onChange={(e) => updateField("customCss", e.currentTarget.value)}
                autosize
                minRows={5}
                maxRows={14}
                styles={{
                  input: {
                    fontFamily: "ui-monospace, 'JetBrains Mono', 'Fira Code', monospace",
                    fontSize: 13,
                  },
                }}
              />
            </Paper>

          </Stack>
        </Tabs.Panel>

      </Tabs>

      {/* ═══ Bottom save ═══ */}
      <Group justify="flex-end" pt="sm" pb="md">
        <Button
          onClick={handleSave}
          loading={updateSpaceMutation.isPending}
          size="md"
          leftSection={<IconCheck size={18} />}
        >
          {t("Save portal settings")}
        </Button>
      </Group>
    </Stack>
  );
}

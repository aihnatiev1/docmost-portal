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
  Alert,
  Switch,
  Card,
  Code,
  Anchor,
  SimpleGrid,
  ActionIcon,
  Tooltip,
  CopyButton,
  Box,
  ThemeIcon,
  rem,
} from "@mantine/core";
import {
  IconBrush,
  IconSettings,
  IconWorldWww,
  IconCode,
  IconEye,
  IconExternalLink,
  IconCopy,
  IconCheck,
  IconLink,
  IconPalette,
  IconTypography,
  IconDeviceAnalytics,
  IconLanguage,
  IconPhoto,
  IconFileDescription,
  IconPlus,
  IconTrash,
  IconInfoCircle,
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
    updateField("footerLinks", [
      ...footerLinks,
      { label: "", url: "" },
    ]);
  };

  const updateFooterLink = (
    index: number,
    field: "label" | "url",
    value: string,
  ) => {
    const updated = [...footerLinks];
    updated[index] = { ...updated[index], [field]: value };
    updateField("footerLinks", updated);
  };

  const removeFooterLink = (index: number) => {
    updateField(
      "footerLinks",
      footerLinks.filter((_, i) => i !== index),
    );
  };

  const portalUrl = settings.customDomain
    ? `https://${settings.customDomain}`
    : spaceSlug
      ? `${window.location.origin}/docs/${spaceSlug}`
      : null;

  return (
    <Stack gap="lg">
      {/* Header */}
      <Group justify="space-between" align="center">
        <div>
          <Group gap="xs" mb={4}>
            <Text fw={700} size="lg">
              {t("Documentation Portal")}
            </Text>
            <Badge variant="light" color="blue" size="sm">
              Public
            </Badge>
          </Group>
          <Text size="sm" c="dimmed">
            {t(
              "Configure the public-facing documentation portal for this space.",
            )}
          </Text>
        </div>
        <Group gap="xs">
          {portalUrl && (
            <Tooltip label={t("Open portal")}>
              <ActionIcon
                variant="light"
                color="blue"
                component="a"
                href={portalUrl}
                target="_blank"
                size="lg"
              >
                <IconExternalLink size={18} />
              </ActionIcon>
            </Tooltip>
          )}
          <Button
            onClick={handleSave}
            loading={updateSpaceMutation.isPending}
            leftSection={<IconCheck size={16} />}
          >
            {t("Save settings")}
          </Button>
        </Group>
      </Group>

      {/* Portal URL */}
      {portalUrl && (
        <Alert
          variant="light"
          color="blue"
          icon={<IconWorldWww size={18} />}
          title={t("Portal URL")}
        >
          <Group gap="xs">
            <Code>{portalUrl}</Code>
            <CopyButton value={portalUrl}>
              {({ copied, copy }) => (
                <Tooltip label={copied ? t("Copied") : t("Copy URL")}>
                  <ActionIcon
                    variant="subtle"
                    color={copied ? "green" : "gray"}
                    onClick={copy}
                    size="sm"
                  >
                    {copied ? (
                      <IconCheck size={14} />
                    ) : (
                      <IconCopy size={14} />
                    )}
                  </ActionIcon>
                </Tooltip>
              )}
            </CopyButton>
          </Group>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs defaultValue="branding" variant="outline">
        <Tabs.List>
          <Tabs.Tab
            value="branding"
            leftSection={<IconBrush size={16} />}
          >
            {t("Branding")}
          </Tabs.Tab>
          <Tabs.Tab
            value="theme"
            leftSection={<IconPalette size={16} />}
          >
            {t("Theme")}
          </Tabs.Tab>
          <Tabs.Tab
            value="navigation"
            leftSection={<IconLink size={16} />}
          >
            {t("Navigation")}
          </Tabs.Tab>
          <Tabs.Tab
            value="advanced"
            leftSection={<IconSettings size={16} />}
          >
            {t("Advanced")}
          </Tabs.Tab>
        </Tabs.List>

        {/* ======= BRANDING TAB ======= */}
        <Tabs.Panel value="branding" pt="md">
          <Stack gap="md">
            <TextInput
              label={t("Portal title")}
              description={t(
                "Displayed in the header and browser tab",
              )}
              placeholder="e.g. Proxy-Seller Documentation"
              value={settings.title || ""}
              onChange={(e) =>
                updateField("title", e.currentTarget.value)
              }
              leftSection={<IconFileDescription size={16} />}
            />

            <Textarea
              label={t("Portal description")}
              description={t(
                "Used for SEO meta description and search engines",
              )}
              placeholder="Complete guide to our services and API"
              value={settings.description || ""}
              onChange={(e) =>
                updateField("description", e.currentTarget.value)
              }
              autosize
              minRows={2}
              maxRows={4}
            />

            <SimpleGrid cols={2}>
              <TextInput
                label={t("Logo URL")}
                description={t("Shown in the portal header")}
                placeholder="/attachments/logo.svg"
                value={settings.logo || ""}
                onChange={(e) =>
                  updateField("logo", e.currentTarget.value)
                }
                leftSection={<IconPhoto size={16} />}
              />

              <TextInput
                label={t("Favicon URL")}
                description={t("Browser tab icon")}
                placeholder="/attachments/favicon.ico"
                value={settings.favicon || ""}
                onChange={(e) =>
                  updateField("favicon", e.currentTarget.value)
                }
                leftSection={<IconPhoto size={16} />}
              />
            </SimpleGrid>

            {/* Logo Preview */}
            {settings.logo && (
              <Card withBorder padding="md" radius="md">
                <Text size="xs" c="dimmed" mb="xs" tt="uppercase" fw={600}>
                  {t("Logo preview")}
                </Text>
                <Group>
                  <Paper
                    p="sm"
                    radius="sm"
                    style={{
                      background:
                        "var(--mantine-color-default-hover)",
                    }}
                  >
                    <img
                      src={settings.logo}
                      alt="Logo preview"
                      style={{
                        height: 32,
                        width: "auto",
                        display: "block",
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display =
                          "none";
                      }}
                    />
                  </Paper>
                  <Text size="sm" c="dimmed">
                    {settings.title || "Documentation"}
                  </Text>
                </Group>
              </Card>
            )}
          </Stack>
        </Tabs.Panel>

        {/* ======= THEME TAB ======= */}
        <Tabs.Panel value="theme" pt="md">
          <Stack gap="md">
            <SimpleGrid cols={2}>
              <ColorInput
                label={t("Primary color")}
                description={t(
                  "Main brand color for links and accents",
                )}
                value={settings.theme?.primaryColor || "#2563EB"}
                onChange={(v) => updateThemeField("primaryColor", v)}
                format="hex"
                swatches={[
                  "#2563EB",
                  "#7C3AED",
                  "#059669",
                  "#DC2626",
                  "#D97706",
                  "#2563EB",
                  "#0891B2",
                  "#4F46E5",
                ]}
              />
              <ColorInput
                label={t("Accent color")}
                description={t(
                  "Secondary color for highlights",
                )}
                value={settings.theme?.accentColor || "#7C3AED"}
                onChange={(v) => updateThemeField("accentColor", v)}
                format="hex"
                swatches={[
                  "#7C3AED",
                  "#2563EB",
                  "#059669",
                  "#DC2626",
                  "#D97706",
                  "#EC4899",
                  "#0891B2",
                  "#4F46E5",
                ]}
              />
            </SimpleGrid>

            {/* Color Preview */}
            <Card withBorder padding="md" radius="md">
              <Text
                size="xs"
                c="dimmed"
                mb="xs"
                tt="uppercase"
                fw={600}
              >
                {t("Color preview")}
              </Text>
              <Group gap="md">
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 8,
                    backgroundColor:
                      settings.theme?.primaryColor || "#2563EB",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text size="xs" c="white" fw={600}>
                    Aa
                  </Text>
                </div>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 8,
                    backgroundColor:
                      settings.theme?.accentColor || "#7C3AED",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text size="xs" c="white" fw={600}>
                    Aa
                  </Text>
                </div>
                <Stack gap={2}>
                  <Text
                    size="sm"
                    fw={500}
                    style={{
                      color:
                        settings.theme?.primaryColor || "#2563EB",
                    }}
                  >
                    Primary link text
                  </Text>
                  <Text
                    size="sm"
                    fw={500}
                    style={{
                      color:
                        settings.theme?.accentColor || "#7C3AED",
                    }}
                  >
                    Accent highlight
                  </Text>
                </Stack>
              </Group>
            </Card>

            <SimpleGrid cols={2}>
              <TextInput
                label={t("Body font")}
                description={t("Main text font family")}
                placeholder="Inter, system-ui, sans-serif"
                value={settings.theme?.fontFamily || ""}
                onChange={(e) =>
                  updateThemeField(
                    "fontFamily",
                    e.currentTarget.value,
                  )
                }
                leftSection={<IconTypography size={16} />}
              />
              <TextInput
                label={t("Code font")}
                description={t("Font for code blocks")}
                placeholder="JetBrains Mono, monospace"
                value={settings.theme?.codeFontFamily || ""}
                onChange={(e) =>
                  updateThemeField(
                    "codeFontFamily",
                    e.currentTarget.value,
                  )
                }
                leftSection={<IconCode size={16} />}
              />
            </SimpleGrid>
          </Stack>
        </Tabs.Panel>

        {/* ======= NAVIGATION TAB ======= */}
        <Tabs.Panel value="navigation" pt="md">
          <Stack gap="md">
            <div>
              <Group justify="space-between" mb="xs">
                <div>
                  <Text size="sm" fw={500}>
                    {t("Footer links")}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {t(
                      "Links displayed at the bottom of every documentation page",
                    )}
                  </Text>
                </div>
                <Button
                  variant="light"
                  size="xs"
                  leftSection={<IconPlus size={14} />}
                  onClick={addFooterLink}
                >
                  {t("Add link")}
                </Button>
              </Group>

              <Stack gap="xs">
                {footerLinks.length === 0 && (
                  <Card
                    withBorder
                    padding="lg"
                    radius="md"
                    ta="center"
                  >
                    <Text size="sm" c="dimmed">
                      {t(
                        "No footer links configured. Click 'Add link' to create one.",
                      )}
                    </Text>
                  </Card>
                )}

                {footerLinks.map((link, index) => (
                  <Card
                    key={index}
                    withBorder
                    padding="sm"
                    radius="md"
                  >
                    <Group gap="sm" align="flex-end" wrap="nowrap">
                      <TextInput
                        label={index === 0 ? t("Label") : undefined}
                        placeholder="Website"
                        value={link.label}
                        onChange={(e) =>
                          updateFooterLink(
                            index,
                            "label",
                            e.currentTarget.value,
                          )
                        }
                        style={{ flex: 1 }}
                        size="sm"
                      />
                      <TextInput
                        label={index === 0 ? t("URL") : undefined}
                        placeholder="https://example.com"
                        value={link.url}
                        onChange={(e) =>
                          updateFooterLink(
                            index,
                            "url",
                            e.currentTarget.value,
                          )
                        }
                        style={{ flex: 2 }}
                        size="sm"
                      />
                      <Tooltip label={t("Remove")}>
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={() => removeFooterLink(index)}
                          size="lg"
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Card>
                ))}
              </Stack>
            </div>

            <TextInput
              label={t("Supported locales")}
              description={t(
                "Comma-separated language codes for multilingual support",
              )}
              placeholder="en, ru, de, fr"
              value={(settings.locales || []).join(", ")}
              onChange={(e) =>
                updateField(
                  "locales",
                  e.currentTarget.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                )
              }
              leftSection={<IconLanguage size={16} />}
            />

            {settings.locales && settings.locales.length > 0 && (
              <Group gap="xs">
                {settings.locales.map((locale) => (
                  <Badge key={locale} variant="light" size="lg">
                    {locale.toUpperCase()}
                  </Badge>
                ))}
              </Group>
            )}
          </Stack>
        </Tabs.Panel>

        {/* ======= ADVANCED TAB ======= */}
        <Tabs.Panel value="advanced" pt="md">
          <Stack gap="md">
            <TextInput
              label={t("Custom domain")}
              description={t(
                "Point your domain's DNS to this server and enter it here",
              )}
              placeholder="docs.example.com"
              value={settings.customDomain || ""}
              onChange={(e) =>
                updateField("customDomain", e.currentTarget.value)
              }
              leftSection={<IconWorldWww size={16} />}
            />

            <TextInput
              label={t("Analytics tracking ID")}
              description={t(
                "Google Analytics or similar tracking ID",
              )}
              placeholder="G-XXXXXXXXXX"
              value={settings.analyticsId || ""}
              onChange={(e) =>
                updateField("analyticsId", e.currentTarget.value)
              }
              leftSection={<IconDeviceAnalytics size={16} />}
            />

            <Textarea
              label={t("Custom CSS")}
              description={t(
                "Additional CSS injected into the public portal",
              )}
              placeholder={`.docs-portal-content {\n  font-size: 16px;\n}`}
              value={settings.customCss || ""}
              onChange={(e) =>
                updateField("customCss", e.currentTarget.value)
              }
              autosize
              minRows={4}
              maxRows={12}
              styles={{
                input: {
                  fontFamily:
                    "ui-monospace, 'JetBrains Mono', 'Fira Code', monospace",
                  fontSize: 13,
                },
              }}
            />

            <Alert
              variant="light"
              color="gray"
              icon={<IconInfoCircle size={18} />}
            >
              <Text size="sm">
                {t(
                  "Custom CSS is applied globally to the public documentation portal. Use browser DevTools to inspect element classes.",
                )}
              </Text>
            </Alert>
          </Stack>
        </Tabs.Panel>
      </Tabs>

      {/* Bottom save bar */}
      <Group justify="flex-end" pt="sm">
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

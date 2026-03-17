import { useState, useEffect } from "react";
import {
  Stack,
  TextInput,
  Textarea,
  ColorInput,
  Button,
  Group,
  Text,
  Paper,
  JsonInput,
  Divider,
} from "@mantine/core";
import { useUpdateSpaceMutation } from "@/features/space/queries/space-query";
import { IPortalSettings } from "@/features/space/types/space.types";
import { useTranslation } from "react-i18next";
import { notifications } from "@mantine/notifications";

interface PortalSettingsFormProps {
  spaceId: string;
  portalSettings: IPortalSettings;
}

export function PortalSettingsForm({
  spaceId,
  portalSettings,
}: PortalSettingsFormProps) {
  const { t } = useTranslation();
  const updateSpaceMutation = useUpdateSpaceMutation();

  const [settings, setSettings] = useState<IPortalSettings>(
    portalSettings || {},
  );

  useEffect(() => {
    setSettings(portalSettings || {});
  }, [portalSettings]);

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
        message: t("Portal settings saved"),
        color: "green",
      });
    } catch {
      notifications.show({
        message: t("Failed to save portal settings"),
        color: "red",
      });
    }
  };

  return (
    <Paper p="md">
      <Stack gap="md">
        <Text fw={600} size="lg">
          {t("Documentation Portal Settings")}
        </Text>

        <Divider label={t("Branding")} labelPosition="left" />

        <TextInput
          label={t("Portal title")}
          placeholder="e.g. Proxy-Seller Documentation"
          value={settings.title || ""}
          onChange={(e) => updateField("title", e.currentTarget.value)}
        />

        <Textarea
          label={t("Portal description")}
          placeholder="Complete guide to services"
          value={settings.description || ""}
          onChange={(e) => updateField("description", e.currentTarget.value)}
          autosize
          minRows={2}
          maxRows={4}
        />

        <TextInput
          label={t("Logo URL")}
          placeholder="/attachments/logo.svg"
          value={settings.logo || ""}
          onChange={(e) => updateField("logo", e.currentTarget.value)}
        />

        <TextInput
          label={t("Favicon URL")}
          placeholder="/attachments/favicon.ico"
          value={settings.favicon || ""}
          onChange={(e) => updateField("favicon", e.currentTarget.value)}
        />

        <Divider label={t("Theme")} labelPosition="left" />

        <Group grow>
          <ColorInput
            label={t("Primary color")}
            value={settings.theme?.primaryColor || "#2563EB"}
            onChange={(v) => updateThemeField("primaryColor", v)}
          />
          <ColorInput
            label={t("Accent color")}
            value={settings.theme?.accentColor || "#7C3AED"}
            onChange={(v) => updateThemeField("accentColor", v)}
          />
        </Group>

        <Group grow>
          <TextInput
            label={t("Body font")}
            placeholder="Inter"
            value={settings.theme?.fontFamily || ""}
            onChange={(e) =>
              updateThemeField("fontFamily", e.currentTarget.value)
            }
          />
          <TextInput
            label={t("Code font")}
            placeholder="JetBrains Mono"
            value={settings.theme?.codeFontFamily || ""}
            onChange={(e) =>
              updateThemeField("codeFontFamily", e.currentTarget.value)
            }
          />
        </Group>

        <Divider label={t("Advanced")} labelPosition="left" />

        <TextInput
          label={t("Custom domain")}
          placeholder="docs.proxy-seller.com"
          value={settings.customDomain || ""}
          onChange={(e) => updateField("customDomain", e.currentTarget.value)}
        />

        <TextInput
          label={t("Analytics tracking ID")}
          placeholder="G-XXXXXXXXXX"
          value={settings.analyticsId || ""}
          onChange={(e) => updateField("analyticsId", e.currentTarget.value)}
        />

        <Textarea
          label={t("Custom CSS")}
          placeholder=".docs-portal { }"
          value={settings.customCss || ""}
          onChange={(e) => updateField("customCss", e.currentTarget.value)}
          autosize
          minRows={3}
          maxRows={10}
          styles={{ input: { fontFamily: "monospace" } }}
        />

        <JsonInput
          label={t("Footer links (JSON)")}
          placeholder={`[{"label": "Website", "url": "https://example.com"}]`}
          value={
            settings.footerLinks
              ? JSON.stringify(settings.footerLinks, null, 2)
              : ""
          }
          onChange={(value) => {
            try {
              const parsed = JSON.parse(value);
              updateField("footerLinks", parsed);
            } catch {
              // ignore invalid JSON while typing
            }
          }}
          autosize
          minRows={3}
          maxRows={6}
        />

        <TextInput
          label={t("Supported locales (comma-separated)")}
          placeholder="en, ru"
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
        />

        <Group justify="flex-end">
          <Button
            onClick={handleSave}
            loading={updateSpaceMutation.isPending}
          >
            {t("Save portal settings")}
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}

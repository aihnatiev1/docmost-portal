import React, { useState } from "react";
import { useSpaceQuery, useUpdateSpaceMutation } from "@/features/space/queries/space-query.ts";
import { EditSpaceForm } from "@/features/space/components/edit-space-form.tsx";
import { Button, Divider, Text, Switch, Group, Badge, CopyButton, ActionIcon, Tooltip, Code } from "@mantine/core";
import { IconWorld, IconCopy, IconCheck, IconExternalLink } from "@tabler/icons-react";
import DeleteSpaceModal from "./delete-space-modal";
import { useDisclosure } from "@mantine/hooks";
import ExportModal from "@/components/common/export-modal.tsx";
import { PortalSettingsForm } from "@/features/space/components/portal-settings-form.tsx";
import { notifications } from "@mantine/notifications";
import AvatarUploader from "@/components/common/avatar-uploader.tsx";
import {
  uploadSpaceIcon,
  removeSpaceIcon,
} from "@/features/attachments/services/attachment-service.ts";
import { useTranslation } from "react-i18next";
import { AvatarIconType } from "@/features/attachments/types/attachment.types.ts";
import { queryClient } from "@/main.tsx";
import {
  ResponsiveSettingsContent,
  ResponsiveSettingsControl,
  ResponsiveSettingsRow,
} from "@/components/ui/responsive-settings-row.tsx";


interface SpaceDetailsProps {
  spaceId: string;
  readOnly?: boolean;
}
export default function SpaceDetails({ spaceId, readOnly }: SpaceDetailsProps) {
  const { t } = useTranslation();
  const { data: space, isLoading, refetch } = useSpaceQuery(spaceId);
  const [exportOpened, { open: openExportModal, close: closeExportModal }] =
    useDisclosure(false);
  const [isIconUploading, setIsIconUploading] = useState(false);

  const handleIconUpload = async (file: File) => {
    setIsIconUploading(true);
    try {
      await uploadSpaceIcon(file, spaceId);
      await refetch();
      await queryClient.invalidateQueries({
        predicate: (item) => ["spaces"].includes(item.queryKey[0] as string),
      });
    } catch (err) {
      // skip
    } finally {
      setIsIconUploading(false);
    }
  };

  const handleIconRemove = async () => {
    setIsIconUploading(true);
    try {
      await removeSpaceIcon(spaceId);
      await refetch();
      await queryClient.invalidateQueries({
        predicate: (item) => ["spaces"].includes(item.queryKey[0] as string),
      });
    } catch (err) {
      // skip
    } finally {
      setIsIconUploading(false);
    }
  };

  return (
    <>
      {space && (
        <div>
          <Text my="md" fw={600}>
            {t("Details")}
          </Text>

          <div style={{ marginBottom: "20px" }}>
            <Text size="sm" fw={500} mb="xs">
              {t("Icon")}
            </Text>
            <AvatarUploader
              currentImageUrl={space.logo}
              fallbackName={space.name}
              size={"60px"}
              variant="filled"
              type={AvatarIconType.SPACE_ICON}
              onUpload={handleIconUpload}
              onRemove={handleIconRemove}
              isLoading={isIconUploading}
              disabled={readOnly}
            />
          </div>

          <EditSpaceForm space={space} readOnly={readOnly} />

          {/* Public Documentation Portal toggle */}
          {!readOnly && (
            <>
              <Divider my="lg" />
              <PublicPortalToggle space={space} />
            </>
          )}

          {/* Portal Settings — shown when type=documentation */}
          {space.type === "documentation" && !readOnly && (
            <>
              <Divider my="lg" />
              <PortalSettingsForm
                spaceId={space.id}
                portalSettings={space.portalSettings || {}}
                spaceSlug={space.slug}
              />
            </>
          )}

          {!readOnly && (
            <>
              <Divider my="lg" />

              <ResponsiveSettingsRow>
                <ResponsiveSettingsContent>
                  <Text size="md">{t("Export space")}</Text>
                  <Text size="sm" c="dimmed">
                    {t("Export all pages and attachments in this space.")}
                  </Text>
                </ResponsiveSettingsContent>
                <ResponsiveSettingsControl>
                  <Button onClick={openExportModal}>{t("Export")}</Button>
                </ResponsiveSettingsControl>
              </ResponsiveSettingsRow>

              <Divider my="lg" />

              <ResponsiveSettingsRow>
                <ResponsiveSettingsContent>
                  <Text size="md">{t("Delete space")}</Text>
                  <Text size="sm" c="dimmed">
                    {t("Delete this space with all its pages and data.")}
                  </Text>
                </ResponsiveSettingsContent>
                <ResponsiveSettingsControl>
                  <DeleteSpaceModal space={space} />
                </ResponsiveSettingsControl>
              </ResponsiveSettingsRow>

              <ExportModal
                type="space"
                id={space.id}
                open={exportOpened}
                onClose={closeExportModal}
              />
            </>
          )}
        </div>
      )}
    </>
  );
}

function PublicPortalToggle({ space }: { space: any }) {
  const { t } = useTranslation();
  const updateMutation = useUpdateSpaceMutation();
  const isDocumentation = space.type === "documentation";
  const portalUrl = `${window.location.origin}/docs/${space.slug}`;

  const handleToggle = () => {
    const newType = isDocumentation ? "default" : "documentation";
    updateMutation.mutate(
      { spaceId: space.id, type: newType } as any,
      {
        onSuccess: () => {
          notifications.show({
            message: newType === "documentation"
              ? t("Public portal enabled")
              : t("Public portal disabled"),
          });
        },
      },
    );
  };

  return (
    <div>
      <Group justify="space-between" align="flex-start">
        <div>
          <Group gap="xs" mb={4}>
            <IconWorld size={18} style={{ color: "var(--accent-indigo, #6366F1)" }} />
            <Text fw={600}>{t("Public documentation portal")}</Text>
          </Group>
          <Text size="sm" c="dimmed" maw={400}>
            {t("Make all pages in this space publicly accessible without login. Draft pages remain hidden.")}
          </Text>
        </div>
        <Switch
          checked={isDocumentation}
          onChange={handleToggle}
          size="md"
          color="indigo"
          disabled={updateMutation.isPending}
        />
      </Group>

      {isDocumentation && (
        <Group mt="md" gap="xs">
          <Badge variant="light" color="green" size="sm">
            {t("Live")}
          </Badge>
          <Code style={{ flex: 1, fontSize: 12 }}>{portalUrl}</Code>
          <CopyButton value={portalUrl}>
            {({ copied, copy }) => (
              <Tooltip label={copied ? t("Copied") : t("Copy link")}>
                <ActionIcon variant="subtle" color={copied ? "green" : "gray"} onClick={copy} size="sm">
                  {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                </ActionIcon>
              </Tooltip>
            )}
          </CopyButton>
          <Tooltip label={t("Open portal")}>
            <ActionIcon variant="subtle" color="gray" component="a" href={portalUrl} target="_blank" size="sm">
              <IconExternalLink size={14} />
            </ActionIcon>
          </Tooltip>
        </Group>
      )}
    </div>
  );
}

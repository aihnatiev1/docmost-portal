import {
  ActionIcon,
  Group,
  Menu,
  Text,
  TextInput,
  Tooltip,
  UnstyledButton,
  Modal,
  Button,
  Stack,
  Select,
} from "@mantine/core";
import {
  IconArrowDown,
  IconDots,
  IconFileExport,
  IconFileText,
  IconFolder,
  IconHome,
  IconLink,
  IconPlus,
  IconSearch,
  IconSettings,
  IconTrash,
} from "@tabler/icons-react";
import classes from "./space-sidebar.module.css";
import React, { useCallback, useEffect, useState } from "react";
import { useAtom } from "jotai";
import { treeApiAtom } from "@/features/page/tree/atoms/tree-api-atom.ts";
import { setDeleteInsertFn, setMoveInsertFn, SidebarInsert } from "@/features/page/tree/atoms/sidebar-insert-atoms.ts";
import { Link, useLocation, useParams } from "react-router-dom";
import clsx from "clsx";
import { useDisclosure } from "@mantine/hooks";
import SpaceSettingsModal from "@/features/space/components/settings-modal.tsx";
import { useGetSpaceBySlugQuery, useUpdateSpaceMutation } from "@/features/space/queries/space-query.ts";
import { getSpaceUrl } from "@/lib/config.ts";
import SpaceTree from "@/features/page/tree/components/space-tree.tsx";
import { useSpaceAbility } from "@/features/space/permissions/use-space-ability.ts";
import {
  SpaceCaslAction,
  SpaceCaslSubject,
} from "@/features/space/permissions/permissions.type.ts";
import PageImportModal from "@/features/page/components/page-import-modal.tsx";
import { useTranslation } from "react-i18next";
import { SwitchSpace } from "./switch-space";
import ExportModal from "@/components/common/export-modal";
import { mobileSidebarAtom } from "@/components/layouts/global/hooks/atoms/sidebar-atom.ts";
import { useToggleSidebar } from "@/components/layouts/global/hooks/hooks/use-toggle-sidebar.ts";
import { searchSpotlight } from "@/features/search/constants";

export function SpaceSidebar() {
  const { t } = useTranslation();
  const [tree] = useAtom(treeApiAtom);
  const location = useLocation();
  const [opened, { open: openSettings, close: closeSettings }] =
    useDisclosure(false);
  const [mobileSidebarOpened] = useAtom(mobileSidebarAtom);
  const toggleMobileSidebar = useToggleSidebar(mobileSidebarAtom);

  const { spaceSlug } = useParams();
  const { data: space } = useGetSpaceBySlugQuery(spaceSlug);

  const spaceRules = space?.membership?.permissions;
  const spaceAbility = useSpaceAbility(spaceRules);

  // Sidebar insert modal state
  const [insertModalOpened, { open: openInsertModal, close: closeInsertModal }] =
    useDisclosure(false);
  const [insertType, setInsertType] = useState<"header" | "link">("header");
  const [insertLabel, setInsertLabel] = useState("");
  const [insertUrl, setInsertUrl] = useState("");
  const [insertPosition, setInsertPosition] = useState(0);
  const updateSpaceMutation = useUpdateSpaceMutation();

  // Helper to get parsed portalSettings
  const getPortalSettings = useCallback(() => {
    const raw = space?.portalSettings;
    return typeof raw === 'string'
      ? (() => { try { return JSON.parse(raw); } catch { return {}; } })()
      : raw || {};
  }, [space?.portalSettings]);

  // Register delete callback for sidebar inserts (used by tree Node component)
  useEffect(() => {
    if (!space) return;
    setDeleteInsertFn(async (insert: SidebarInsert) => {
      const portalSettings = getPortalSettings();
      const existing: SidebarInsert[] = portalSettings.sidebarInserts || [];
      const updated = existing.filter(
        (ins) => !(ins.type === insert.type && ins.label === insert.label && ins.position === insert.position)
      );
      await updateSpaceMutation.mutateAsync({
        spaceId: space.id,
        portalSettings: { ...portalSettings, sidebarInserts: updated },
      });
    });

    setMoveInsertFn(async (insert: SidebarInsert, newPosition: number) => {
      const portalSettings = getPortalSettings();
      const existing: SidebarInsert[] = portalSettings.sidebarInserts || [];
      const updated = existing.map((ins) => {
        if (ins.type === insert.type && ins.label === insert.label && ins.position === insert.position) {
          return { ...ins, position: newPosition };
        }
        return ins;
      });
      await updateSpaceMutation.mutateAsync({
        spaceId: space.id,
        portalSettings: { ...portalSettings, sidebarInserts: updated },
      });
    });

    return () => {
      setDeleteInsertFn(null);
      setMoveInsertFn(null);
    };
  }, [space?.id, space?.portalSettings]);

  if (!space) {
    return <></>;
  }

  function handleCreatePage() {
    tree?.create({ parentId: null, type: "internal", index: 0 });
  }

  function openGroupModal() {
    setInsertType("header");
    setInsertLabel("");
    setInsertUrl("");
    setInsertPosition(0);
    openInsertModal();
  }

  function openLinkModal() {
    setInsertType("link");
    setInsertLabel("");
    setInsertUrl("https://");
    setInsertPosition(0);
    openInsertModal();
  }

  async function handleAddInsert() {
    if (!insertLabel.trim()) return;

    const portalSettings = getPortalSettings();
    const existing = portalSettings.sidebarInserts || [];
    const newInsert: any = {
      type: insertType,
      label: insertLabel.trim(),
      position: insertPosition,
    };
    if (insertType === "link") {
      newInsert.url = insertUrl.trim();
    }

    const updated = [...existing, newInsert];
    await updateSpaceMutation.mutateAsync({
      spaceId: space.id,
      portalSettings: { ...portalSettings, sidebarInserts: updated },
    });

    // For groups, also create an empty page at that position
    if (insertType === "header") {
      setTimeout(() => {
        tree?.create({ parentId: null, type: "internal", index: insertPosition });
      }, 300);
    }

    closeInsertModal();
  }

  return (
    <>
      <div className={classes.navbar}>
        <div
          className={classes.section}
          style={{
            border: "none",
            marginTop: 2,
            marginBottom: 3,
          }}
        >
          <SwitchSpace
            spaceName={space?.name}
            spaceSlug={space?.slug}
            spaceIcon={space?.logo}
          />
        </div>

        <div className={classes.section}>
          <div className={classes.menuItems}>
            <UnstyledButton
              component={Link}
              to={getSpaceUrl(spaceSlug)}
              className={clsx(
                classes.menu,
                location.pathname.toLowerCase() === getSpaceUrl(spaceSlug)
                  ? classes.activeButton
                  : "",
              )}
            >
              <div className={classes.menuItemInner}>
                <IconHome
                  size={18}
                  className={classes.menuItemIcon}
                  stroke={2}
                />
                <span>{t("Overview")}</span>
              </div>
            </UnstyledButton>

            <UnstyledButton
              className={classes.menu}
              onClick={searchSpotlight.open}
            >
              <div className={classes.menuItemInner}>
                <IconSearch
                  size={18}
                  className={classes.menuItemIcon}
                  stroke={2}
                />
                <span>{t("Search")}</span>
              </div>
            </UnstyledButton>

            <UnstyledButton className={classes.menu} onClick={openSettings}>
              <div className={classes.menuItemInner}>
                <IconSettings
                  size={18}
                  className={classes.menuItemIcon}
                  stroke={2}
                />
                <span>{t("Space settings")}</span>
              </div>
            </UnstyledButton>

            {spaceAbility.can(
              SpaceCaslAction.Manage,
              SpaceCaslSubject.Page,
            ) && (
              <UnstyledButton
                className={classes.menu}
                onClick={() => {
                  handleCreatePage();
                  if (mobileSidebarOpened) {
                    toggleMobileSidebar();
                  }
                }}
              >
                <div className={classes.menuItemInner}>
                  <IconPlus
                    size={18}
                    className={classes.menuItemIcon}
                    stroke={2}
                  />
                  <span>{t("New page")}</span>
                </div>
              </UnstyledButton>
            )}
          </div>
        </div>

        <div className={clsx(classes.section, classes.sectionPages)}>
          <Group className={classes.pagesHeader} justify="space-between">
            <Text size="xs" fw={500} c="dimmed">
              {t("Pages")}
            </Text>

            {spaceAbility.can(
              SpaceCaslAction.Manage,
              SpaceCaslSubject.Page,
            ) && (
              <Group gap="xs">
                <SpaceMenu spaceId={space.id} onSpaceSettings={openSettings} />

                {/* GitBook-style "+" menu: Page, Group, Link */}
                <Menu width={180} shadow="md" withArrow position="bottom-end">
                  <Menu.Target>
                    <Tooltip label={t("Add to sidebar")} withArrow position="right">
                      <ActionIcon
                        variant="default"
                        size={18}
                        aria-label={t("Add to sidebar")}
                      >
                        <IconPlus />
                      </ActionIcon>
                    </Tooltip>
                  </Menu.Target>

                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={<IconFileText size={16} />}
                      onClick={handleCreatePage}
                    >
                      {t("Page")}
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconFolder size={16} />}
                      onClick={openGroupModal}
                    >
                      {t("Group")}
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconLink size={16} />}
                      onClick={openLinkModal}
                    >
                      {t("Link to...")}
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
            )}
          </Group>

          <div className={classes.pages}>
            <SpaceTree
              spaceId={space.id}
              readOnly={spaceAbility.cannot(
                SpaceCaslAction.Manage,
                SpaceCaslSubject.Page,
              )}
              sidebarInserts={(() => {
                const raw = space?.portalSettings;
                const ps = typeof raw === 'string'
                  ? (() => { try { return JSON.parse(raw); } catch { return {}; } })()
                  : raw || {};
                return ps.sidebarInserts;
              })()}
            />
          </div>
        </div>
      </div>

      <SpaceSettingsModal
        opened={opened}
        onClose={closeSettings}
        spaceId={space?.slug}
      />

      {/* Modal for adding Group or Link */}
      <Modal
        opened={insertModalOpened}
        onClose={closeInsertModal}
        title={insertType === "header" ? t("Add Group") : t("Add Link")}
        size="sm"
      >
        <Stack gap="md">
          <TextInput
            label={t("Label")}
            placeholder={insertType === "header" ? "PROXY-SELLER" : "SDK PHP"}
            value={insertLabel}
            onChange={(e) => setInsertLabel(e.currentTarget.value)}
            autoFocus
            data-autofocus
          />

          {insertType === "link" && (
            <TextInput
              label={t("URL")}
              placeholder="https://example.com"
              value={insertUrl}
              onChange={(e) => setInsertUrl(e.currentTarget.value)}
              leftSection={<IconLink size={14} />}
            />
          )}

          <TextInput
            label={t("Position")}
            description={t("Insert before root page at this index (0 = top of sidebar)")}
            type="number"
            value={String(insertPosition)}
            onChange={(e) => setInsertPosition(parseInt(e.currentTarget.value) || 0)}
          />

          <Group justify="flex-end">
            <Button variant="default" onClick={closeInsertModal}>
              {t("Cancel")}
            </Button>
            <Button
              onClick={handleAddInsert}
              disabled={!insertLabel.trim() || (insertType === "link" && !insertUrl.trim())}
              loading={updateSpaceMutation.isPending}
            >
              {insertType === "header" ? t("Add Group") : t("Add Link")}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}

interface SpaceMenuProps {
  spaceId: string;
  onSpaceSettings: () => void;
}
function SpaceMenu({ spaceId, onSpaceSettings }: SpaceMenuProps) {
  const { t } = useTranslation();
  const { spaceSlug } = useParams();
  const [importOpened, { open: openImportModal, close: closeImportModal }] =
    useDisclosure(false);
  const [exportOpened, { open: openExportModal, close: closeExportModal }] =
    useDisclosure(false);

  return (
    <>
      <Menu width={200} shadow="md" withArrow>
        <Menu.Target>
          <Tooltip
            label={t("Import pages & space settings")}
            withArrow
            position="top"
          >
            <ActionIcon
              variant="default"
              size={18}
              aria-label={t("Space menu")}
            >
              <IconDots />
            </ActionIcon>
          </Tooltip>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Item
            onClick={openImportModal}
            leftSection={<IconArrowDown size={16} />}
          >
            {t("Import pages")}
          </Menu.Item>

          <Menu.Item
            onClick={openExportModal}
            leftSection={<IconFileExport size={16} />}
          >
            {t("Export space")}
          </Menu.Item>

          <Menu.Divider />

          <Menu.Item
            onClick={onSpaceSettings}
            leftSection={<IconSettings size={16} />}
          >
            {t("Space settings")}
          </Menu.Item>

          <Menu.Item
            component={Link}
            to={`/s/${spaceSlug}/trash`}
            leftSection={<IconTrash size={16} />}
          >
            {t("Trash")}
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      <PageImportModal
        spaceId={spaceId}
        open={importOpened}
        onClose={closeImportModal}
      />

      <ExportModal
        type="space"
        id={spaceId}
        open={exportOpened}
        onClose={closeExportModal}
      />
    </>
  );
}

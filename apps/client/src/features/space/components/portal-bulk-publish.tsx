import { useState, useMemo } from "react";
import {
  Stack,
  Text,
  Paper,
  Group,
  Button,
  Checkbox,
  Table,
  Badge,
  ActionIcon,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import {
  IconEye,
  IconEyeOff,
  IconSearch,
  IconClock,
  IconSelectAll,
  IconDeselect,
} from "@tabler/icons-react";
import { useAdminPagesQuery } from "@/features/docs-portal/queries/docs-portal-query";
import { useBulkPublishMutation } from "@/features/page/queries/page-query";
import { useTranslation } from "react-i18next";
import { notifications } from "@mantine/notifications";

interface PortalBulkPublishProps {
  spaceSlug: string;
  spaceId: string;
}

export default function PortalBulkPublish({
  spaceSlug,
  spaceId,
}: PortalBulkPublishProps) {
  const { t } = useTranslation();
  const { data: adminPages, refetch } = useAdminPagesQuery(spaceId);
  const bulkMutation = useBulkPublishMutation();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [scheduleDate, setScheduleDate] = useState<Date | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);

  const pages = useMemo(() => {
    if (!adminPages) return [];
    return adminPages.map((p: any) => ({
      id: p.id,
      title: p.title || "Untitled",
      slugId: p.slugId,
      isDraft: p.isDraft ?? false,
    }));
  }, [adminPages]);

  const filteredPages = useMemo(() => {
    if (!search) return pages;
    const q = search.toLowerCase();
    return pages.filter((p: any) => p.title.toLowerCase().includes(q));
  }, [pages, search]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(filteredPages.map((p: any) => p.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleBulkAction = (isDraft: boolean) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    bulkMutation.mutate(
      {
        pageIds: ids,
        isDraft,
        publishAt: showSchedule && scheduleDate ? scheduleDate.toISOString() : null,
      },
      {
        onSuccess: (result) => {
          notifications.show({
            message: isDraft
              ? t("{{count}} page(s) marked as draft", { count: result.updated })
              : showSchedule && scheduleDate
                ? t("{{count}} page(s) scheduled for publishing", { count: result.updated })
                : t("{{count}} page(s) published", { count: result.updated }),
          });
          setSelectedIds(new Set());
          setShowSchedule(false);
          setScheduleDate(null);
          refetch();
        },
        onError: () => {
          notifications.show({
            message: t("Failed to update pages"),
            color: "red",
          });
        },
      },
    );
  };

  return (
    <Stack gap="md">
      {/* Search + actions toolbar */}
      <Group justify="space-between">
        <TextInput
          placeholder={t("Search pages...")}
          leftSection={<IconSearch size={14} />}
          size="sm"
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={{ flex: 1, maxWidth: 300 }}
        />
        <Group gap="xs">
          <Tooltip label={t("Select all")}>
            <ActionIcon variant="subtle" onClick={selectAll} size="sm">
              <IconSelectAll size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label={t("Deselect all")}>
            <ActionIcon variant="subtle" onClick={deselectAll} size="sm">
              <IconDeselect size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      {/* Selected count + actions */}
      {selectedIds.size > 0 && (
        <Paper p="sm" radius="md" withBorder bg="var(--mantine-color-dark-6)">
          <Group justify="space-between">
            <Text size="sm" fw={500}>
              {t("{{count}} page(s) selected", { count: selectedIds.size })}
            </Text>
            <Group gap="xs">
              <Button
                size="xs"
                variant="light"
                color="green"
                leftSection={<IconEye size={14} />}
                loading={bulkMutation.isPending}
                onClick={() => handleBulkAction(false)}
              >
                {t("Publish")}
              </Button>
              <Button
                size="xs"
                variant="light"
                color="orange"
                leftSection={<IconEyeOff size={14} />}
                loading={bulkMutation.isPending}
                onClick={() => handleBulkAction(true)}
              >
                {t("Mark as draft")}
              </Button>
              <Button
                size="xs"
                variant="light"
                color="blue"
                leftSection={<IconClock size={14} />}
                onClick={() => setShowSchedule((v) => !v)}
              >
                {t("Schedule")}
              </Button>
            </Group>
          </Group>

          {showSchedule && (
            <Group mt="sm" gap="sm">
              <DateTimePicker
                size="xs"
                placeholder={t("Pick date & time")}
                value={scheduleDate}
                onChange={(val: any) => setScheduleDate(val ? new Date(val) : null)}
                minDate={new Date()}
                style={{ flex: 1, maxWidth: 250 }}
              />
              <Button
                size="xs"
                disabled={!scheduleDate}
                loading={bulkMutation.isPending}
                onClick={() => handleBulkAction(true)}
              >
                {t("Schedule publish")}
              </Button>
            </Group>
          )}
        </Paper>
      )}

      {/* Pages table */}
      <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: 40 }} />
              <Table.Th>{t("Page")}</Table.Th>
              <Table.Th style={{ width: 100 }}>{t("Status")}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filteredPages.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={3}>
                  <Text size="sm" c="dimmed" ta="center" py="md">
                    {t("No pages found")}
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              filteredPages.map((page: any) => (
                <Table.Tr
                  key={page.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => toggleSelect(page.id)}
                >
                  <Table.Td>
                    <Checkbox
                      checked={selectedIds.has(page.id)}
                      onChange={() => toggleSelect(page.id)}
                      size="xs"
                    />
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" lineClamp={1}>
                      {page.title}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      size="xs"
                      variant="light"
                      color={page.isDraft ? "orange" : "green"}
                    >
                      {page.isDraft ? t("Draft") : t("Published")}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Paper>
    </Stack>
  );
}

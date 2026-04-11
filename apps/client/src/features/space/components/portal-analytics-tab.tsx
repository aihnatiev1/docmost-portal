import { useState } from "react";
import {
  Stack,
  Text,
  Paper,
  Group,
  SimpleGrid,
  Table,
  Badge,
  SegmentedControl,
  Progress,
  Skeleton,
  ThemeIcon,
} from "@mantine/core";
import {
  IconEye,
  IconUsers,
  IconThumbUp,
  IconThumbDown,
  IconMessage,
} from "@tabler/icons-react";
import { useAnalyticsQuery } from "@/features/docs-portal/queries/docs-portal-query";
import { useTranslation } from "react-i18next";

interface PortalAnalyticsTabProps {
  spaceId: string;
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Paper withBorder p="md" radius="md">
      <Group justify="space-between" mb="xs">
        <Text size="xs" c="dimmed" fw={500} tt="uppercase">
          {label}
        </Text>
        <ThemeIcon variant="light" color={color} size="sm" radius="xl">
          {icon}
        </ThemeIcon>
      </Group>
      <Text fw={700} size="xl">
        {value.toLocaleString()}
      </Text>
    </Paper>
  );
}

function MiniBarChart({ data }: { data: Array<{ date: string; count: number }> }) {
  if (!data || data.length === 0) {
    return (
      <Text size="sm" c="dimmed" ta="center" py="xl">
        No data for this period
      </Text>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <Group gap={2} align="flex-end" style={{ height: 120 }} wrap="nowrap">
      {data.map((d) => {
        const height = Math.max((d.count / maxCount) * 100, 2);
        return (
          <div
            key={d.date}
            title={`${d.date}: ${d.count} views`}
            style={{
              flex: 1,
              height: `${height}%`,
              background: "var(--mantine-color-blue-6)",
              borderRadius: 2,
              minWidth: 3,
              cursor: "default",
            }}
          />
        );
      })}
    </Group>
  );
}

export default function PortalAnalyticsTab({ spaceId }: PortalAnalyticsTabProps) {
  const { t } = useTranslation();
  const [period, setPeriod] = useState("30");
  const { data, isLoading } = useAnalyticsQuery(spaceId, parseInt(period, 10));

  if (isLoading) {
    return (
      <Stack gap="md">
        <SimpleGrid cols={4}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={90} radius="md" />
          ))}
        </SimpleGrid>
        <Skeleton height={160} radius="md" />
        <Skeleton height={200} radius="md" />
      </Stack>
    );
  }

  if (!data) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        {t("No analytics data available")}
      </Text>
    );
  }

  const { overview, viewsPerDay, topPages, topReferrers, recentFeedback } = data;

  const feedbackRate =
    overview.feedbackTotal > 0
      ? Math.round((overview.feedbackHelpful / overview.feedbackTotal) * 100)
      : 0;

  return (
    <Stack gap="lg">
      {/* Period selector */}
      <Group justify="flex-end">
        <SegmentedControl
          size="xs"
          value={period}
          onChange={setPeriod}
          data={[
            { label: "7d", value: "7" },
            { label: "30d", value: "30" },
            { label: "90d", value: "90" },
          ]}
        />
      </Group>

      {/* Overview cards */}
      <SimpleGrid cols={{ base: 2, sm: 4 }}>
        <StatCard
          label={t("Page views")}
          value={overview.totalViews}
          icon={<IconEye size={14} />}
          color="blue"
        />
        <StatCard
          label={t("Unique visitors")}
          value={overview.uniqueVisitors}
          icon={<IconUsers size={14} />}
          color="teal"
        />
        <StatCard
          label={t("Helpful")}
          value={overview.feedbackHelpful}
          icon={<IconThumbUp size={14} />}
          color="green"
        />
        <StatCard
          label={t("Not helpful")}
          value={overview.feedbackNotHelpful}
          icon={<IconThumbDown size={14} />}
          color="red"
        />
      </SimpleGrid>

      {/* Views chart */}
      <Paper withBorder p="md" radius="md">
        <Text size="sm" fw={500} mb="md">
          {t("Views over time")}
        </Text>
        <MiniBarChart data={viewsPerDay} />
        {viewsPerDay.length > 0 && (
          <Group justify="space-between" mt="xs">
            <Text size="xs" c="dimmed">
              {viewsPerDay[0]?.date}
            </Text>
            <Text size="xs" c="dimmed">
              {viewsPerDay[viewsPerDay.length - 1]?.date}
            </Text>
          </Group>
        )}
      </Paper>

      {/* Two columns: Top pages + Referrers */}
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        {/* Top pages */}
        <Paper withBorder p="md" radius="md">
          <Text size="sm" fw={500} mb="md">
            {t("Top pages")}
          </Text>
          {topPages.length === 0 ? (
            <Text size="sm" c="dimmed" ta="center" py="md">
              {t("No page views yet")}
            </Text>
          ) : (
            <Table highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t("Page")}</Table.Th>
                  <Table.Th style={{ width: 80, textAlign: "right" }}>
                    {t("Views")}
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {topPages.slice(0, 10).map((page) => (
                  <Table.Tr key={page.id}>
                    <Table.Td>
                      <Text size="sm" lineClamp={1}>
                        {page.title || "Untitled"}
                      </Text>
                    </Table.Td>
                    <Table.Td style={{ textAlign: "right" }}>
                      <Text size="sm" fw={500}>
                        {page.views}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Paper>

        {/* Top referrers */}
        <Paper withBorder p="md" radius="md">
          <Text size="sm" fw={500} mb="md">
            {t("Top referrers")}
          </Text>
          {topReferrers.length === 0 ? (
            <Text size="sm" c="dimmed" ta="center" py="md">
              {t("No referrer data yet")}
            </Text>
          ) : (
            <Table highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t("Source")}</Table.Th>
                  <Table.Th style={{ width: 80, textAlign: "right" }}>
                    {t("Visits")}
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {topReferrers.map((ref, i) => (
                  <Table.Tr key={i}>
                    <Table.Td>
                      <Text size="sm" lineClamp={1}>
                        {ref.referrer}
                      </Text>
                    </Table.Td>
                    <Table.Td style={{ textAlign: "right" }}>
                      <Text size="sm" fw={500}>
                        {ref.count}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Paper>
      </SimpleGrid>

      {/* Feedback satisfaction */}
      {overview.feedbackTotal > 0 && (
        <Paper withBorder p="md" radius="md">
          <Group justify="space-between" mb="sm">
            <Text size="sm" fw={500}>
              {t("Feedback satisfaction")}
            </Text>
            <Badge variant="light" color={feedbackRate >= 70 ? "green" : feedbackRate >= 40 ? "yellow" : "red"}>
              {feedbackRate}% {t("positive")}
            </Badge>
          </Group>
          <Progress.Root size="lg" radius="xl">
            <Progress.Section
              value={feedbackRate}
              color="green"
            />
            <Progress.Section
              value={100 - feedbackRate}
              color="red"
            />
          </Progress.Root>
          <Group justify="space-between" mt="xs">
            <Text size="xs" c="dimmed">
              {overview.feedbackHelpful} {t("helpful")}
            </Text>
            <Text size="xs" c="dimmed">
              {overview.feedbackNotHelpful} {t("not helpful")}
            </Text>
          </Group>
        </Paper>
      )}

      {/* Recent feedback with comments */}
      {recentFeedback && recentFeedback.length > 0 && (
        <Paper withBorder p="md" radius="md">
          <Group mb="md" gap="xs">
            <IconMessage size={16} />
            <Text size="sm" fw={500}>
              {t("Recent feedback comments")}
            </Text>
          </Group>
          <Stack gap="sm">
            {recentFeedback.map((fb) => (
              <Paper key={fb.id} p="sm" bg="var(--mantine-color-dark-6)" radius="sm">
                <Group justify="space-between" mb={4}>
                  <Group gap="xs">
                    <Badge
                      size="xs"
                      variant="light"
                      color={fb.isHelpful ? "green" : "red"}
                    >
                      {fb.isHelpful ? "👍" : "👎"}
                    </Badge>
                    <Text size="xs" fw={500}>
                      {fb.pageTitle || "Untitled"}
                    </Text>
                  </Group>
                  <Text size="xs" c="dimmed">
                    {new Date(fb.createdAt).toLocaleDateString()}
                  </Text>
                </Group>
                {fb.comment && (
                  <Text size="sm" c="dimmed">
                    {fb.comment}
                  </Text>
                )}
              </Paper>
            ))}
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}

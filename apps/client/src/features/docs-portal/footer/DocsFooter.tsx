import { Group, Text, Anchor, Divider, Stack, Paper } from "@mantine/core";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { ITreeNode, IPortalSettings } from "../types/docs-portal.types";
import { buildPageSlug } from "../hooks/use-doc-tree";
import FeedbackWidget from "../feedback/FeedbackWidget";

interface DocsFooterProps {
  spaceSlug: string;
  pageId: string;
  flat: ITreeNode[];
  portalSettings: IPortalSettings;
}

export default function DocsFooter({
  spaceSlug,
  pageId,
  flat,
  portalSettings,
}: DocsFooterProps) {
  const currentIndex = flat.findIndex((p) => p.id === pageId);
  const prevPage = currentIndex > 0 ? flat[currentIndex - 1] : null;
  const nextPage =
    currentIndex >= 0 && currentIndex < flat.length - 1
      ? flat[currentIndex + 1]
      : null;

  return (
    <Stack gap="lg" mt="xl">
      <FeedbackWidget pageId={pageId} />

      {(prevPage || nextPage) && (
        <Group justify="space-between" grow>
          {prevPage ? (
            <Paper
              component={Link}
              to={`/docs/${spaceSlug}/${buildPageSlug(prevPage.title, prevPage.slugId)}`}
              p="md"
              withBorder
              radius="md"
              style={{ textDecoration: "none" }}
            >
              <Group gap="xs">
                <IconArrowLeft size={16} />
                <div>
                  <Text size="xs" c="dimmed">
                    Previous
                  </Text>
                  <Text size="sm" fw={500} truncate>
                    {prevPage.title || "Untitled"}
                  </Text>
                </div>
              </Group>
            </Paper>
          ) : (
            <div />
          )}
          {nextPage ? (
            <Paper
              component={Link}
              to={`/docs/${spaceSlug}/${buildPageSlug(nextPage.title, nextPage.slugId)}`}
              p="md"
              withBorder
              radius="md"
              style={{ textDecoration: "none", textAlign: "right" }}
            >
              <Group gap="xs" justify="flex-end">
                <div>
                  <Text size="xs" c="dimmed">
                    Next
                  </Text>
                  <Text size="sm" fw={500} truncate>
                    {nextPage.title || "Untitled"}
                  </Text>
                </div>
                <IconArrowRight size={16} />
              </Group>
            </Paper>
          ) : (
            <div />
          )}
        </Group>
      )}

      {portalSettings.footerLinks && portalSettings.footerLinks.length > 0 && (
        <>
          <Divider />
          <Group justify="center" gap="md" pb="md">
            {portalSettings.footerLinks.map((link, i) => (
              <Anchor key={i} href={link.url} size="sm" c="dimmed" target="_blank">
                {link.label}
              </Anchor>
            ))}
          </Group>
        </>
      )}
    </Stack>
  );
}

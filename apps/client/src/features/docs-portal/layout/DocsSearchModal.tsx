import { useState, useCallback } from "react";
import {
  Modal,
  TextInput,
  Stack,
  Text,
  Group,
  UnstyledButton,
  Loader,
  ScrollArea,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconSearch, IconFile } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { useDocSearchQuery } from "../queries/docs-portal-query";
import DOMPurify from "dompurify";

interface DocsSearchModalProps {
  opened: boolean;
  onClose: () => void;
  spaceSlug: string;
}

export default function DocsSearchModal({
  opened,
  onClose,
  spaceSlug,
}: DocsSearchModalProps) {
  const [query, setQuery] = useState("");
  const [debounced] = useDebouncedValue(query, 300);
  const navigate = useNavigate();

  const { data: results, isLoading } = useDocSearchQuery(
    spaceSlug,
    debounced,
  );

  const handleSelect = useCallback(
    (slugId: string, title: string | null) => {
      const slug = title
        ? `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${slugId}`
        : slugId;
      navigate(`/docs/${spaceSlug}/${slug}`);
      onClose();
      setQuery("");
    },
    [navigate, spaceSlug, onClose],
  );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Search documentation"
      size="lg"
      centered
      withCloseButton={false}
    >
      <Stack gap="md">
        <TextInput
          placeholder="Type to search..."
          leftSection={<IconSearch size={16} />}
          rightSection={isLoading ? <Loader size={16} /> : null}
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          autoFocus
          data-autofocus
        />

        {results && results.length > 0 && (
          <ScrollArea.Autosize mah={400}>
            <Stack gap={4}>
              {results.map((result) => (
                <UnstyledButton
                  key={result.id}
                  onClick={() => handleSelect(result.slugId, result.title)}
                  p="sm"
                  style={{
                    borderRadius: "var(--mantine-radius-sm)",
                  }}
                >
                  <Group gap="sm" wrap="nowrap" align="flex-start">
                    {result.icon ? (
                      <span style={{ fontSize: 16 }}>{result.icon}</span>
                    ) : (
                      <IconFile size={16} stroke={1.5} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text size="sm" fw={500} truncate>
                        {result.title || "Untitled"}
                      </Text>
                      {result.highlight && (
                        <Text
                          size="xs"
                          c="dimmed"
                          lineClamp={2}
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(result.highlight, {
                              ALLOWED_TAGS: ["mark", "em", "strong", "b"],
                            }),
                          }}
                        />
                      )}
                    </div>
                  </Group>
                </UnstyledButton>
              ))}
            </Stack>
          </ScrollArea.Autosize>
        )}

        {debounced && results && results.length === 0 && !isLoading && (
          <Text size="sm" c="dimmed" ta="center" py="md">
            No results found for &quot;{debounced}&quot;
          </Text>
        )}
      </Stack>
    </Modal>
  );
}

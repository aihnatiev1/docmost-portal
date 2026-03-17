import { useState } from "react";
import {
  Group,
  Text,
  ActionIcon,
  Textarea,
  Button,
  Paper,
  Stack,
  Transition,
} from "@mantine/core";
import { IconThumbUp, IconThumbDown } from "@tabler/icons-react";
import { useFeedbackMutation } from "../queries/docs-portal-query";

interface FeedbackWidgetProps {
  pageId: string;
}

export default function FeedbackWidget({ pageId }: FeedbackWidgetProps) {
  const [submitted, setSubmitted] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState("");
  const [selectedHelpful, setSelectedHelpful] = useState<boolean | null>(null);
  const mutation = useFeedbackMutation();

  const handleVote = (isHelpful: boolean) => {
    setSelectedHelpful(isHelpful);
    if (!isHelpful) {
      setShowComment(true);
    } else {
      mutation.mutate(
        { pageId, isHelpful },
        { onSuccess: () => setSubmitted(true) },
      );
    }
  };

  const handleSubmitComment = () => {
    if (selectedHelpful === null) return;
    mutation.mutate(
      { pageId, isHelpful: selectedHelpful, comment: comment || undefined },
      { onSuccess: () => setSubmitted(true) },
    );
  };

  if (submitted) {
    return (
      <Paper p="md" withBorder radius="md">
        <Text size="sm" c="dimmed" ta="center">
          Thanks for your feedback!
        </Text>
      </Paper>
    );
  }

  return (
    <Paper p="md" withBorder radius="md">
      <Stack gap="sm">
        <Group justify="center" gap="md">
          <Text size="sm" c="dimmed">
            Was this page helpful?
          </Text>
          <Group gap="xs">
            <ActionIcon
              variant={selectedHelpful === true ? "filled" : "light"}
              color="green"
              onClick={() => handleVote(true)}
              size="lg"
            >
              <IconThumbUp size={18} />
            </ActionIcon>
            <ActionIcon
              variant={selectedHelpful === false ? "filled" : "light"}
              color="red"
              onClick={() => handleVote(false)}
              size="lg"
            >
              <IconThumbDown size={18} />
            </ActionIcon>
          </Group>
        </Group>

        <Transition mounted={showComment} transition="slide-down">
          {(styles) => (
            <Stack gap="xs" style={styles}>
              <Textarea
                placeholder="How can we improve this page?"
                value={comment}
                onChange={(e) => setComment(e.currentTarget.value)}
                maxLength={1000}
                autosize
                minRows={2}
                maxRows={4}
              />
              <Button
                size="xs"
                onClick={handleSubmitComment}
                loading={mutation.isPending}
              >
                Send feedback
              </Button>
            </Stack>
          )}
        </Transition>
      </Stack>
    </Paper>
  );
}

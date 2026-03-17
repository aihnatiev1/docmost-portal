import { useState } from "react";
import { Textarea, Button, Transition } from "@mantine/core";
import { IconThumbUp, IconThumbDown } from "@tabler/icons-react";
import { useFeedbackMutation } from "../queries/docs-portal-query";
import classes from "../styles/docs-portal.module.css";
import cx from "clsx";

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
      <div className={classes.feedbackContainer}>
        <span className={classes.feedbackThanks}>
          ✓ Thanks for your feedback!
        </span>
      </div>
    );
  }

  return (
    <div className={classes.feedbackContainer}>
      <span className={classes.feedbackQuestion}>
        Was this page helpful?
      </span>

      <div className={classes.feedbackButtons}>
        <button
          className={cx(
            classes.feedbackBtn,
            selectedHelpful === true && classes.feedbackBtnActive,
          )}
          onClick={() => handleVote(true)}
          type="button"
        >
          <IconThumbUp size={16} stroke={1.5} />
          Yes
        </button>
        <button
          className={cx(
            classes.feedbackBtn,
            selectedHelpful === false && classes.feedbackBtnActive,
          )}
          onClick={() => handleVote(false)}
          type="button"
        >
          <IconThumbDown size={16} stroke={1.5} />
          No
        </button>
      </div>

      <Transition mounted={showComment} transition="slide-down" duration={200}>
        {(styles) => (
          <div className={classes.feedbackCommentArea} style={styles}>
            <Textarea
              placeholder="How can we improve this page?"
              value={comment}
              onChange={(e) => setComment(e.currentTarget.value)}
              maxLength={1000}
              autosize
              minRows={2}
              maxRows={4}
              mb="xs"
              styles={{
                input: {
                  fontSize: 14,
                  border: "1px solid var(--mantine-color-default-border)",
                },
              }}
            />
            <Button
              size="xs"
              variant="light"
              onClick={handleSubmitComment}
              loading={mutation.isPending}
            >
              Send feedback
            </Button>
          </div>
        )}
      </Transition>
    </div>
  );
}

import React from "react";
import { Badge } from "@openai/apps-sdk-ui/components/Badge";
import { Button } from "@openai/apps-sdk-ui/components/Button";
import { Checkbox } from "@openai/apps-sdk-ui/components/Checkbox";
import { Input } from "@openai/apps-sdk-ui/components/Input";
import { RadioGroup } from "@openai/apps-sdk-ui/components/RadioGroup";
import { Textarea } from "@openai/apps-sdk-ui/components/Textarea";
import { TripShell } from "./TripShell";
import type { ErrorOutput, TripClarificationData } from "./types";

const isError = (clarification: TripClarificationData | ErrorOutput): clarification is ErrorOutput =>
  "error" in clarification && Boolean(clarification.error);

export function TripClarification({
  clarification,
}: {
  clarification: TripClarificationData | ErrorOutput;
}) {
  const [currentIndex, setCurrentIndex] = React.useState(
    "current_index" in clarification ? clarification.current_index ?? 0 : 0,
  );
  const [submitted, setSubmitted] = React.useState(false);

  React.useEffect(() => {
    if (!("current_index" in clarification)) return;
    setCurrentIndex(clarification.current_index ?? 0);
    setSubmitted(false);
  }, [
    "session_id" in clarification ? clarification.session_id : null,
    "current_index" in clarification ? clarification.current_index : null,
  ]);

  if (isError(clarification)) {
    return (
      <TripShell eyebrow="Clarify" title="Trip Clarification" error={clarification.error}>
        {null}
      </TripShell>
    );
  }

  const questions = clarification.questions ?? [];
  const safeIndex = Math.min(Math.max(currentIndex, 0), Math.max(questions.length - 1, 0));
  const current = questions[safeIndex] ?? questions[0];
  const totalQuestions = clarification.total_questions ?? questions.length;
  const isLastQuestion = safeIndex + 1 >= questions.length;

  const advance = () => {
    if (isLastQuestion) {
      setSubmitted(true);
      return;
    }
    setCurrentIndex((index) => Math.min(index + 1, questions.length - 1));
  };

  return (
    <TripShell
      eyebrow="Clarify"
      title={clarification.destination ? `Plan ${clarification.destination}` : "Trip Clarification"}
      description="Collect only the missing fields needed to continue planning."
      empty={!current}
      emptyTitle="No questions needed"
      emptyDescription="The request already has enough structure to continue."
    >
      <article className="rounded-2xl border border-subtle bg-surface p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Badge color="info" pill>
            {submitted ? "Ready to continue" : `Question ${safeIndex + 1} of ${totalQuestions}`}
          </Badge>
          {current?.required ? <Badge color="warning">Required</Badge> : <Badge color="secondary">Optional</Badge>}
        </div>

        {submitted ? (
          <div className="rounded-xl border border-subtle bg-primary p-4">
            <h2 className="text-base font-semibold text-primary">Clarification complete</h2>
            <p className="mt-1 text-sm text-secondary">
              Answers are ready for the next planning step.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="heading-md text-primary">{current?.prompt}</h2>
            {current?.reason ? <p className="text-sm text-secondary">{current.reason}</p> : null}

            {current?.answer_type === "single_choice" ? (
              <RadioGroup
                key={current.id}
                aria-label={current.prompt}
                defaultValue={current.options?.[0]?.value}
                direction="col"
                className="grid gap-2 pt-2"
              >
                {current.options.map((option) => (
                  <RadioGroup.Item key={option.id} value={option.value}>
                    {option.label}
                  </RadioGroup.Item>
                ))}
              </RadioGroup>
            ) : current?.answer_type === "multi_choice" ? (
              <div className="grid gap-2 pt-2">
                {current.options.map((option) => (
                  <Checkbox key={option.id} value={option.value} label={option.label} />
                ))}
              </div>
            ) : (
              <Textarea key={current?.id} placeholder="Add details..." rows={4} />
            )}

            {current?.allow_free_text && current.answer_type !== "free_text" ? (
              <Input key={`${current.id}-custom`} placeholder="Or type a custom answer" />
            ) : null}
          </div>
        )}

        <div className="mt-5 flex flex-wrap justify-between gap-2 border-t border-subtle pt-4">
          <Button
            color="secondary"
            variant="soft"
            size="sm"
            disabled={safeIndex === 0 && !submitted}
            onClick={() => {
              if (submitted) {
                setSubmitted(false);
                setCurrentIndex(Math.max(questions.length - 1, 0));
                return;
              }
              setCurrentIndex((index) => Math.max(index - 1, 0));
            }}
          >
            Previous
          </Button>
          <div className="flex gap-2">
            {!submitted && current?.allow_skip ? (
              <Button color="secondary" variant="ghost" size="sm" onClick={advance}>
                Skip
              </Button>
            ) : null}
            <Button
              color="primary"
              variant="solid"
              size="sm"
              onClick={
                submitted
                  ? () => {
                      setSubmitted(false);
                      setCurrentIndex(0);
                    }
                  : advance
              }
            >
              {submitted ? "Review answers" : isLastQuestion ? "Submit" : "Next"}
            </Button>
          </div>
        </div>
      </article>
    </TripShell>
  );
}

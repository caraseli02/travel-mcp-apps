import React from "react";
import { Badge } from "@openai/apps-sdk-ui/components/Badge";
import { Button } from "@openai/apps-sdk-ui/components/Button";
import { Checkbox } from "@openai/apps-sdk-ui/components/Checkbox";
import { Input } from "@openai/apps-sdk-ui/components/Input";
import { RadioGroup } from "@openai/apps-sdk-ui/components/RadioGroup";
import { Textarea } from "@openai/apps-sdk-ui/components/Textarea";
import { TripShell } from "./TripShell";
import { useCallTool } from "../bridge/useCallTool";
import type { ErrorOutput, TripClarificationData } from "./types";

const isError = (clarification: TripClarificationData | ErrorOutput): clarification is ErrorOutput =>
  "error" in clarification && Boolean(clarification.error);

type Answers = Record<string, unknown>;
type SubmitState = "answering" | "review" | "submitting" | "submitted" | "error";

type ClarificationWidgetState = {
  session_id?: string;
  index?: number;
  answers?: Answers;
  submitState?: SubmitState;
};

type ToolResult = {
  structuredContent?: {
    summary?: string;
  };
};

const getOpenAiBridge = () => {
  if (typeof window === "undefined") return undefined;
  return (window as any).openai as
    | {
        widgetState?: ClarificationWidgetState;
        setWidgetState?: (state: ClarificationWidgetState) => Promise<void> | void;
      }
    | undefined;
};

const readSavedState = (sessionId?: string): ClarificationWidgetState => {
  const state = getOpenAiBridge()?.widgetState;
  if (!state || state.session_id !== sessionId) return {};
  return state;
};

const persistState = (state: ClarificationWidgetState) => {
  const bridge = getOpenAiBridge();
  if (!bridge?.setWidgetState) return;
  bridge.widgetState = state;
  Promise.resolve(bridge.setWidgetState(state)).catch(() => {});
};

const stringValue = (value: unknown): string => (typeof value === "string" ? value : "");
const stringArrayValue = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

export function TripClarification({
  clarification,
}: {
  clarification: TripClarificationData | ErrorOutput;
}) {
  const sessionId = "session_id" in clarification ? clarification.session_id : undefined;
  const savedState = React.useMemo(() => readSavedState(sessionId), [sessionId]);
  const [currentIndex, setCurrentIndex] = React.useState(
    savedState.index ?? ("current_index" in clarification ? clarification.current_index ?? 0 : 0),
  );
  const [submitState, setSubmitState] = React.useState<SubmitState>(savedState.submitState ?? "answering");
  const [answers, setAnswers] = React.useState<Answers>(savedState.answers ?? {});
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const { callTool, sendFollowUpMessage, requestClose, isCalling } = useCallTool();

  React.useEffect(() => {
    if (!("current_index" in clarification)) return;
    const nextState = readSavedState(sessionId);
    setCurrentIndex(nextState.index ?? clarification.current_index ?? 0);
    setAnswers(nextState.answers ?? clarification.answers ?? {});
    setSubmitState(nextState.submitState ?? "answering");
    setSubmitError(null);
  }, [
    sessionId,
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
  const submitted = submitState === "review" || submitState === "submitting" || submitState === "submitted";

  const persist = React.useCallback(
    (index: number, nextAnswers: Answers, nextSubmitState: SubmitState) => {
      persistState({
        session_id: sessionId,
        index,
        answers: nextAnswers,
        submitState: nextSubmitState,
      });
    },
    [sessionId],
  );

  const updateAnswers = React.useCallback(
    (updater: (currentAnswers: Answers) => Answers) => {
      setAnswers((currentAnswers) => {
        const nextAnswers = updater(currentAnswers);
        persist(currentIndex, nextAnswers, submitState);
        return nextAnswers;
      });
    },
    [currentIndex, persist, submitState],
  );

  const setIndex = React.useCallback(
    (updater: (currentIndex: number) => number) => {
      setCurrentIndex((index) => {
        const nextIndex = updater(index);
        persist(nextIndex, answers, submitState);
        return nextIndex;
      });
    },
    [answers, persist, submitState],
  );

  const setState = React.useCallback(
    (nextSubmitState: SubmitState) => {
      setSubmitState(nextSubmitState);
      persist(currentIndex, answers, nextSubmitState);
    },
    [answers, currentIndex, persist],
  );

  const submitAnswers = async () => {
    setSubmitError(null);
    setState("submitting");
    try {
      const result = (await callTool("submit_trip_clarification", {
        session_json: JSON.stringify(clarification),
        answers_json: JSON.stringify(answers),
      })) as ToolResult | undefined;
      const summary = result?.structuredContent?.summary;
      if (summary) {
        await sendFollowUpMessage(summary);
      }
      setState("submitted");
      await requestClose();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Could not submit answers. Try again.");
      setState("error");
    }
  };

  const advance = async () => {
    if (isLastQuestion) {
      if (submitState === "review" || submitState === "error") {
        await submitAnswers();
      } else {
        setState("review");
      }
      return;
    }
    setIndex((index) => Math.min(index + 1, questions.length - 1));
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
            {submitError ? <p className="mt-3 text-sm text-danger" role="alert">{submitError}</p> : null}
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="heading-md text-primary">{current?.prompt}</h2>
            {current?.reason ? <p className="text-sm text-secondary">{current.reason}</p> : null}

            {current?.answer_type === "single_choice" ? (
              <RadioGroup
                key={current.id}
                aria-label={current.prompt}
                value={stringValue(answers[current.id]) || current.options?.[0]?.value}
                onChange={(value: string) => updateAnswers((prev) => ({ ...prev, [current.id]: value }))}
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
                  <Checkbox
                    key={option.id}
                    value={option.value}
                    label={option.label}
                    checked={stringArrayValue(answers[current.id]).includes(option.value)}
                    onCheckedChange={(checked) => {
                      updateAnswers((prev) => {
                        const currentArr = stringArrayValue(prev[current.id]);
                        if (checked) {
                          return { ...prev, [current.id]: [...currentArr, option.value] };
                        }
                        return { ...prev, [current.id]: currentArr.filter((value) => value !== option.value) };
                      });
                    }}
                  />
                ))}
              </div>
            ) : (
              <Textarea
                key={current?.id}
                placeholder="Add details..."
                rows={4}
                value={stringValue(answers[current.id])}
                onChange={(event) => updateAnswers((prev) => ({ ...prev, [current.id]: event.target.value }))}
              />
            )}

            {current?.allow_free_text && current.answer_type !== "free_text" ? (
              <Input
                key={`${current.id}-custom`}
                placeholder="Or type a custom answer"
                value={stringValue(answers[`${current.id}_custom`])}
                onChange={(event) => updateAnswers((prev) => ({ ...prev, [`${current.id}_custom`]: event.target.value }))}
              />
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
                setState("answering");
                setIndex(() => Math.max(questions.length - 1, 0));
                return;
              }
              setIndex((index) => Math.max(index - 1, 0));
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
              disabled={isCalling}
              onClick={advance}
            >
              {isCalling || submitState === "submitting"
                ? "Submitting..."
                : submitted
                  ? submitState === "submitted"
                    ? "Submitted"
                    : "Submit Answers"
                  : isLastQuestion
                    ? "Review answers"
                    : "Next"}
            </Button>
          </div>
        </div>
      </article>
    </TripShell>
  );
}

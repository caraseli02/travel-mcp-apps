import React from "react";
import { Badge } from "@openai/apps-sdk-ui/components/Badge";
import { Button } from "@openai/apps-sdk-ui/components/Button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { money, titleize } from "./format";
import { TripShell } from "./TripShell";
import {
  categoryLabels,
  CategoryFilters,
  isTravelError,
  OptionDetail,
  uniqueValues,
} from "./travel-shared";
import type { ErrorOutput, TravelOptionsData } from "./types";
import { useWidgetState } from "./useWidgetState";

export function TravelComparisonCarousel({ data }: { data: TravelOptionsData | ErrorOutput }) {
  const [category, setCategory] = useWidgetState("travel-comparison:category", "all");
  const [index, setIndex] = useWidgetState("travel-comparison:index", 0);
  const error = isTravelError(data);
  const options = error ? [] : data.options ?? [];
  const comparable = options.filter((option) => category === "all" || option.category === category);
  const boundedIndex = Math.min(index, Math.max(comparable.length - 1, 0));
  const active = comparable[boundedIndex] ?? null;

  React.useEffect(() => setIndex(0), [category, setIndex]);

  if (error) {
    return (
      <TripShell eyebrow="Compare" title="Travel Comparison" error={data.error}>
        {null}
      </TripShell>
    );
  }

  return (
    <TripShell
      eyebrow="Compare"
      title="Shortlist comparison"
      description="Review the strongest options without losing the decision context."
      empty={options.length === 0}
      emptyTitle="Nothing to compare"
    >
      <article className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-surface shadow-sm">
        <div className="border-b border-[var(--color-border)] p-4">
          <CategoryFilters value={category} options={uniqueValues(options, "category")} onChange={setCategory} />
        </div>
        <div className="grid gap-4 p-4 md:grid-cols-[minmax(0,1fr)_300px]">
          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm text-secondary">
                {comparable.length ? `${boundedIndex + 1} of ${comparable.length}` : "No matches"}
              </p>
              <div className="flex gap-2">
                <Button
                  aria-label="Previous option"
                  color="secondary"
                  variant="soft"
                  size="sm"
                  disabled={boundedIndex === 0}
                  onClick={() => setIndex((value) => Math.max(value - 1, 0))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  aria-label="Next option"
                  color="secondary"
                  variant="soft"
                  size="sm"
                  disabled={boundedIndex + 1 >= comparable.length}
                  onClick={() => setIndex((value) => Math.min(value + 1, comparable.length - 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {active ? (
              <div className="rounded-2xl border border-[var(--color-border)] bg-primary p-5">
                {active.image_url ? (
                  <img
                    src={active.image_url}
                    alt=""
                    className="mb-4 aspect-[16/9] w-full rounded-xl object-cover"
                    loading="lazy"
                  />
                ) : null}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Badge color={active.recommended ? "success" : "secondary"} variant="soft">
                      {active.recommended ? "Recommended" : categoryLabels[active.category] ?? titleize(active.category)}
                    </Badge>
                    <h2 className="mt-3 text-xl font-semibold text-primary">{active.title}</h2>
                    <p className="mt-2 text-sm text-secondary">{active.description || active.subtitle}</p>
                  </div>
                  {active.score ? <div className="text-3xl font-semibold text-primary">{active.score}</div> : null}
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-secondary p-3">
                    <p className="text-xs text-tertiary">Price</p>
                    <p className="mt-1 text-sm font-semibold text-primary">
                      {active.price ? money(active.price, active.currency) : active.price_note || "Flexible"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-secondary p-3">
                    <p className="text-xs text-tertiary">Area</p>
                    <p className="mt-1 text-sm font-semibold text-primary">{active.neighborhood || "Not set"}</p>
                  </div>
                  <div className="rounded-xl bg-secondary p-3">
                    <p className="text-xs text-tertiary">Timing</p>
                    <p className="mt-1 text-sm font-semibold text-primary">{active.schedule_label || "Flexible"}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[var(--color-border)] p-6 text-center text-sm text-secondary">
                Choose another category to compare options.
              </div>
            )}
          </div>
          <OptionDetail option={active} action="Choose option" secondaryAction="Save for later" />
        </div>
      </article>
    </TripShell>
  );
}

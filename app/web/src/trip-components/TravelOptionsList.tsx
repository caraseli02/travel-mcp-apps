import React from "react";
import { Button } from "@openai/apps-sdk-ui/components/Button";
import { titleize } from "./format";
import { TripShell } from "./TripShell";
import {
  CategoryFilters,
  isTravelError,
  OptionCard,
  OptionDetail,
  selectedOrFirst,
  statusLabels,
  uniqueValues,
} from "./travel-shared";
import type { ErrorOutput, TravelOptionsData } from "./types";
import { useWidgetState } from "./useWidgetState";

export function TravelOptionsList({ data }: { data: TravelOptionsData | ErrorOutput }) {
  const [category, setCategory] = useWidgetState("travel-options-list:category", "all");
  const [status, setStatus] = useWidgetState("travel-options-list:status", "all");
  const [selectedId, setSelectedId] = useWidgetState<string | null>("travel-options-list:selected-id", null);

  if (isTravelError(data)) {
    return (
      <TripShell eyebrow="Organize" title="Travel Options" error={data.error}>
        {null}
      </TripShell>
    );
  }

  const options = data.options ?? [];
  const filtered = options.filter(
    (option) =>
      (category === "all" || option.category === category) &&
      (status === "all" || option.status === status),
  );
  const selected = selectedOrFirst(filtered, selectedId);

  return (
    <TripShell
      eyebrow="Organize"
      title={data.trip?.title || "Travel Options"}
      description={`${options.length} saved option${options.length === 1 ? "" : "s"} ready for review.`}
      empty={options.length === 0}
      emptyTitle="No saved options"
      emptyDescription="Hotels, flights, restaurants, and activities will appear here once saved."
    >
      <article className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-surface shadow-sm">
        <div className="space-y-3 border-b border-[var(--color-border)] p-4">
          <CategoryFilters value={category} options={uniqueValues(options, "category")} onChange={setCategory} />
          <div className="flex gap-2 overflow-x-auto pb-1">
            <Button
              color="secondary"
              variant={status === "all" ? "solid" : "soft"}
              size="sm"
              onClick={() => setStatus("all")}
            >
              Any status
            </Button>
            {uniqueValues(options, "status").map((value) => (
              <Button
                key={value}
                color="secondary"
                variant={status === value ? "solid" : "soft"}
                size="sm"
                onClick={() => setStatus(value)}
              >
                {statusLabels[value] ?? titleize(value)}
              </Button>
            ))}
          </div>
        </div>
        <div className="grid gap-4 p-4 md:grid-cols-[minmax(0,1fr)_300px]">
          <div className="grid auto-rows-max content-start gap-2">
            {filtered.length ? (
              filtered.map((option) => (
                <OptionCard
                  key={option.id}
                  option={option}
                  selected={selected?.id === option.id}
                  onClick={() => setSelectedId(option.id)}
                />
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-[var(--color-border)] p-6 text-center text-sm text-secondary">
                No options match this filter.
              </div>
            )}
          </div>
          <OptionDetail option={selected} action="Compare" secondaryAction="Add to itinerary" />
        </div>
      </article>
    </TripShell>
  );
}

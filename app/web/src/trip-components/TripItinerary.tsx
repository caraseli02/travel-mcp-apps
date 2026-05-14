import React from "react";
import { Alert } from "@openai/apps-sdk-ui/components/Alert";
import { Badge } from "@openai/apps-sdk-ui/components/Badge";
import { Button } from "@openai/apps-sdk-ui/components/Button";
import { compact } from "./format";
import { TripShell } from "./TripShell";
import type { ErrorOutput, ItineraryDay, ItineraryItem, TripItineraryData } from "./types";

const isError = (itinerary: TripItineraryData | ErrorOutput): itinerary is ErrorOutput =>
  "error" in itinerary && Boolean(itinerary.error);

const dayNumber = (day: ItineraryDay, index: number): string => {
  const match = String(day.label ?? "").match(/\d+/);
  return match?.[0] ?? String(index + 1);
};

const itemDetail = (item: ItineraryItem): string[] =>
  compact([item.location_note, item.price_note, item.notes]);

export function TripItinerary({ itinerary }: { itinerary: TripItineraryData | ErrorOutput }) {
  const error = isError(itinerary);
  const safeItinerary = error ? {} : itinerary;
  const days = safeItinerary.days ?? [];
  const scheduled = safeItinerary.counts?.scheduled ?? days.reduce((sum, day) => sum + (day.items?.length ?? 0), 0);
  const [selectedDayIndex, setSelectedDayIndex] = React.useState(0);
  const [selectedItemKey, setSelectedItemKey] = React.useState<string | null>(null);
  const selectedDay = days[selectedDayIndex] ?? days[0];
  const selectedItem =
    selectedDay?.items?.find((item, index) => `${item.title}-${index}` === selectedItemKey) ??
    selectedDay?.items?.[0] ??
    null;

  if (error) {
    return (
      <TripShell eyebrow="Schedule" title="Day by day" error={itinerary.error}>
        {null}
      </TripShell>
    );
  }

  return (
    <TripShell
      eyebrow="Schedule"
      title={safeItinerary.trip?.title || "Day by day"}
      description={`${scheduled} scheduled item${scheduled === 1 ? "" : "s"}.`}
      empty={days.length === 0}
      emptyTitle="No itinerary yet"
      emptyDescription="Scheduled trip items will appear here once the plan has dated commitments."
    >
      <article className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-surface shadow-sm">
        <div className="flex gap-2 overflow-x-auto border-b border-[var(--color-border)] p-3">
          {days.map((day, index) => (
            <Button
              key={`${day.label}-${index}`}
              color="secondary"
              variant={selectedDayIndex === index ? "solid" : "soft"}
              size="sm"
              onClick={() => {
                setSelectedDayIndex(index);
                setSelectedItemKey(null);
              }}
            >
              {day.label || `Day ${index + 1}`}
            </Button>
          ))}
        </div>

        <div>
          {days.map((day, index) => (
            <section
              key={`${day.label}-${index}`}
              className={selectedDayIndex === index ? "grid gap-4 p-4 md:grid-cols-[minmax(0,1fr)_280px]" : "hidden"}
            >
              <div className="min-w-0">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] bg-secondary text-sm font-semibold text-primary">
                    {dayNumber(day, index)}
                  </span>
                  <h2 className="text-base font-semibold text-primary">{day.label || "Scheduled"}</h2>
                  <Badge color="secondary" variant="soft" pill>
                    {day.items?.length ?? 0} items
                  </Badge>
                </div>
                <div className="space-y-2">
                  {(day.items ?? []).map((item, itemIndex) => {
                    const key = `${item.title}-${itemIndex}`;
                    const selected = selectedItemKey === key || (selectedItemKey == null && itemIndex === 0);
                    return (
                      <button
                        type="button"
                        key={key}
                        onClick={() => setSelectedItemKey(key)}
                        className={`grid w-full grid-cols-[64px_minmax(0,1fr)] gap-3 rounded-lg border p-3 text-left transition ${
                          selected
                            ? "border-[var(--color-border-primary-outline)] bg-secondary shadow-sm"
                            : "border-[var(--color-border)] bg-primary hover:border-[var(--color-border-secondary-outline-hover)]"
                        }`}
                      >
                        <p className="pt-0.5 text-xs font-semibold text-tertiary">
                          {item.schedule_label || "Plan"}
                        </p>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-primary">{item.title || "Saved item"}</p>
                          {itemDetail(item).length > 0 ? (
                            <p className="mt-1 text-xs leading-snug text-secondary">{itemDetail(item).join(" · ")}</p>
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedItem ? (
                <aside className="rounded-lg border border-[var(--color-border)] bg-primary p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-tertiary">Focused item</p>
                  <h3 className="mt-1 text-sm font-semibold text-primary">{selectedItem.title}</h3>
                  <p className="mt-1 text-xs leading-snug text-secondary">
                    {itemDetail(selectedItem).join(" · ") || "No extra details yet."}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button color="primary" variant="solid" size="sm">
                      Alternatives
                    </Button>
                    <Button color="secondary" variant="soft" size="sm">
                      Move
                    </Button>
                  </div>
                </aside>
              ) : null}
            </section>
          ))}
        </div>

        {safeItinerary.gaps?.length ? (
          <div className="border-t border-[var(--color-border)] p-4">
            <Alert
              color="warning"
              variant="soft"
              title="Schedule gaps"
              description={safeItinerary.gaps.join(" · ")}
            />
          </div>
        ) : null}
      </article>
    </TripShell>
  );
}

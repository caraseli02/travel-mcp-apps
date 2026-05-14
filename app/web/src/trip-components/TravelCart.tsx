import React from "react";
import { Alert } from "@openai/apps-sdk-ui/components/Alert";
import { Badge } from "@openai/apps-sdk-ui/components/Badge";
import { Button } from "@openai/apps-sdk-ui/components/Button";
import { Check, Minus, Plus } from "lucide-react";
import { money } from "./format";
import { TripShell } from "./TripShell";
import { isTravelError } from "./travel-shared";
import type { ErrorOutput, TravelCartData, TravelCartItem } from "./types";
import { useWidgetState } from "./useWidgetState";

export function TravelCart({ data }: { data: TravelCartData | ErrorOutput }) {
  const defaultItems = "items" in data ? data.items ?? [] : [];
  const [items, setItems] = useWidgetState<TravelCartItem[]>("travel-cart:items", defaultItems);
  const [feedback, setFeedback] = useWidgetState<string | null>("travel-cart:feedback", null);

  React.useEffect(() => {
    if ("items" in data) {
      setItems(data.items ?? []);
      setFeedback(null);
    }
  }, [data, setFeedback, setItems]);

  if (isTravelError(data)) {
    return (
      <TripShell eyebrow="Package" title="Draft Trip Cart" error={data.error}>
        {null}
      </TripShell>
    );
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <TripShell
      eyebrow="Package"
      title={data.trip?.title || "Draft trip cart"}
      description="Mock selected-trip package for review before any real booking step."
      empty={items.length === 0}
      emptyTitle="No selected trip items"
    >
      <article className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-surface shadow-sm">
        <div className="grid gap-4 p-4 md:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className={`grid gap-3 rounded-xl border border-[var(--color-border)] bg-primary p-3 ${
                  item.image_url ? "sm:grid-cols-[72px_1fr_auto]" : "sm:grid-cols-[1fr_auto]"
                }`}
              >
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt=""
                    className="h-[72px] w-[72px] rounded-lg object-cover"
                    loading="lazy"
                  />
                ) : null}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-primary">{item.title}</p>
                    <Badge color={item.ready ? "success" : "warning"} variant="soft">
                      {item.ready ? "Ready" : "Needs review"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-secondary">{item.subtitle}</p>
                  {item.warning ? <p className="mt-2 text-xs text-secondary">{item.warning}</p> : null}
                </div>
                <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                  <p className="text-sm font-semibold text-primary">{money(item.price * item.quantity, data.currency)}</p>
                  <div className="flex items-center gap-2">
                    <Button
                      aria-label={`Decrease ${item.title} quantity`}
                      color="secondary"
                      variant="soft"
                      size="sm"
                      onClick={() =>
                        setItems((current) =>
                          current
                            .map((entry) =>
                              entry.id === item.id
                                ? { ...entry, quantity: entry.quantity - 1 }
                                : entry,
                            )
                            .filter((entry) => entry.quantity > 0),
                        )
                      }
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <span className="w-5 text-center text-sm text-secondary">{item.quantity}</span>
                    <Button
                      aria-label={`Increase ${item.title} quantity`}
                      color="secondary"
                      variant="soft"
                      size="sm"
                      onClick={() =>
                        setItems((current) =>
                          current.map((entry) =>
                            entry.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry,
                          ),
                        )
                      }
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <aside className="rounded-xl border border-[var(--color-border)] bg-primary p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-tertiary">Draft package</p>
            <div className="mt-3 flex items-end justify-between">
              <span className="text-sm text-secondary">Estimated total</span>
              <span className="text-2xl font-semibold text-primary">{money(total, data.currency)}</span>
            </div>
            <div className="mt-4 space-y-2">
              {(data.readiness ?? []).map((item) => (
                <p key={item} className="flex items-center gap-2 text-xs text-secondary">
                  <Check className="h-3.5 w-3.5" />
                  {item}
                </p>
              ))}
            </div>
            {data.warnings?.length ? (
              <div className="mt-4">
                <Alert color="warning" variant="soft" title="Before booking" description={data.warnings.join(" · ")} />
              </div>
            ) : null}
            <div className="mt-4">
              <Button
                color="primary"
                variant="solid"
                size="sm"
                onClick={() => setFeedback("Next steps are ready for review.")}
              >
                Review next steps
              </Button>
            </div>
            {feedback ? <p className="mt-3 text-xs text-secondary">{feedback}</p> : null}
          </aside>
        </div>
      </article>
    </TripShell>
  );
}

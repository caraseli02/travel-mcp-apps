import React from "react";
import { Badge } from "@openai/apps-sdk-ui/components/Badge";
import { Button } from "@openai/apps-sdk-ui/components/Button";
import { Alert } from "@openai/apps-sdk-ui/components/Alert";
import { compact, titleize } from "./format";
import { TripShell } from "./TripShell";
import type { ErrorOutput, TripBoardData, TripBoardItem } from "./types";

const laneLabels: Record<string, string> = {
  open_decisions: "Open",
  inbox: "Inbox",
  shortlisted: "Shortlisted",
  booked: "Booked",
  itinerary_draft: "Itinerary",
  missing_pieces: "Missing",
};

const laneOrder = [
  "open_decisions",
  "shortlisted",
  "booked",
  "itinerary_draft",
  "missing_pieces",
  "inbox",
];

const itemTitle = (item: TripBoardItem | string): string => {
  if (typeof item === "string") return item;
  return item.title || item.raw_content || "Saved option";
};

const itemMeta = (item: TripBoardItem | string): string[] => {
  if (typeof item === "string") return ["Missing piece"];
  return compact([
    item.item_type ? titleize(item.item_type) : null,
    item.day_label,
    item.price_note,
    item.date_note,
    item.location_note,
    item.notes || item.raw_content,
  ]);
};

const isError = (board: TripBoardData | ErrorOutput): board is ErrorOutput =>
  "error" in board && Boolean(board.error);

export function TripBoard({ board }: { board: TripBoardData | ErrorOutput }) {
  const error = isError(board);
  const safeBoard = error ? {} : board;
  const lanes = safeBoard.lanes ?? {};
  const laneKeys = [
    ...laneOrder.filter((key) => Array.isArray(lanes[key])),
    ...Object.keys(lanes).filter((key) => !laneOrder.includes(key)),
  ];
  const total =
    safeBoard.counts?.total ??
    Object.values(lanes).reduce((sum, items) => sum + (Array.isArray(items) ? items.length : 0), 0);
  const committed =
    (Array.isArray(lanes.booked) ? lanes.booked.length : 0) +
    (Array.isArray(lanes.itinerary_draft) ? lanes.itinerary_draft.length : 0);
  const percent = total > 0 ? Math.round((committed / total) * 100) : 0;
  const [activeLane, setActiveLane] = React.useState<string | null>(null);
  const visibleLaneKeys = activeLane ? laneKeys.filter((lane) => lane === activeLane) : laneKeys;

  if (error) {
    return (
      <TripShell eyebrow="Organize" title="Trip Board" error={board.error}>
        {null}
      </TripShell>
    );
  }

  return (
    <TripShell
      eyebrow="Organize"
      title={safeBoard.trip?.title || "Trip Board"}
      description={`${total} saved item${total === 1 ? "" : "s"} across the workspace.`}
      empty={total === 0 && !safeBoard.trip?.title}
      emptyTitle="No trip board data"
    >
      <article className="overflow-hidden rounded-2xl border border-subtle bg-surface shadow-sm">
        <div className="flex flex-col gap-3 border-b border-subtle p-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-secondary">
              {safeBoard.trip?.destination || "Trip workspace"}
            </p>
            <h2 className="heading-md mt-1 text-primary">Planning state</h2>
          </div>
          <div className="flex items-center gap-3">
            <Badge color={percent >= 50 ? "success" : "warning"} pill>
              {percent}% committed
            </Badge>
            <Button color="secondary" variant="soft" size="sm">
              Review gaps
            </Button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto border-b border-subtle p-3">
          <Button
            color="secondary"
            variant={activeLane === null ? "solid" : "soft"}
            size="sm"
            onClick={() => setActiveLane(null)}
          >
            All lanes
          </Button>
          {laneKeys.map((lane) => (
            <Button
              key={lane}
              color="secondary"
              variant={activeLane === lane ? "solid" : "soft"}
              size="sm"
              onClick={() => setActiveLane(lane)}
            >
              {laneLabels[lane] ?? titleize(lane)}
            </Button>
          ))}
        </div>

        <div className="grid gap-px bg-subtle sm:grid-cols-2 xl:grid-cols-4">
          {visibleLaneKeys.map((lane) => {
            const items = Array.isArray(lanes[lane]) ? lanes[lane] : [];
            return (
              <section key={lane} className="min-h-48 bg-surface p-3">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-primary">
                    {laneLabels[lane] ?? titleize(lane)}
                  </h3>
                  <Badge color="secondary" variant="soft" pill>
                    {items.length}
                  </Badge>
                </div>

                {items.length === 0 ? (
                  <div className="grid min-h-28 place-items-center rounded-xl border border-dashed border-subtle text-center text-sm text-tertiary">
                    Nothing here yet
                  </div>
                ) : (
                  <div className="space-y-2">
                    {items.slice(0, 6).map((item, index) => (
                      <div
                        key={typeof item === "string" ? `${lane}-${index}` : item.id ?? `${lane}-${index}`}
                        className="rounded-xl border border-subtle bg-primary p-3"
                      >
                        <p className="text-sm font-semibold text-primary">{itemTitle(item)}</p>
                        {itemMeta(item).length > 0 ? (
                          <p className="mt-1 line-clamp-2 text-xs text-secondary">
                            {itemMeta(item).join(" · ")}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {Array.isArray(lanes.missing_pieces) && lanes.missing_pieces.length > 0 ? (
          <div className="p-3">
            <Alert
              color="warning"
              variant="soft"
              title="Open planning gaps"
              description={lanes.missing_pieces.join(" · ")}
            />
          </div>
        ) : null}
      </article>
    </TripShell>
  );
}

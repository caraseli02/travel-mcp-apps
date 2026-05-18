import React from "react";
import { Badge } from "@openai/apps-sdk-ui/components/Badge";
import { Button } from "@openai/apps-sdk-ui/components/Button";
import { compact, titleize } from "./format";
import { TripShell } from "./TripShell";
import { useCallTool } from "../bridge/useCallTool";
import type { ErrorOutput, TripInboxData } from "./types";

const isError = (inbox: TripInboxData | ErrorOutput): inbox is ErrorOutput =>
  "error" in inbox && Boolean(inbox.error);

export function TripInbox({ inbox }: { inbox: TripInboxData | ErrorOutput }) {
  if (isError(inbox)) {
    return (
      <TripShell eyebrow="Capture" title="Trip Inbox" error={inbox.error}>
        {null}
      </TripShell>
    );
  }

  const items = inbox.items ?? [];

  return (
    <TripShell
      eyebrow="Capture"
      title={inbox.trip?.title || "Trip Inbox"}
      description={`${items.length} saved fragment${items.length === 1 ? "" : "s"} waiting for triage.`}
      empty={items.length === 0}
      emptyTitle="Inbox is empty"
      emptyDescription="Saved travel ideas and notes will appear here before they move to the trip board."
    >
      <article className="rounded-2xl border border-subtle bg-surface shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-subtle p-4">
          <div>
            <h2 className="heading-md text-primary">Saved fragments</h2>
            <p className="mt-1 text-sm text-secondary">Quickly classify raw notes into trip decisions.</p>
          </div>
          <Badge color="info" pill>
            {items.length} inbox
          </Badge>
        </div>

        <div className="divide-y divide-subtle">
          {items.map((item, index) => {
            const meta = compact([item.source_label, item.notes || item.raw_content]);
            return (
              <section key={`${item.title}-${index}`} className="grid gap-3 p-4 sm:grid-cols-[1fr_auto]">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-primary">{item.title || "Saved idea"}</h3>
                    <Badge color="secondary" variant="soft" pill>
                      {titleize(item.item_type)}
                    </Badge>
                  </div>
                  {meta.length > 0 ? <p className="mt-2 text-sm text-secondary">{meta.join(" · ")}</p> : null}
                </div>
                <div className="flex items-center gap-2">
                  <InboxActionButtons item={item} />
                </div>
              </section>
            );
          })}
        </div>
      </article>
    </TripShell>
  );
}

function InboxActionButtons({ item }: { item: any }) {
  const { sendFollowUpMessage } = useCallTool();
  const [shortlistStatus, setShortlistStatus] = React.useState("Shortlist");
  const [addStatus, setAddStatus] = React.useState("Add to board");

  return (
    <>
      <Button
        color="secondary"
        variant="soft"
        size="sm"
        onClick={() => {
          setShortlistStatus("Shortlisted!");
          sendFollowUpMessage(`Shortlist fragment: ${item.title}`);
        }}
      >
        {shortlistStatus}
      </Button>
      <Button
        color="primary"
        variant="solid"
        size="sm"
        onClick={() => {
          setAddStatus("Added!");
          sendFollowUpMessage(`Add fragment to board: ${item.title}`);
        }}
      >
        {addStatus}
      </Button>
    </>
  );
}

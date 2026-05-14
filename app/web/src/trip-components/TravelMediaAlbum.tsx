import React from "react";
import { Badge } from "@openai/apps-sdk-ui/components/Badge";
import { Button } from "@openai/apps-sdk-ui/components/Button";
import { Image, MapPin } from "lucide-react";
import { titleize } from "./format";
import { TripShell } from "./TripShell";
import { isTravelError } from "./travel-shared";
import type { ErrorOutput, TravelMediaItem, TravelOptionsData } from "./types";
import { useWidgetState } from "./useWidgetState";

export function TravelMediaAlbum({ data }: { data: TravelOptionsData | ErrorOutput }) {
  const [activeId, setActiveId] = useWidgetState<string | null>("travel-album:active-id", null);
  const [feedback, setFeedback] = useWidgetState<string | null>("travel-album:feedback", null);

  if (isTravelError(data)) {
    return (
      <TripShell eyebrow="Inspire" title="Travel Album" error={data.error}>
        {null}
      </TripShell>
    );
  }

  const media = data.media ?? [];
  const active = media.find((item) => item.id === activeId) ?? media[0] ?? null;

  return (
    <TripShell
      eyebrow="Inspire"
      title="Trip inspiration album"
      description="Review destination cues and saved places before committing the plan."
      empty={media.length === 0}
      emptyTitle="No trip media"
    >
      <article className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-surface shadow-sm">
        {active ? (
          <AlbumHero item={active} onAttach={() => setFeedback(`Attached: ${active.title}`)} feedback={feedback} />
        ) : null}
        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
          {media.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => {
                setActiveId(item.id);
                setFeedback(null);
              }}
              className={`rounded-xl border p-2 text-left transition ${
                active?.id === item.id
                  ? "border-[var(--color-border-primary-outline)] bg-secondary"
                  : "border-[var(--color-border)] bg-primary"
              }`}
            >
              <AlbumSwatch item={item} compact />
              <p className="mt-2 text-sm font-semibold text-primary">{item.title}</p>
              <p className="text-xs text-secondary">{item.subtitle}</p>
            </button>
          ))}
        </div>
      </article>
    </TripShell>
  );
}

function AlbumHero({
  item,
  onAttach,
  feedback,
}: {
  item: TravelMediaItem;
  onAttach: () => void;
  feedback: string | null;
}) {
  return (
    <div className="grid gap-5 border-b border-[var(--color-border)] p-4 md:grid-cols-[minmax(0,1fr)_360px]">
      <AlbumSwatch item={item} />
      <div className="flex min-w-0 flex-col items-start justify-between rounded-xl border border-[var(--color-border)] bg-primary p-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge color="info" variant="soft">
              <Image className="h-3.5 w-3.5" />
              {titleize(item.category)}
            </Badge>
            <Badge color="secondary" variant="soft">
              <MapPin className="h-3.5 w-3.5" />
              {item.location}
            </Badge>
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-tertiary">Selected inspiration</p>
          <h2 className="mt-1 text-xl font-semibold leading-tight text-primary">{item.title}</h2>
          <p className="mt-3 text-sm leading-6 text-secondary">{item.description}</p>
        </div>
        <div className="mt-5 w-full">
          <div className="mb-3 grid gap-2 text-xs text-secondary sm:grid-cols-2">
            <div className="rounded-lg bg-secondary px-3 py-2">
              <span className="block font-semibold text-primary">Use for</span>
              <span>{item.subtitle}</span>
            </div>
            <div className="rounded-lg bg-secondary px-3 py-2">
              <span className="block font-semibold text-primary">Context</span>
              <span>{item.location}</span>
            </div>
          </div>
          <Button color="primary" variant="solid" size="sm" onClick={onAttach}>
            Attach to trip
          </Button>
          {feedback ? <p className="mt-3 text-xs text-secondary">{feedback}</p> : null}
        </div>
      </div>
    </div>
  );
}

function AlbumSwatch({ item, compact }: { item: TravelMediaItem; compact?: boolean }) {
  return (
    <div className={`relative overflow-hidden rounded-xl ${compact ? "aspect-[4/3]" : "min-h-64"}`}>
      <img src={item.image_url} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
      <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-30`} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-black/70 shadow-sm">
        {item.location}
      </div>
    </div>
  );
}

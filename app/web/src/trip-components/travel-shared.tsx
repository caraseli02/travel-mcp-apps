import React from "react";
import { Badge } from "@openai/apps-sdk-ui/components/Badge";
import { Button } from "@openai/apps-sdk-ui/components/Button";
import { CalendarDays, CircleDollarSign, MapPin, Star } from "lucide-react";
import { compact, money, titleize } from "./format";
import type { ErrorOutput, TravelCartData, TravelOption, TravelOptionsData } from "./types";

export const isTravelError = (value: TravelOptionsData | TravelCartData | ErrorOutput): value is ErrorOutput =>
  "error" in value && Boolean(value.error);

export const categoryLabels: Record<string, string> = {
  lodging: "Lodging",
  food: "Food",
  activity: "Activities",
  transit: "Transit",
  neighborhood: "Areas",
  flight: "Flights",
};

export const statusLabels: Record<string, string> = {
  inbox: "Inbox",
  shortlisted: "Shortlisted",
  recommended: "Recommended",
  selected: "Selected",
  booked: "Booked",
  open: "Open",
};

export const optionMeta = (option: TravelOption): string[] =>
  compact([
    option.neighborhood,
    option.schedule_label,
    option.price_note,
    option.distance_note,
    option.source,
  ]);

export const uniqueValues = (options: TravelOption[], key: keyof TravelOption): string[] =>
  Array.from(new Set(options.map((option) => option[key]).filter(Boolean).map(String)));

export const selectedOrFirst = (options: TravelOption[], selectedId: string | null): TravelOption | null =>
  options.find((option) => option.id === selectedId) ?? options[0] ?? null;

export function CategoryFilters({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      <Button
        color="secondary"
        variant={value === "all" ? "solid" : "soft"}
        size="sm"
        onClick={() => onChange("all")}
      >
        All
      </Button>
      {options.map((option) => (
        <Button
          key={option}
          color="secondary"
          variant={value === option ? "solid" : "soft"}
          size="sm"
          onClick={() => onChange(option)}
        >
          {categoryLabels[option] ?? titleize(option)}
        </Button>
      ))}
    </div>
  );
}

export function OptionCard({
  option,
  selected,
  onClick,
}: {
  option: TravelOption;
  selected?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <div className="flex items-start gap-3">
      {option.image_url ? (
        <img
          src={option.image_url}
          alt=""
          className="h-16 w-16 flex-none rounded-lg object-cover"
          loading="lazy"
        />
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-primary">{option.title}</p>
            <p className="mt-1 text-xs text-secondary">{option.subtitle}</p>
          </div>
          {option.score ? (
            <Badge color={option.score >= 90 ? "success" : "secondary"} variant="soft" pill>
              {option.score}
            </Badge>
          ) : null}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Badge color="secondary" variant="soft">
            {categoryLabels[option.category] ?? titleize(option.category)}
          </Badge>
          {option.status ? (
            <Badge color={option.status === "booked" ? "success" : "info"} variant="soft">
              {statusLabels[option.status] ?? titleize(option.status)}
            </Badge>
          ) : null}
        </div>
        {optionMeta(option).length ? (
          <p className="mt-3 line-clamp-2 text-xs leading-snug text-secondary">{optionMeta(option).join(" · ")}</p>
        ) : null}
      </div>
    </div>
  );

  if (!onClick) {
    return <div className="rounded-xl border border-[var(--color-border)] bg-primary p-3">{content}</div>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border p-3 text-left transition ${
        selected
          ? "border-[var(--color-border-primary-outline)] bg-secondary shadow-sm"
          : "border-[var(--color-border)] bg-primary hover:border-[var(--color-border-secondary-outline-hover)]"
      }`}
    >
      {content}
    </button>
  );
}

export function OptionDetail({
  option,
  action,
  secondaryAction,
}: {
  option: TravelOption | null;
  action?: string;
  secondaryAction?: string;
}) {
  const [feedback, setFeedback] = React.useState<string | null>(null);

  React.useEffect(() => setFeedback(null), [option?.id]);

  if (!option) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--color-border)] p-4 text-sm text-secondary">
        Select an item to see details.
      </div>
    );
  }

  return (
    <aside className="rounded-xl border border-[var(--color-border)] bg-primary p-4">
      {option.image_url ? (
        <img
          src={option.image_url}
          alt=""
          className="mb-4 aspect-[4/3] w-full rounded-xl object-cover"
          loading="lazy"
        />
      ) : null}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-tertiary">Focused option</p>
          <h3 className="mt-1 text-base font-semibold text-primary">{option.title}</h3>
        </div>
        {option.recommended ? (
          <Badge color="success" variant="soft">
            <Star className="h-3.5 w-3.5" />
            Pick
          </Badge>
        ) : null}
      </div>
      <p className="mt-2 text-sm text-secondary">{option.description || option.subtitle}</p>
      <div className="mt-3 grid gap-2 text-xs text-secondary">
        {option.price ? (
          <p className="flex items-center gap-2">
            <CircleDollarSign className="h-3.5 w-3.5" />
            {money(option.price, option.currency)}
          </p>
        ) : null}
        {option.schedule_label ? (
          <p className="flex items-center gap-2">
            <CalendarDays className="h-3.5 w-3.5" />
            {option.schedule_label}
          </p>
        ) : null}
        {option.neighborhood ? (
          <p className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5" />
            {option.neighborhood}
          </p>
        ) : null}
      </div>
      {option.pros?.length || option.cons?.length ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {option.pros?.length ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-tertiary">Pros</p>
              <ul className="mt-1 space-y-1 text-xs text-secondary">
                {option.pros.map((item) => (
                  <li key={item}>+ {item}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {option.cons?.length ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-tertiary">Tradeoffs</p>
              <ul className="mt-1 space-y-1 text-xs text-secondary">
                {option.cons.map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        {action ? (
          <Button color="primary" variant="solid" size="sm" onClick={() => setFeedback(`${action}: ${option.title}`)}>
            {action}
          </Button>
        ) : null}
        {secondaryAction ? (
          <Button
            color="secondary"
            variant="soft"
            size="sm"
            onClick={() => setFeedback(`${secondaryAction}: ${option.title}`)}
          >
            {secondaryAction}
          </Button>
        ) : null}
      </div>
      {feedback ? <p className="mt-3 text-xs text-secondary">{feedback}</p> : null}
    </aside>
  );
}

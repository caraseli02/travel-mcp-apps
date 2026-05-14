import React from "react";
import { Alert } from "@openai/apps-sdk-ui/components/Alert";
import { EmptyMessage } from "@openai/apps-sdk-ui/components/EmptyMessage";

interface TripShellProps {
  eyebrow: string;
  title: string;
  description?: string;
  empty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  error?: string;
  children: React.ReactNode;
}

export function TripShell({
  eyebrow,
  title,
  description,
  empty,
  emptyTitle = "No trip data",
  emptyDescription = "This widget is waiting for structured trip output.",
  error,
  children,
}: TripShellProps) {
  return (
    <section className="mx-auto w-full max-w-4xl px-3 py-3 text-primary antialiased">
      <header className="mb-3 flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
          {eyebrow}
        </p>
        <h1 className="heading-lg text-primary">{title}</h1>
        {description ? <p className="text-sm text-secondary">{description}</p> : null}
      </header>

      {error ? (
        <Alert color="danger" variant="soft" title="Unable to render trip data" description={error} />
      ) : empty ? (
        <EmptyMessage fill="static" className="min-h-64 rounded-2xl border border-subtle bg-surface">
          <EmptyMessage.Title>{emptyTitle}</EmptyMessage.Title>
          <EmptyMessage.Description>{emptyDescription}</EmptyMessage.Description>
        </EmptyMessage>
      ) : (
        children
      )}
    </section>
  );
}

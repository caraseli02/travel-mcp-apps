import React from "react";
import { Badge } from "@openai/apps-sdk-ui/components/Badge";
import { Button } from "@openai/apps-sdk-ui/components/Button";
import { Alert } from "@openai/apps-sdk-ui/components/Alert";
import { money, titleize } from "./format";
import { TripShell } from "./TripShell";
import type { BudgetRow, CategoryTotal, ErrorOutput, TripBudgetData } from "./types";

const isError = (budget: TripBudgetData | ErrorOutput): budget is ErrorOutput =>
  "error" in budget && Boolean(budget.error);

const rowLabel = (row: BudgetRow | CategoryTotal): string =>
  "title" in row ? row.title : titleize(row.category);

export function TripBudget({ budget }: { budget: TripBudgetData | ErrorOutput }) {
  if (isError(budget)) {
    return (
      <TripShell eyebrow="Budget" title="Spending tracker" error={budget.error}>
        {null}
      </TripShell>
    );
  }

  const rows = budget.rows?.length ? budget.rows : budget.category_totals ?? [];
  const currency = budget.currency || "EUR";
  const spent = budget.spent ?? 0;
  const target = budget.target ?? 0;
  const percent = target > 0 ? Math.min(100, Math.round((spent / target) * 100)) : budget.percent_used ?? 0;

  return (
    <TripShell
      eyebrow="Budget"
      title={budget.trip?.title || "Spending tracker"}
      description="Only the values that change the next decision are surfaced."
      empty={rows.length === 0 && !budget.trip?.title}
      emptyTitle="No budget data"
    >
      <article className="overflow-hidden rounded-2xl border border-subtle bg-surface shadow-sm">
        <div className="grid gap-4 border-b border-subtle p-4 md:grid-cols-[1fr_220px]">
          <div>
            <p className="text-sm text-secondary">Planned spend</p>
            <div className="mt-1 text-3xl font-semibold text-primary">
              {money(spent, currency)}
              {target > 0 ? <span className="text-base font-normal text-tertiary"> / {money(target, currency)}</span> : null}
            </div>
            <p className="mt-2 text-sm text-secondary">
              {target > 0
                ? `${money(Math.abs(budget.remaining ?? target - spent), currency)} ${
                    (budget.remaining ?? target - spent) >= 0 ? "remaining" : "over target"
                  }`
                : "Add a target to compare planned spending."}
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-subtle bg-primary p-4">
            <div className="h-20 w-20 rounded-full bg-[conic-gradient(var(--color-primary)_0deg,var(--color-primary)_var(--trip-budget-degrees),var(--color-bg-secondary)_var(--trip-budget-degrees),var(--color-bg-secondary)_360deg)]" style={{ "--trip-budget-degrees": `${Math.round((percent / 100) * 360)}deg` } as React.CSSProperties} />
            <div>
              <Badge color={percent > 90 ? "warning" : "success"} pill>
                {percent}% used
              </Badge>
              <p className="mt-2 text-sm text-secondary">Budget health</p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-subtle">
          {rows.slice(0, 6).map((row, index) => {
            const amount = row.amount ?? 0;
            const width = target > 0 ? Math.min(100, Math.round((amount / target) * 100)) : 35;
            return (
              <div key={`${rowLabel(row)}-${index}`} className="grid gap-3 p-4 sm:grid-cols-[140px_1fr_90px] sm:items-center">
                <div className="text-sm font-semibold text-primary">{rowLabel(row)}</div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <span className="block h-full rounded-full bg-primary" style={{ width: `${width}%` }} />
                </div>
                <div className="text-right text-sm font-semibold text-primary">{money(amount, currency)}</div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-subtle bg-secondary p-4">
          <Button color="secondary" variant="soft" size="sm">
            Find cheaper options
          </Button>
          <Button color="primary" variant="solid" size="sm">
            Set alerts
          </Button>
        </div>

        {percent > 90 ? (
          <div className="p-4">
            <Alert
              color="warning"
              variant="soft"
              title="Budget is tight"
              description="Prioritize booked items and compare flexible plans before adding more holds."
            />
          </div>
        ) : null}
      </article>
    </TripShell>
  );
}

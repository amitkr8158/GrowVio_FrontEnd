// Shared visual building blocks for Creator Studio — inspired by the
// growvios-knowledge-garden reference project, adapted to this app's
// existing (HSL) design tokens instead of introducing a parallel theme.
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("surface-card overflow-hidden", className)}>
      <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <h2 className="text-[15px] font-semibold text-ink-1">{title}</h2>
        {action}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-surface-3", className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-primary transition-[width] duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

const TIER_TONE: Record<string, string> = {
  FREE: "bg-success-light text-success",
  STARTER: "bg-primary-light text-primary-dark",
  PREMIUM: "bg-warning-light text-warning",
  PRO: "bg-pro-light text-pro",
};

export function TierBadge({ tier }: { tier: string }) {
  return (
    <span
      className={cn(
        "rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide",
        TIER_TONE[tier] ?? "bg-surface-3 text-ink-3",
      )}
    >
      {tier}
    </span>
  );
}

const STATUS_TONE: Record<string, string> = {
  Published: "bg-success-light text-success",
  Approved: "bg-success-light text-success",
  Active: "bg-success-light text-success",
  Healthy: "bg-success-light text-success",
  "In Review": "bg-primary-light text-primary-dark",
  Resubmitted: "bg-primary-light text-primary-dark",
  Draft: "bg-surface-3 text-ink-3",
  Pending: "bg-warning-light text-warning",
  "Changes Requested": "bg-warning-light text-warning",
  Warning: "bg-warning-light text-warning",
  Failed: "bg-danger-light text-danger",
  Suspended: "bg-danger-light text-danger",
  Critical: "bg-danger-light text-danger",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
        STATUS_TONE[status] ?? "bg-surface-3 text-ink-3",
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "default",
}: {
  icon?: React.ElementType;
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "up" | "down";
}) {
  return (
    <div className="surface-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-ink-3">{label}</p>
        {Icon && <Icon className="size-4 text-primary" />}
      </div>
      <p className="mt-3 text-[26px] leading-none font-semibold tracking-tight text-ink-1">{value}</p>
      {hint && (
        <p
          className={cn(
            "mt-2 text-xs font-medium",
            tone === "up" ? "text-success" : tone === "down" ? "text-danger" : "text-ink-3",
          )}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

export function DataTable({ columns, rows }: { columns: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            {columns.map((c) => (
              <th
                key={c}
                className="px-4 py-3 text-[11px] font-semibold tracking-[0.1em] text-ink-3 uppercase"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border/70 last:border-0 hover:bg-surface-2">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3.5 align-middle">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border p-8 text-center">
      <p className="text-sm font-semibold text-ink-1">{title}</p>
      <p className="mx-auto mt-1.5 max-w-sm text-xs text-ink-3">{body}</p>
      {action ? <div className="mt-4 flex justify-center gap-2">{action}</div> : null}
    </div>
  );
}

export function Section({
  title,
  hint,
  action,
  children,
  className,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl border border-border bg-card", className)}>
      <header className="flex items-center gap-3 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-[0.12em] text-ink-3 uppercase">{title}</p>
          {hint ? <p className="truncate text-xs text-ink-3">{hint}</p> : null}
        </div>
        {action ? <div className="ml-auto">{action}</div> : null}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

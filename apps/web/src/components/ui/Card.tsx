import type { PropsWithChildren, ReactNode } from "react";

export function Card({ title, action, children }: PropsWithChildren<{ title?: string; action?: ReactNode }>) {
  return (
    <section className="rounded-lg border border-line bg-panel p-5 shadow-soft">
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-base font-semibold text-ink">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

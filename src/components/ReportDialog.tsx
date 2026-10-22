"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";
import { REPORT_REASONS, fieldErrors, reportSchema } from "@/lib/validation";
import { Icon } from "./Icon";
import { useStore } from "./StoreProvider";

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const t = setTimeout(() => ref.current?.querySelector<HTMLElement>("select, input, textarea, button")?.focus(), 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && ref.current) {
        const f = [...ref.current.querySelectorAll<HTMLElement>("button, select, input, textarea, a[href]")].filter((x) => !x.hasAttribute("disabled"));
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      prev?.focus();
    };
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] grid place-items-end sm:place-items-center">
          <motion.div className="absolute inset-0 bg-ink/35" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby={id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="paper relative max-h-[90vh] w-full overflow-y-auto rounded-t-[28px] border border-ink/15 p-6 shadow-lift sm:max-w-lg sm:rounded-[28px]"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <h2 id={id} className="text-2xl font-semibold">{title}</h2>
              <button className="btn-ghost -mr-2 -mt-1 p-2" onClick={onClose} aria-label="Close dialog"><Icon name="close" /></button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function ReportButton({
  targetType,
  targetId,
  label = "Report incorrect information",
  compact = false,
}: {
  targetType: "cafe" | "review";
  targetId: string;
  label?: string;
  compact?: boolean;
}) {
  const { report, data } = useStore();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const already = data.reports.some((r) => r.targetId === targetId);
  const reasons = Object.entries(REPORT_REASONS).filter(([k]) =>
    targetType === "review" ? ["inappropriate", "spam", "other"].includes(k) : !["inappropriate", "spam"].includes(k),
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = reportSchema.safeParse({ targetType, targetId, reason, details: details || undefined });
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    setBusy(true);
    const ok = await report(parsed.data);
    setBusy(false);
    if (ok) {
      setOpen(false);
      setReason("");
      setDetails("");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={already}
        className={compact ? "inline-flex items-center gap-1 font-bold text-ink-soft hover:text-ink disabled:opacity-60" : "btn-ghost text-sm"}
      >
        <Icon name="flag" size={compact ? 14 : 17} /> {already ? "Reported — thanks" : label}
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={targetType === "cafe" ? "Report a problem" : "Report this review"}>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <p className="text-sm text-ink-soft">
            Reports go to our moderators. We review them before changing anything, so the map stays trustworthy.
          </p>
          <div>
            <label htmlFor="report-reason" className="label">What&apos;s wrong?</label>
            <select id="report-reason" className="field" value={reason} onChange={(e) => setReason(e.target.value)} aria-invalid={!!errors.reason} aria-describedby={errors.reason ? "report-reason-err" : undefined}>
              <option value="">Choose a reason…</option>
              {reasons.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            {errors.reason && <p id="report-reason-err" className="mt-1 text-sm font-semibold text-[#9C4E3A]">Please choose a reason.</p>}
          </div>
          <div>
            <label htmlFor="report-details" className="label">Details <span className="font-normal text-ink-faint">(optional)</span></label>
            <textarea id="report-details" className="field min-h-[96px]" maxLength={500} value={details} onChange={(e) => setDetails(e.target.value)} placeholder="e.g. They moved two blocks down, across the plaza." />
            {errors.details && <p className="mt-1 text-sm font-semibold text-[#9C4E3A]">{errors.details}</p>}
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-soft" onClick={() => setOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={busy}>{busy ? "Sending…" : "Send report"}</button>
          </div>
        </form>
      </Modal>
    </>
  );
}

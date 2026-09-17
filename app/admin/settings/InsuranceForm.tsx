"use client";

import { useActionState } from "react";
import { saveInsuranceAction } from "@/app/admin/actions";
import { buttonCls, inputCls, labelCls } from "@/components/portal/Shell";
import type { InsuranceRecord } from "@/lib/portal/types";

const FIELDS: { name: keyof InsuranceRecord; label: string; type?: string; wide?: boolean; placeholder?: string }[] = [
  { name: "insurer", label: "Insurer" },
  { name: "policyReference", label: "Policy number" },
  { name: "namedInsured", label: "Named insured", placeholder: "Arasaka Inc." },
  { name: "territories", label: "Provinces covered and claim jurisdictions", placeholder: "All of Canada" },
  { name: "effectiveDate", label: "Effective date", type: "date" },
  { name: "expiryDate", label: "Expiry date", type: "date" },
  { name: "liabilityLimits", label: "General and professional liability limits and deductibles", wide: true, placeholder: "CGL C$2,000,000 per occurrence; professional liability C$1,000,000; deductible C$1,000" },
  { name: "recordingLossCoverage", label: "Lost recordings, recovery and reshoot protection", wide: true },
];

export default function InsuranceForm({ initial }: { initial: InsuranceRecord | null }) {
  const [state, action, pending] = useActionState(saveInsuranceAction, null);
  return (
    <form action={action} className="grid gap-4 md:grid-cols-2">
      {FIELDS.map((f) => (
        <div key={f.name} className={f.wide ? "md:col-span-2" : ""}>
          <label className={labelCls}>{f.label}</label>
          {f.wide ? (
            <textarea name={f.name} rows={2} required className={inputCls} defaultValue={initial?.[f.name] ?? ""} placeholder={f.placeholder} />
          ) : (
            <input name={f.name} type={f.type ?? "text"} required className={inputCls} defaultValue={initial?.[f.name] ?? (f.name === "namedInsured" ? "Arasaka Inc." : "")} placeholder={f.placeholder} />
          )}
        </div>
      ))}
      <div className="flex items-center gap-4 md:col-span-2">
        <button className={buttonCls} disabled={pending}>{pending ? "Saving…" : "Save insurance record"}</button>
        {state?.ok && <span className="text-sm text-emerald-300">Saved</span>}
        {state?.error && <span className="text-sm text-red-300">{state.error}</span>}
      </div>
    </form>
  );
}

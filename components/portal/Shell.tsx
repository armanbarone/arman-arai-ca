import Link from "next/link";
import { signOutAction } from "@/app/portal/actions";

export function PortalShell({ children, home, email, admin }: { children: React.ReactNode; home: string; email?: string; admin?: boolean }) {
  return (
    <div className="min-h-screen bg-ivory text-cream">
      <header className="border-b border-dust">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4">
          <Link href={home} className="font-serif text-xl tracking-wide text-cream">
            Arman Arai <span className="ml-2 align-middle font-sans text-[10px] uppercase tracking-[0.28em] text-rose">{admin ? "Admin" : "Portal"}</span>
          </Link>
          {email && (
            <div className="flex items-center gap-4 text-xs text-blush">
              <span className="hidden sm:inline">{email}</span>
              <form action={signOutAction}>
                <button className="uppercase tracking-[0.18em] hover:text-cream">Sign out</button>
              </form>
            </div>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-10">{children}</main>
      <footer className="mx-auto max-w-5xl px-5 pb-10 text-xs leading-relaxed text-slate">
        Arasaka Inc., operating as Arman Arai · 1529 West Pender St, Vancouver, BC V6G 3J3 · +1 (778) 302-5231 · i@armanarai.com ·{" "}
        <Link href="/privacy-policy" className="underline hover:text-cream">Privacy policy</Link>
      </footer>
    </div>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 font-sans text-[11px] uppercase tracking-[0.26em] text-rose">{children}</p>;
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`min-w-0 rounded-sm border border-dust bg-parchment p-5 sm:p-6 ${className}`}>{children}</section>;
}

export const inputCls =
  "w-full rounded-sm border border-dust bg-linen px-3 py-2 text-sm text-cream placeholder:text-slate focus:border-rose focus:outline-none";
export const labelCls = "mb-1 block text-[11px] uppercase tracking-[0.16em] text-blush";
export const buttonCls =
  "inline-flex items-center justify-center rounded-sm bg-rose px-5 py-2.5 text-xs font-normal uppercase tracking-[0.2em] text-ink transition hover:bg-cream disabled:opacity-50";
export const ghostButtonCls =
  "inline-flex items-center justify-center rounded-sm border border-dust px-4 py-2 text-xs uppercase tracking-[0.18em] text-blush transition hover:border-rose hover:text-cream disabled:opacity-50";

export function StatusPill({ status }: { status: string }) {
  const label = status.replace(/_/g, " ");
  const tone = ["paid", "booked", "done", "signed", "completed"].includes(status)
    ? "border-emerald-700/60 text-emerald-300"
    : ["overdue", "failed", "cancelled"].includes(status)
      ? "border-red-800/70 text-red-300"
      : "border-dust text-blush";
  return <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.14em] ${tone}`}>{label}</span>;
}

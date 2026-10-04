import Link from "next/link";
import { signOutAction } from "@/app/portal/actions";
import PortalNavigation from "./PortalNavigation";
import "./wedding-portal.css";
export function PortalShell({
  children,
  home,
  email,
  admin,
  bookingRef,
  preview = false,
}: {
  children: React.ReactNode;
  home: string;
  email?: string;
  admin?: boolean;
  bookingRef?: string;
  preview?: boolean;
}) {
  return (
    <div className={`wp ${email ? "wp-with-nav" : "wp-login-shell"}`}>
      <a className="wp-skip" href="#portal-content">
        Skip to content
      </a>
      {email && (
        <aside className="wp-sidebar">
          <Link href={home} className="wp-brand">
            Arman Arai
            <span>{admin ? "Wedding studio" : "Your wedding portal"}</span>
          </Link>
          <PortalNavigation
            admin={!!admin}
            bookingRef={bookingRef}
            preview={preview}
          />
          <div className="wp-sidebar-foot">
            <p>Need a hand?</p>
            <a href="mailto:i@armanarai.com">Email Arman ↗</a>
            <small>Private and secure</small>
          </div>
        </aside>
      )}
      <div className="wp-workspace">
        <header className="wp-topbar">
          {!email ? (
            <Link href={home} className="wp-brand">
              Arman Arai<span>Wedding portal</span>
            </Link>
          ) : (
            <span className="wp-top-label">
              {admin ? "Studio workspace" : "A little less to keep track of."}
            </span>
          )}
          <div className="wp-account">
            {preview && <span className="wp-badge">Sample preview</span>}
            {email && (
              <>
                <span className="wp-email">{email}</span>
                {!preview && (
                  <form action={signOutAction}>
                    <button className="wp-text-button">Sign out</button>
                  </form>
                )}
              </>
            )}
          </div>
        </header>
        <main id="portal-content" className="wp-main">
          {children}
        </main>
        <footer className="wp-footer">
          <span>© Arasaka Inc. operating as Arman Arai</span>
          <Link href="/privacy-policy">Privacy policy</Link>
          <a href="mailto:i@armanarai.com">i@armanarai.com</a>
        </footer>
      </div>
    </div>
  );
}
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="wp-eyebrow">{children}</p>;
}
export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={`wp-card ${className}`}>{children}</section>;
}
export const inputCls = "wp-input",
  labelCls = "wp-label",
  buttonCls = "wp-button",
  ghostButtonCls = "wp-button wp-button-secondary";
const labels: Record<string, string> = {
  contract_sent: "Awaiting signatures",
  partially_signed: "One partner signed",
  partial: "Awaiting partner",
  issued: "Ready to review",
  executed: "Signed by everyone",
  in_planning: "Planning underway",
  signed: "Agreement signed",
  booked: "Date reserved",
  todo: "To do",
  in_progress: "In progress",
  not_applicable: "Not included",
  submitted: "With the studio",
  draft: "Draft",
  paid: "Paid",
  partially_paid: "Partly paid",
};
export function StatusPill({ status }: { status: string }) {
  const tone = [
    "paid",
    "booked",
    "done",
    "signed",
    "executed",
    "completed",
    "reviewed",
  ].includes(status)
    ? "success"
    : ["overdue", "failed", "cancelled", "withdrawn"].includes(status)
      ? "danger"
      : ["draft", "scheduled", "todo"].includes(status)
        ? "neutral"
        : "attention";
  return (
    <span className={`wp-pill wp-pill-${tone}`}>
      {labels[status] || status.replace(/_/g, " ")}
    </span>
  );
}

import { PortalShell } from "@/components/portal/Shell";
import LoginForm from "./LoginForm";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; expired?: string }> }) {
  const { next, expired } = await searchParams;
  return (
    <PortalShell home="/portal/login">
      <div className="mx-auto max-w-md py-10">
        <p className="mb-2 text-[11px] uppercase tracking-[0.26em] text-rose">Private client portal</p>
        <h1 className="mb-4 font-serif text-4xl font-light">Sign in</h1>
        <p className="mb-8 text-sm leading-relaxed text-blush">
          Enter the email address on your booking and we will send you a one-time sign-in link. There is no password to remember.
        </p>
        {expired && (
          <p className="mb-6 rounded-sm border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-200">
            That link has expired or was already used. Request a new one below.
          </p>
        )}
        <LoginForm next={next ?? ""} />
      </div>
    </PortalShell>
  );
}

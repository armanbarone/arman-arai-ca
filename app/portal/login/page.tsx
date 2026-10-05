import { PortalShell } from "@/components/portal/Shell";
import LoginForm from "./LoginForm";

export const metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; expired?: string }>;
}) {
  const { next, expired } = await searchParams;
  return (
    <PortalShell home="/portal/login">
      <div className="wp-login-card">
        <p className="wp-eyebrow">Your private wedding portal</p>
        <h1>Welcome back.</h1>
        <p>
          Your agreements, payments and wedding plans are here. Enter the email
          on your booking to receive a secure sign-in link.
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

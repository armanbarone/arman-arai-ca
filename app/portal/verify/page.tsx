import { redirect } from "next/navigation";
import { PortalShell, buttonCls } from "@/components/portal/Shell";
import { inspectLoginToken } from "@/lib/portal/auth";
import { consumeLinkAction } from "../actions";

export const metadata = { title: "Continue" };

// Email security scanners open links before people do. Opening this page does
// not use up the link; only pressing the button does.
export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const { t } = await searchParams;
  const payload = t ? await inspectLoginToken(t) : null;
  if (!payload) redirect("/portal/login?expired=1");

  return (
    <PortalShell home="/portal/login">
      <div className="mx-auto max-w-md py-16 text-center">
        <h1 className="mb-4 font-serif text-4xl font-light">Welcome back</h1>
        <p className="mb-8 text-sm text-blush">Signing in as {payload.e}</p>
        <form action={consumeLinkAction}>
          <input type="hidden" name="t" value={t} />
          <button className={buttonCls}>Continue to my portal</button>
        </form>
      </div>
    </PortalShell>
  );
}

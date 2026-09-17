import type { Metadata } from "next";
import { PortalShell } from "@/components/portal/Shell";
import { requireAdmin } from "@/lib/portal/auth";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Arman Arai admin" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false, noimageindex: true } },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  return (
    <PortalShell home="/admin" email={session.email} admin>
      {children}
    </PortalShell>
  );
}
